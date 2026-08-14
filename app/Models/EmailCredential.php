<?php

namespace App\Models;

use App\Models\Scopes\AuthUserScope;
use App\Traits\AuditUserActions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailCredential extends Model
{
    use HasFactory, AuditUserActions;

    protected $fillable = [
        'email',
        'password',
        'meta',
        'status',
    ];

    protected $casts = [
        'password' => 'encrypted',   // Laravel built-in encrypted cast (AES-256)
        'meta'     => 'array',
        'status'   => 'boolean',
    ];

    /**
     * Fields hidden from serialisation so the password is never
     * accidentally leaked in JSON responses.
     */
    protected $hidden = ['password'];

    // ── Global scope — users only see their own records ───────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope(new AuthUserScope);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Convenience accessor: the list of platforms this email is used with.
     * Returns an array even if meta is null.
     */
    public function getUsedWithAttribute(): array
    {
        return $this->meta['used_with'] ?? [];
    }

    /**
     * Convenience accessor: number of devices this email is active on.
     */
    public function getDeviceCountAttribute(): int
    {
        return (int) ($this->meta['device_count'] ?? 0);
    }
}
