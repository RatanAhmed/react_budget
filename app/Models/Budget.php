<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget extends Model
{
    use AuditUserActions, HasFactory;
    protected $fillable = [
        'title', 'description', 'amount', 'status', 'type', 'priority', 'month', 'year'
    ];

    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }
}
