<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use AuditUserActions, HasFactory;

    protected $fillable = [
        'account_id',
        'type',
        'direction',
        'amount',
        'date',
        'month',
        'year',
        'description',
        'category_id',
        'budget_id',
        'reference_type',
        'reference_id',
        'transfer_pair_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    // ── Direction map — determines credit/debit per type ─────────────────────

    public const DIRECTION_MAP = [
        'income'            => 'credit',
        'borrow'            => 'credit',   // received money
        'lend_repayment'    => 'credit',   // someone paid you back
        'expense'           => 'debit',
        'lend'              => 'debit',    // gave money out
        'borrow_repayment'  => 'debit',    // you paid back
        'saving'            => 'debit',
        // 'transfer' direction is set explicitly per leg
    ];

    // ── Scopes ────────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope(new AuthUserScope);

        // Auto-fill month, year, and direction before saving
        static::creating(function (Transaction $t) {
            if ($t->date) {
                $d = $t->date instanceof Carbon ? $t->date : Carbon::parse($t->date);
                $t->month = $d->month;
                $t->year  = $d->year;
            }
            if (!$t->direction && isset(self::DIRECTION_MAP[$t->type])) {
                $t->direction = self::DIRECTION_MAP[$t->type];
            }
        });

        static::updating(function (Transaction $t) {
            if ($t->isDirty('date') && $t->date) {
                $d = $t->date instanceof Carbon ? $t->date : Carbon::parse($t->date);
                $t->month = $d->month;
                $t->year  = $d->year;
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function transferPair(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transfer_pair_id');
    }
}
