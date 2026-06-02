<?php

namespace App\Services\Payment\Drivers;

use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentGatewayInterface;

/**
 * Cash / Manual payment driver.
 * Marks the transaction as completed immediately (no external API).
 */
class CashDriver implements PaymentGatewayInterface
{
    protected PaymentGateway $gateway;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
    }

    public function initiate(array $payload): array
    {
        $transaction = PaymentTransaction::create([
            'gateway_id'   => $this->gateway->id,
            'gateway_slug' => 'cash',
            'user_id'      => $payload['user_id'] ?? auth()->id(),
            'payable_type' => $payload['payable_type'] ?? null,
            'payable_id'   => $payload['payable_id'] ?? null,
            'amount'       => $payload['amount'],
            'currency'     => 'BDT',
            'note'         => $payload['note'] ?? null,
            'status'       => 'pending',
        ]);

        // Cash is collected in person — mark completed right away
        $transaction->markCompleted('CASH-' . $transaction->txn_id, [
            'method' => 'cash',
            'note'   => $payload['note'] ?? 'Cash payment received',
        ]);

        return [
            'transaction'  => $transaction,
            'redirect_url' => null,
        ];
    }

    public function verify(PaymentTransaction $transaction, array $callbackData): bool
    {
        // Nothing to verify for cash
        return $transaction->isCompleted();
    }

    public function refund(PaymentTransaction $transaction, ?float $amount = null): bool
    {
        $transaction->update(['status' => 'refunded']);
        return true;
    }
}
