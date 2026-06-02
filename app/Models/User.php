<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class)->latest();
    }

    // ── Role helpers ──────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    // ── Subscription helpers ──────────────────────────────────────────────────

    /**
     * The user's currently active subscription (trial or active), if any.
     */
    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->with('plan.services')
            ->whereIn('status', ['active', 'trial'])
            ->get()
            ->first(fn (Subscription $s) => $s->isActive());
    }

    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription() !== null;
    }

    /**
     * Returns an array of service slugs the user can access based on their
     * active subscription plan. Admins can access everything.
     */
    public function servicePermissions(): array
    {
        if ($this->isAdmin()) {
            return ['*']; // wildcard — all services
        }

        $subscription = $this->activeSubscription();

        if (! $subscription) {
            return [];
        }

        return $subscription->plan->services->pluck('slug')->toArray();
    }

    /**
     * Check if the user can access a specific service by slug.
     */
    public function canAccessService(string $slug): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $permissions = $this->servicePermissions();

        return in_array('*', $permissions) || in_array($slug, $permissions);
    }
}
