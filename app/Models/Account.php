<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use AuditUserActions, HasFactory;

    protected $fillable = [
        'name', 'type', 'currency', 'opening_balance', 'is_default', 'color', 'status',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'is_default'      => 'boolean',
        'status'          => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new AuthUserScope);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // ── Computed ──────────────────────────────────────────────────────────────

    /**
     * Current balance = opening_balance + all credits - all debits.
     * Only call after eager-loading transactions or on single account queries.
     */
    public function getBalanceAttribute(): float
    {
        $net = $this->transactions->sum(function (Transaction $t) {
            return $t->direction === 'credit' ? (float) $t->amount : -(float) $t->amount;
        });

        return round((float) $this->opening_balance + $net, 2);
    }
}
