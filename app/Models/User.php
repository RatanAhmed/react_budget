<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'mobile',
        'mobile_verified_at',
        'password',
        'role',
        'google_id',
        'facebook_id',
        'auth_provider',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at'  => 'datetime',
        'mobile_verified_at' => 'datetime',
        'password'           => 'hashed',
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

    /**
     * Returns true if the user can log in with a password
     * (i.e. they registered via email or have set a password).
     */
    public function hasPassword(): bool
    {
        return ! is_null($this->password);
    }

    /**
     * Returns true if the user's mobile number is verified.
     */
    public function hasMobileVerified(): bool
    {
        return ! is_null($this->mobile_verified_at);
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
