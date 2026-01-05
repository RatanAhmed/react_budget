<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Menu extends Model
{
    use HasFactory, AuditUserActions;
    protected $fillable = [
        'name',
        'image',
        'description',
        'price',
        'available',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }
}
