<?php

namespace App\Services\Payment\Drivers;

use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Nagad Payment Gateway Driver (Merchant API)
 *
 * Credentials required in gateway config:
 *   merchant_id, merchant_private_key, nagad_public_key
 *
 * Sandbox base URL : https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0
 * Live base URL    : https://api.mynagad.com/api/dfs
 */
class NagadDriver implements PaymentGatewayInterface
{
    protected PaymentGateway $gateway;
    protected string $baseUrl;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
        $this->baseUrl = $gateway->is_sandbox
            ? 'https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0'
            : 'https://api.mynagad.com/api/dfs';
    }

    // ── Crypto helpers ────────────────────────────────────────────────────────

    protected function encryptWithNagadPublicKey(string $data): string
    {
        $publicKey = "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split($this->gateway->credential('nagad_public_key'), 64, "\n")
            . "-----END PUBLIC KEY-----";

        openssl_public_encrypt($data, $encrypted, $publicKey, OPENSSL_PKCS1_PADDING);
        return base64_encode($encrypted);
    }

    protected function signWithMerchantPrivateKey(string $data): string
    {
        $privateKey = "-----BEGIN RSA PRIVATE KEY-----\n"
            . chunk_split($this->gateway->credential('merchant_private_key'), 64, "\n")
            . "-----END RSA PRIVATE KEY-----";

        openssl_sign($data, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        return base64_encode($signature);
    }

    // ── Initiate ──────────────────────────────────────────────────────────────

    public function initiate(array $payload): array
    {
        $merchantId = $this->gateway->credential('merchant_id');
        $orderId    = 'ORD-' . strtoupper(Str::random(10));
        $datetime   = now()->format('YmdHis');

        $transaction = PaymentTransaction::create([
            'gateway_id'   => $this->gateway->id,
            'gateway_slug' => 'nagad',
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
            ?? route('payment.callback', ['gateway' => 'nagad', 'txn' => $transaction->txn_id]);

        // Step 1: Initialize
        $sensitiveData = json_encode([
            'merchantId'    => $merchantId,
            'datetime'      => $datetime,
            'orderId'       => $orderId,
            'challenge'     => Str::random(40),
        ]);

        $initResponse = Http::withHeaders(['X-KM-Api-Version' => 'v-0.2.0'])
            ->post("{$this->baseUrl}/check-out/initialize/{$merchantId}/{$orderId}", [
                'dateTime'          => $datetime,
                'sensitiveData'     => $this->encryptWithNagadPublicKey($sensitiveData),
                'signature'         => $this->signWithMerchantPrivateKey($sensitiveData),
            ]);

        $initData = $initResponse->json();

        if (!$initResponse->successful() || empty($initData['paymentReferenceId'])) {
            $transaction->markFailed($initData);
            throw new \RuntimeException('Nagad init failed: ' . $initResponse->body());
        }

        // Step 2: Complete
        $paymentRefId = $initData['paymentReferenceId'];
        $challenge    = $initData['challenge'];

        $sensitiveData2 = json_encode([
            'merchantId'        => $merchantId,
            'orderId'           => $orderId,
            'amount'            => (string) $payload['amount'],
            'currencyCode'      => '050',
            'challenge'         => $challenge,
        ]);

        $completeResponse = Http::withHeaders(['X-KM-Api-Version' => 'v-0.2.0'])
            ->post("{$this->baseUrl}/check-out/complete/{$merchantId}/{$paymentRefId}", [
                'sensitiveData'     => $this->encryptWithNagadPublicKey($sensitiveData2),
                'signature'         => $this->signWithMerchantPrivateKey($sensitiveData2),
                'merchantCallbackURL' => $callbackUrl,
            ]);

        $completeData = $completeResponse->json();

        $transaction->update([
            'gateway_ref'      => $paymentRefId,
            'gateway_response' => $completeData,
        ]);

        if (!$completeResponse->successful() || empty($completeData['callBackUrl'])) {
            $transaction->markFailed($completeData);
            throw new \RuntimeException('Nagad complete failed: ' . $completeResponse->body());
        }

        return [
            'transaction'  => $transaction,
            'redirect_url' => $completeData['callBackUrl'],
        ];
    }

    // ── Verify ────────────────────────────────────────────────────────────────

    public function verify(PaymentTransaction $transaction, array $callbackData): bool
    {
        if (($callbackData['status'] ?? '') !== 'Success') {
            $transaction->markFailed($callbackData);
            return false;
        }

        $paymentRefId = $callbackData['payment_ref_id'] ?? $transaction->gateway_ref;
        $merchantId   = $this->gateway->credential('merchant_id');

        $response = Http::withHeaders(['X-KM-Api-Version' => 'v-0.2.0'])
            ->get("{$this->baseUrl}/verify/payment/{$paymentRefId}");

        $data = $response->json();

        if (!$response->successful() || ($data['status'] ?? '') !== 'Success') {
            $transaction->markFailed($data);
            return false;
        }

        $transaction->markCompleted($data['merchantInvoiceNumber'] ?? null, $data);
        return true;
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    public function refund(PaymentTransaction $transaction, ?float $amount = null): bool
    {
        // Nagad refund is handled via merchant portal; log for manual processing
        Log::info('Nagad refund requested', [
            'txn_id' => $transaction->txn_id,
            'amount' => $amount ?? $transaction->amount,
        ]);
        $transaction->update(['status' => 'refunded']);
        return true;
    }
}
