<?php

namespace App\Services\Payment\Contracts;

use App\Models\PaymentTransaction;

interface PaymentGatewayInterface
{
    /**
     * Initiate a payment and return the transaction + any redirect URL.
     *
     * @param  array{
     *     amount: float,
     *     phone?: string,
     *     note?: string,
     *     payable_type?: string,
     *     payable_id?: int,
     *     user_id?: int,
     *     callback_url?: string,
     * } $payload
     */
    public function initiate(array $payload): array;

    /**
     * Verify / execute a payment after the user returns from the gateway.
     */
    public function verify(PaymentTransaction $transaction, array $callbackData): bool;

    /**
     * Refund a completed transaction.
     */
    public function refund(PaymentTransaction $transaction, ?float $amount = null): bool;
}
