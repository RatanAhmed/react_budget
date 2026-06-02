<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanRepayment extends Model
{
    use AuditUserActions, HasFactory;

    protected $fillable = [
        'loan_id', 'amount', 'note', 'repayment_date',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'repayment_date'  => 'date',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }
}
