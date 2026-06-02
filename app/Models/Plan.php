<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'billing_cycle',
        'trial_days', 'duration_value', 'duration_unit',
        'features', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features'       => 'array',
        'is_active'      => 'boolean',
        'price'          => 'decimal:2',
        'trial_days'     => 'integer',
        'sort_order'     => 'integer',
        'duration_value' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'plan_service');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isFree(): bool
    {
        return $this->price == 0;
    }

    /**
     * Calculate the ends_at timestamp for a new subscription based on
     * the plan's duration_value + duration_unit.
     * Returns null for lifetime plans (duration_value is null).
     */
    public function computeEndsAt(): ?\Carbon\Carbon
    {
        if (is_null($this->duration_value)) {
            return null; // lifetime — never expires
        }

        return match ($this->duration_unit) {
            'days'   => now()->addDays($this->duration_value),
            'years'  => now()->addYears($this->duration_value),
            default  => now()->addMonths($this->duration_value), // months
        };
    }

    /**
     * Human-readable duration label, e.g. "1 month", "30 days", "1 year".
     */
    public function durationLabel(): string
    {
        if (is_null($this->duration_value)) {
            return 'Lifetime';
        }

        $unit = $this->duration_value === 1
            ? rtrim($this->duration_unit, 's')   // "month" not "months"
            : $this->duration_unit;

        return "{$this->duration_value} {$unit}";
    }
}
