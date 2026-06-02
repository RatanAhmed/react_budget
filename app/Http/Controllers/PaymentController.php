<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\Payment\Drivers\CardDriver;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    // ── Active gateways (for PaymentModal) ───────────────────────────────────

    public function gateways()
    {
        return response()->json(
            $this->paymentService->activeGateways()
                ->map(fn ($g) => [
                    'id'          => $g->id,
                    'name'        => $g->name,
                    'slug'        => $g->slug,
                    'logo'        => $g->logo,
                    'color'       => $g->color,
                    'description' => $g->description,
                    'is_sandbox'  => $g->is_sandbox,
                    'settings'    => $g->settings,
                ])
        );
    }

    // ── Initiate payment ──────────────────────────────────────────────────────

    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'gateway'          => 'required|string|exists:payment_gateways,slug',
            'amount'           => 'required|numeric|min:1',
            'phone'            => 'nullable|string|max:20',
            'note'             => 'nullable|string|max:255',
            'payable_type'     => 'nullable|string',
            'payable_id'       => 'nullable|integer',
            'callback_url'     => 'nullable|url',
            'customer_name'    => 'nullable|string|max:100',
            'customer_email'   => 'nullable|email|max:150',
            'address'          => 'nullable|string|max:255',
            'product_category' => 'nullable|string|max:100',
        ]);

        try {
            $result = $this->paymentService
                ->via($validated['gateway'])
                ->initiate([...$validated, 'user_id' => auth()->id()]);

            $transaction = $result['transaction'];
            $redirectUrl = $result['redirect_url'];

            if (!$redirectUrl) {
                return response()->json([
                    'status'  => 'completed',
                    'txn_id'  => $transaction->txn_id,
                    'message' => 'Cash payment recorded.',
                ]);
            }

            return response()->json([
                'status'       => 'redirect',
                'txn_id'       => $transaction->txn_id,
                'redirect_url' => $redirectUrl,
            ]);

        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
        }
    }

    // ── Gateway callback ──────────────────────────────────────────────────────
    //
    // SSL Commerz POSTs to success_url / fail_url / cancel_url.
    // bKash and Nagad redirect with GET query params.
    // We accept both methods here.

    public function callback(Request $request, string $gateway)
    {
        $txnId = $request->input('txn') ?? $request->query('txn');
        $transaction = PaymentTransaction::where('txn_id', $txnId)->firstOrFail();

        // Merge GET + POST data so both bKash/Nagad (GET) and SSL Commerz (POST) work
        $callbackData = array_merge($request->query(), $request->post());

        $success = $this->paymentService
            ->via($gateway)
            ->verify($transaction, $callbackData);

        // Refresh to get updated paid_at
        $transaction->refresh();

        return Inertia::render('Payment/Result', [
            'success' => $success,
            'txn_id'  => $transaction->txn_id,
            'amount'  => $transaction->amount,
            'gateway' => $gateway,
            'paid_at' => $transaction->paid_at?->toDateTimeString(),
        ]);
    }

    // ── SSL Commerz IPN (server-to-server, most authoritative) ───────────────
    //
    // SSL Commerz POSTs to this URL independently of the user's browser.
    // This is the most reliable way to confirm payment — even if the user
    // closes the browser before being redirected back.

    public function ipn(Request $request, string $gateway)
    {
        if ($gateway !== 'card') {
            return response()->json(['status' => 'ignored'], 200);
        }

        $gateway = PaymentGateway::where('slug', 'card')->where('is_active', true)->first();
        if (!$gateway) {
            return response()->json(['status' => 'gateway_inactive'], 200);
        }

        $driver  = new CardDriver($gateway);
        $success = $driver->verifyIpn($request->post());

        return response()->json(['status' => $success ? 'verified' : 'failed'], 200);
    }

    // ── Transaction history ───────────────────────────────────────────────────

    public function transactions()
    {
        $transactions = PaymentTransaction::with('gateway')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return Inertia::render('Payment/Transactions', [
            'transactions' => $transactions,
        ]);
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    public function refund(Request $request, PaymentTransaction $transaction)
    {
        $request->validate(['amount' => 'nullable|numeric|min:0.01']);

        try {
            $success = $this->paymentService->refund($transaction, $request->amount);
            return back()->with(
                $success ? 'success' : 'error',
                $success ? 'Refund processed.' : 'Refund failed.'
            );
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
