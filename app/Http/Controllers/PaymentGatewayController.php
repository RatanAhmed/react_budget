<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentGatewayController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Payment/GatewayConfig', [
            'gateways' => PaymentGateway::withTrashed()->orderBy('sort_order')->get()
                ->map(fn ($g) => [
                    'id'          => $g->id,
                    'name'        => $g->name,
                    'slug'        => $g->slug,
                    'logo'        => $g->logo,
                    'color'       => $g->color,
                    'description' => $g->description,
                    'is_active'   => $g->is_active,
                    'is_sandbox'  => $g->is_sandbox,
                    'sort_order'  => $g->sort_order,
                    'settings'    => $g->settings,
                    // Never expose raw credentials to frontend — only key names
                    'credential_keys' => array_keys($g->credentials),
                    'deleted_at'  => $g->deleted_at,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'required|string|max:50|unique:payment_gateways,slug',
            'color'       => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'is_sandbox'  => 'boolean',
            'sort_order'  => 'integer',
            'credentials' => 'nullable|array',
            'settings'    => 'nullable|array',
        ]);

        PaymentGateway::create($validated);

        return redirect()->route('payment-gateways.index')
            ->with('success', 'Gateway created.');
    }

    public function update(Request $request, PaymentGateway $paymentGateway)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'is_sandbox'  => 'boolean',
            'sort_order'  => 'integer',
            'settings'    => 'nullable|array',
            // Credentials only updated when explicitly provided
            'credentials' => 'nullable|array',
        ]);

        // Only overwrite credentials if new ones were submitted
        if (empty($validated['credentials'])) {
            unset($validated['credentials']);
        }

        $paymentGateway->update($validated);

        return redirect()->route('payment-gateways.index')
            ->with('success', 'Gateway updated.');
    }

    public function destroy(PaymentGateway $paymentGateway)
    {
        $paymentGateway->delete();
        return redirect()->route('payment-gateways.index')
            ->with('success', 'Gateway removed.');
    }

    public function restore(int $id)
    {
        PaymentGateway::withTrashed()->findOrFail($id)->restore();
        return redirect()->route('payment-gateways.index')
            ->with('success', 'Gateway restored.');
    }
}
