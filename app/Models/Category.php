<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory, AuditUserActions;

    protected $fillable = [
        'name', 'type', 'status'
    ];
    
    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }
}
