<?php

namespace App\Services\Payment;

use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\Drivers\BkashDriver;
use App\Services\Payment\Drivers\NagadDriver;
use App\Services\Payment\Drivers\CashDriver;
use App\Services\Payment\Drivers\CardDriver;

/**
 * PaymentService — the single entry point for all payment operations.
 *
 * Usage anywhere in the app:
 *
 *   $result = app(PaymentService::class)->via('bkash')->initiate([
 *       'amount'       => 500.00,
 *       'phone'        => '01700000000',
 *       'note'         => 'Invoice #123',
 *       'payable_type' => Invoice::class,
 *       'payable_id'   => 123,
 *   ]);
 *
 *   // $result['transaction'] → PaymentTransaction model
 *   // $result['redirect_url'] → URL to redirect user to (null for cash)
 */
class PaymentService
{
    protected array $driverMap = [
        'bkash' => BkashDriver::class,
        'nagad' => NagadDriver::class,
        'cash'  => CashDriver::class,
        'card'  => CardDriver::class,
    ];

    protected ?PaymentGateway $gateway = null;

    // ── Driver resolution ─────────────────────────────────────────────────────

    public function via(string $slug): static
    {
        $this->gateway = PaymentGateway::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return $this;
    }

    public function usingGateway(PaymentGateway $gateway): static
    {
        $this->gateway = $gateway;
        return $this;
    }

    protected function driver(): PaymentGatewayInterface
    {
        if (!$this->gateway) {
            throw new \RuntimeException('No payment gateway selected. Call via() first.');
        }

        $driverClass = $this->driverMap[$this->gateway->slug]
            ?? throw new \RuntimeException("No driver registered for gateway: {$this->gateway->slug}");

        return new $driverClass($this->gateway);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Initiate a payment.
     *
     * Returns ['transaction' => PaymentTransaction, 'redirect_url' => string|null]
     */
    public function initiate(array $payload): array
    {
        return $this->driver()->initiate($payload);
    }

    /**
     * Verify a payment after gateway callback.
     */
    public function verify(PaymentTransaction $transaction, array $callbackData): bool
    {
        if (!$this->gateway) {
            $this->via($transaction->gateway_slug);
        }
        return $this->driver()->verify($transaction, $callbackData);
    }

    /**
     * Refund a transaction.
     */
    public function refund(PaymentTransaction $transaction, ?float $amount = null): bool
    {
        if (!$this->gateway) {
            $this->via($transaction->gateway_slug);
        }
        return $this->driver()->refund($transaction, $amount);
    }

    /**
     * Get all active gateways (for displaying payment options in UI).
     */
    public function activeGateways(): \Illuminate\Database\Eloquent\Collection
    {
        return PaymentGateway::active()->get();
    }

    /**
     * Register a custom driver at runtime.
     */
    public function extend(string $slug, string $driverClass): static
    {
        $this->driverMap[$slug] = $driverClass;
        return $this;
    }
}
