<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Saving extends Model
{
    use HasFactory, AuditUserActions;
    protected $fillable = [
        'date', 'details', 'amount', 'budget_id', 'income_id', 'saving_for'
    ];

    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }
}
