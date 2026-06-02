<?php

namespace App\Services\Payment\Drivers;

use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SSL Commerz Payment Gateway Driver
 *
 * Credentials required in gateway config:
 *   store_id     — your SSL Commerz store ID
 *   store_passwd — your SSL Commerz store password
 *
 * Sandbox base : https://sandbox.sslcommerz.com
 * Live base    : https://securepay.sslcommerz.com
 *
 * Flow:
 *   1. initiate()  → POST to /gwprocess/v4/api.php → get GatewayPageURL → redirect user
 *   2. SSL Commerz POSTs to success_url / fail_url / cancel_url
 *   3. verify()    → validate hash + call /validator/api/validationserverAPI.php
 *   4. SSL Commerz also POSTs to ipn_url (server-to-server) — handled by verifyIpn()
 */
class CardDriver implements PaymentGatewayInterface
{
    protected PaymentGateway $gateway;
    protected string $baseUrl;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
        $this->baseUrl = $gateway->is_sandbox
            ? 'https://sandbox.sslcommerz.com'
            : 'https://securepay.sslcommerz.com';
    }

    // ── Initiate ──────────────────────────────────────────────────────────────

    public function initiate(array $payload): array
    {
        $creds = $this->gateway->credentials;
        $user  = auth()->user();

        $transaction = PaymentTransaction::create([
            'gateway_id'   => $this->gateway->id,
            'gateway_slug' => 'card',
            'user_id'      => $payload['user_id'] ?? auth()->id(),
            'payable_type' => $payload['payable_type'] ?? null,
            'payable_id'   => $payload['payable_id'] ?? null,
            'amount'       => $payload['amount'],
            'currency'     => 'BDT',
            'note'         => $payload['note'] ?? null,
            'status'       => 'pending',
        ]);

        // Build callback URLs — SSL Commerz POSTs to these
        $baseCallback = route('payment.callback', ['gateway' => 'card', 'txn' => $transaction->txn_id]);
        $ipnUrl       = route('payment.ipn',      ['gateway' => 'card']);

        $response = Http::asForm()->post("{$this->baseUrl}/gwprocess/v4/api.php", [
            // ── Auth ──────────────────────────────────────────────────────────
            'store_id'           => $creds['store_id'],
            'store_passwd'       => $creds['store_passwd'],

            // ── Transaction ───────────────────────────────────────────────────
            'total_amount'       => number_format((float) $payload['amount'], 2, '.', ''),
            'currency'           => 'BDT',
            'tran_id'            => $transaction->txn_id,

            // ── Callback URLs (SSL Commerz POSTs to these) ────────────────────
            'success_url'        => $baseCallback . '&status=success',
            'fail_url'           => $baseCallback . '&status=fail',
            'cancel_url'         => $baseCallback . '&status=cancel',
            'ipn_url'            => $ipnUrl,

            // ── Customer info ─────────────────────────────────────────────────
            'cus_name'           => $payload['customer_name']  ?? $user?->name  ?? 'Customer',
            'cus_email'          => $payload['customer_email'] ?? $user?->email ?? 'customer@example.com',
            'cus_phone'          => $payload['phone']          ?? '01700000000',
            'cus_add1'           => $payload['address']        ?? 'Dhaka',
            'cus_city'           => 'Dhaka',
            'cus_country'        => 'Bangladesh',

            // ── Shipping (not applicable for digital services) ────────────────
            'shipping_method'    => 'NO',
            'num_of_item'        => 1,

            // ── Product ───────────────────────────────────────────────────────
            'product_name'       => $payload['note']           ?? 'Service Payment',
            'product_category'   => $payload['product_category'] ?? 'Service',
            'product_profile'    => 'general',
        ]);

        $data = $response->json();
        $transaction->update(['gateway_response' => $data]);

        if (!$response->successful() || ($data['status'] ?? '') !== 'SUCCESS') {
            $transaction->markFailed($data);
            throw new \RuntimeException(
                'SSLCommerz initiation failed: ' . ($data['failedreason'] ?? $response->body())
            );
        }

        return [
            'transaction'  => $transaction,
            'redirect_url' => $data['GatewayPageURL'],
        ];
    }

    // ── Verify (called after user returns via success_url POST) ───────────────

    public function verify(PaymentTransaction $transaction, array $callbackData): bool
    {
        $status = $callbackData['status'] ?? '';

        if (in_array($status, ['FAILED', 'CANCELLED', 'cancel', 'fail'])) {
            $transaction->markFailed($callbackData);
            return false;
        }

        // Validate the hash SSL Commerz sends to prevent tampering
        if (!$this->validateHash($callbackData)) {
            Log::warning('SSLCommerz hash validation failed', [
                'txn_id'   => $transaction->txn_id,
                'callback' => $callbackData,
            ]);
            $transaction->markFailed(['error' => 'Hash validation failed', ...$callbackData]);
            return false;
        }

        // Double-check with SSL Commerz validation API
        return $this->validateWithApi($transaction, $callbackData);
    }

    // ── IPN verification (server-to-server, most reliable) ───────────────────

    public function verifyIpn(array $ipnData): bool
    {
        $txnId = $ipnData['tran_id'] ?? null;
        if (!$txnId) return false;

        $transaction = PaymentTransaction::where('txn_id', $txnId)->first();
        if (!$transaction || $transaction->isCompleted()) return true; // already done

        if (!$this->validateHash($ipnData)) {
            Log::warning('SSLCommerz IPN hash validation failed', ['ipn' => $ipnData]);
            return false;
        }

        return $this->validateWithApi($transaction, $ipnData);
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    public function refund(PaymentTransaction $transaction, ?float $amount = null): bool
    {
        $creds         = $this->gateway->credentials;
        $refundAmount  = $amount ?? (float) $transaction->amount;
        $bankTranId    = $transaction->gateway_txn_id;

        if (!$bankTranId) {
            Log::error('SSLCommerz refund: no bank_tran_id on transaction', ['txn' => $transaction->txn_id]);
            return false;
        }

        $response = Http::asForm()->post("{$this->baseUrl}/developer/api/merchantTransIDvalidationAPI.php", [
            'store_id'       => $creds['store_id'],
            'store_passwd'   => $creds['store_passwd'],
            'refund_amount'  => number_format($refundAmount, 2, '.', ''),
            'refund_remarks' => 'Refund for ' . $transaction->txn_id,
            'bank_tran_id'   => $bankTranId,
            'refe_id'        => 'REF-' . $transaction->txn_id,
            'format'         => 'json',
        ]);

        $data = $response->json();

        if (!$response->successful() || ($data['APIConnect'] ?? '') !== 'DONE') {
            Log::error('SSLCommerz refund failed', [
                'txn_id'   => $transaction->txn_id,
                'response' => $data,
            ]);
            return false;
        }

        $transaction->update([
            'status'           => 'refunded',
            'gateway_response' => array_merge($transaction->gateway_response ?? [], ['refund' => $data]),
        ]);

        return true;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Validate the MD5 hash SSL Commerz appends to callback/IPN data.
     * Prevents anyone from faking a successful payment by hitting the callback URL.
     */
    protected function validateHash(array $data): bool
    {
        if (empty($data['verify_sign']) || empty($data['verify_key'])) {
            // Hash fields not present — skip validation (sandbox sometimes omits them)
            return $this->gateway->is_sandbox;
        }

        $creds      = $this->gateway->credentials;
        $verifyKeys = explode(',', $data['verify_key']);
        $preHashStr = '';

        foreach ($verifyKeys as $key) {
            $preHashStr .= $key . '=' . ($data[$key] ?? '') . '&';
        }

        $preHashStr .= 'store_passwd=' . md5($creds['store_passwd']);
        $generatedHash = md5($preHashStr);

        return hash_equals($generatedHash, $data['verify_sign']);
    }

    /**
     * Call SSL Commerz validation API to confirm the transaction is genuinely paid.
     */
    protected function validateWithApi(PaymentTransaction $transaction, array $data): bool
    {
        $creds = $this->gateway->credentials;

        $valId = $data['val_id'] ?? null;
        if (!$valId) {
            // No val_id — mark failed
            $transaction->markFailed($data);
            return false;
        }

        $response = Http::get("{$this->baseUrl}/validator/api/validationserverAPI.php", [
            'val_id'       => $valId,
            'store_id'     => $creds['store_id'],
            'store_passwd' => $creds['store_passwd'],
            'format'       => 'json',
        ]);

        $validated = $response->json();

        if (!$response->successful() || !in_array($validated['status'] ?? '', ['VALID', 'VALIDATED'])) {
            Log::warning('SSLCommerz validation API rejected transaction', [
                'txn_id'   => $transaction->txn_id,
                'response' => $validated,
            ]);
            $transaction->markFailed($validated);
            return false;
        }

        // Verify the amount matches — prevent partial payment attacks
        $paidAmount = (float) ($validated['amount'] ?? 0);
        if (abs($paidAmount - (float) $transaction->amount) > 0.01) {
            Log::error('SSLCommerz amount mismatch', [
                'txn_id'   => $transaction->txn_id,
                'expected' => $transaction->amount,
                'received' => $paidAmount,
            ]);
            $transaction->markFailed(['error' => 'Amount mismatch', ...$validated]);
            return false;
        }

        $transaction->markCompleted($validated['bank_tran_id'] ?? null, $validated);
        return true;
    }
}
