<?php

namespace App\Services\Payment\Drivers;

use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * bKash Payment Gateway Driver (Checkout URL API v1.2.0-beta)
 *
 * Credentials required in gateway config:
 *   app_key, app_secret, username, password
 *
 * Sandbox base URL : https://tokenized.sandbox.bka.sh/v1.2.0-beta
 * Live base URL    : https://tokenized.pay.bka.sh/v1.2.0-beta
 */
class BkashDriver implements PaymentGatewayInterface
{
    protected PaymentGateway $gateway;
    protected string $baseUrl;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
        $this->baseUrl = $gateway->is_sandbox
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
    }

    // ── Token ─────────────────────────────────────────────────────────────────

    protected function getToken(): string
    {
        $creds = $this->gateway->credentials;

        $response = Http::withHeaders([
            'username'    => $creds['username'],
            'password'    => $creds['password'],
            'Content-Type'=> 'application/json',
        ])->post("{$this->baseUrl}/tokenized/checkout/token/grant", [
            'app_key'    => $creds['app_key'],
            'app_secret' => $creds['app_secret'],
        ]);

        if (!$response->successful() || empty($response->json('id_token'))) {
            throw new \RuntimeException('bKash token grant failed: ' . $response->body());
        }

        return $response->json('id_token');
    }

    // ── Initiate ──────────────────────────────────────────────────────────────

    public function initiate(array $payload): array
    {
        $token = $this->getToken();
        $creds = $this->gateway->credentials;

        $transaction = PaymentTransaction::create([
            'gateway_id'   => $this->gateway->id,
            'gateway_slug' => 'bkash',
            'user_id'      => $payload['user_id'] ?? auth()->id(),
            'payable_type' => $payload['payable_type'] ?? null,
            'payable_id'   => $payload['payable_id'] ?? null,
            'amount'       => $payload['amount'],
            'currency'     => 'BDT',
            'phone'        => $payload['phone'] ?? null,
            'note'         => $payload['note'] ?? null,
            'status'       => 'pending',
        ]);

        $callbackUrl = $payload['callback_url']
            ?? route('payment.callback', ['gateway' => 'bkash', 'txn' => $transaction->txn_id]);

        $response = Http::withHeaders([
            'Authorization' => $token,
            'X-APP-Key'     => $creds['app_key'],
            'Content-Type'  => 'application/json',
        ])->post("{$this->baseUrl}/tokenized/checkout/create", [
            'mode'                  => '0011',
            'payerReference'        => (string) ($payload['user_id'] ?? auth()->id() ?? 'guest'),
            'callbackURL'           => $callbackUrl,
            'amount'                => (string) $payload['amount'],
            'currency'              => 'BDT',
            'intent'                => 'sale',
            'merchantInvoiceNumber' => $transaction->txn_id,
        ]);

        $data = $response->json();

        $transaction->update(['gateway_response' => $data]);

        if (!$response->successful() || ($data['statusCode'] ?? '') !== '0000') {
            $transaction->markFailed($data);
            throw new \RuntimeException('bKash create payment failed: ' . ($data['statusMessage'] ?? $response->body()));
        }

        return [
            'transaction'  => $transaction,
            'redirect_url' => $data['bkashURL'],
        ];
    }

    // ── Verify ────────────────────────────────────────────────────────────────

    public function verify(PaymentTransaction $transaction, array $callbackData): bool
    {
        if (($callbackData['status'] ?? '') !== 'success') {
            $transaction->markFailed($callbackData);
            return false;
        }

        $token = $this->getToken();
        $creds = $this->gateway->credentials;

        $response = Http::withHeaders([
            'Authorization' => $token,
            'X-APP-Key'     => $creds['app_key'],
            'Content-Type'  => 'application/json',
        ])->post("{$this->baseUrl}/tokenized/checkout/execute", [
            'paymentID' => $callbackData['paymentID'],
        ]);

        $data = $response->json();

        if (!$response->successful() || ($data['statusCode'] ?? '') !== '0000') {
            $transaction->markFailed($data);
            return false;
        }

        $transaction->markCompleted($data['trxID'] ?? null, $data);
        return true;
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    public function refund(PaymentTransaction $transaction, ?float $amount = null): bool
    {
        $token = $this->getToken();
        $creds = $this->gateway->credentials;

        $response = Http::withHeaders([
            'Authorization' => $token,
            'X-APP-Key'     => $creds['app_key'],
            'Content-Type'  => 'application/json',
        ])->post("{$this->baseUrl}/tokenized/checkout/payment/refund", [
            'paymentID'     => $transaction->gateway_ref,
            'trxID'         => $transaction->gateway_txn_id,
            'sku'           => $transaction->txn_id,
            'amount'        => (string) ($amount ?? $transaction->amount),
            'reason'        => 'Refund requested',
        ]);

        $data = $response->json();

        if (!$response->successful() || ($data['statusCode'] ?? '') !== '0000') {
            Log::error('bKash refund failed', ['txn' => $transaction->txn_id, 'response' => $data]);
            return false;
        }

        $transaction->update(['status' => 'refunded', 'gateway_response' => $data]);
        return true;
    }
}
