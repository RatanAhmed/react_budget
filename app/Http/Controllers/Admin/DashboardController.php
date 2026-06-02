<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\PaymentTransaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Users ─────────────────────────────────────────────────────────────
        $totalUsers  = User::where('role', 'user')->count();
        $newThisMonth = User::where('role', 'user')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // ── Subscriptions ─────────────────────────────────────────────────────
        $activeSubscriptions = Subscription::whereIn('status', ['active', 'trial'])
            ->get()
            ->filter(fn (Subscription $s) => $s->isActive())
            ->count();

        $subscriptionsByPlan = Plan::withCount([
            'subscriptions as active_count' => fn ($q) => $q->whereIn('status', ['active', 'trial']),
        ])->active()->get(['id', 'name', 'slug', 'price', 'active_count']);

        // ── Revenue ───────────────────────────────────────────────────────────
        $revenueThisMonth = PaymentTransaction::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $revenueTotal = PaymentTransaction::where('status', 'completed')->sum('amount');

        // ── Recent users ──────────────────────────────────────────────────────
        $recentUsers = User::where('role', 'user')
            ->with(['subscriptions' => fn ($q) => $q->with('plan')->latest()->limit(1)])
            ->latest()
            ->limit(8)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers'          => $totalUsers,
                'newUsersThisMonth'   => $newThisMonth,
                'activeSubscriptions' => $activeSubscriptions,
                'revenueThisMonth'    => $revenueThisMonth,
                'revenueTotal'        => $revenueTotal,
            ],
            'subscriptionsByPlan' => $subscriptionsByPlan,
            'recentUsers'         => $recentUsers,
        ]);
    }
}
