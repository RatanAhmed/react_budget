<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use AuditUserActions, HasFactory;

    protected $fillable = [
        'type', 'person_name', 'person_phone',
        'amount', 'note', 'loan_date', 'due_date', 'status',
    ];

    protected $casts = [
        'amount'    => 'decimal:2',
        'loan_date' => 'date',
        'due_date'  => 'date',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new AuthUserScope);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Repayment transactions linked to this loan.
     * type is lend_repayment (if loan.type=lend) or borrow_repayment (if loan.type=borrow).
     */
    public function repaymentTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'reference_id')
            ->where('reference_type', 'loan')
            ->whereIn('type', ['lend_repayment', 'borrow_repayment'])
            ->orderBy('date');
    }

    // ── Computed helpers ──────────────────────────────────────────────────────

    /** Total amount repaid so far. */
    public function getPaidAmountAttribute(): float
    {
        return (float) $this->repaymentTransactions->sum('amount');
    }

    /** Remaining balance. */
    public function getOutstandingAttribute(): float
    {
        return max(0, (float) $this->amount - $this->paid_amount);
    }

    /** Recalculate and persist status based on repayment transactions. */
    public function syncStatus(): void
    {
        $paid = $this->paid_amount;

        $status = match (true) {
            $paid <= 0                    => 'unpaid',
            $paid < (float) $this->amount => 'partial',
            default                       => 'paid',
        };

        if ($this->status !== $status) {
            $this->timestamps = false;
            $this->update(['status' => $status]);
            $this->timestamps = true;
        }
    }

    /** True if past due date and not fully paid. */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status !== 'paid'
            && $this->due_date
            && $this->due_date->isPast();
    }
}
