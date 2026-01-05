<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Income extends Model
{
    use AuditUserActions, HasFactory;
    protected $fillable = [
        'source', 'details', 'amount', 'status', 'type', 'month', 'year'
    ];
    
    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }
}
