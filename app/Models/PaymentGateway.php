<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Crypt;

class PaymentGateway extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'logo', 'color', 'description',
        'is_active', 'is_sandbox', 'credentials', 'settings', 'sort_order',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'is_sandbox'  => 'boolean',
        'settings'    => 'array',
    ];

    // ── Credentials are stored encrypted ─────────────────────────────────────

    public function setCredentialsAttribute(array|null $value): void
    {
        $this->attributes['credentials'] = $value
            ? Crypt::encryptString(json_encode($value))
            : null;
    }

    public function getCredentialsAttribute(string|null $value): array
    {
        if (!$value) return [];
        try {
            return json_decode(Crypt::decryptString($value), true) ?? [];
        } catch (\Exception) {
            return [];
        }
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class, 'gateway_id');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function credential(string $key, mixed $default = null): mixed
    {
        return $this->credentials[$key] ?? $default;
    }

    public function setting(string $key, mixed $default = null): mixed
    {
        return ($this->settings ?? [])[$key] ?? $default;
    }
}
