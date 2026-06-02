<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class PaymentTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'txn_id', 'gateway_slug', 'gateway_id', 'user_id',
        'payable_type', 'payable_id',
        'amount', 'currency', 'status',
        'gateway_txn_id', 'gateway_ref', 'phone', 'note',
        'gateway_response', 'paid_at',
    ];

    protected $casts = [
        'gateway_response' => 'array',
        'paid_at'          => 'datetime',
        'amount'           => 'decimal:2',
    ];

    // ── Auto-generate txn_id ──────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->txn_id)) {
                $model->txn_id = 'TXN-' . strtoupper(Str::random(12));
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function gateway()
    {
        return $this->belongsTo(PaymentGateway::class, 'gateway_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payable()
    {
        return $this->morphTo();
    }

    // ── Status helpers ────────────────────────────────────────────────────────

    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isCompleted(): bool  { return $this->status === 'completed'; }
    public function isFailed(): bool     { return $this->status === 'failed'; }
    public function isRefunded(): bool   { return $this->status === 'refunded'; }

    public function markCompleted(string $gatewayTxnId = null, array $response = []): void
    {
        $this->update([
            'status'           => 'completed',
            'gateway_txn_id'   => $gatewayTxnId ?? $this->gateway_txn_id,
            'gateway_response' => $response ?: $this->gateway_response,
            'paid_at'          => now(),
        ]);
    }

    public function markFailed(array $response = []): void
    {
        $this->update([
            'status'           => 'failed',
            'gateway_response' => $response ?: $this->gateway_response,
        ]);
    }
}
