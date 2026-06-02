<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with(['subscriptions' => fn ($q) => $q->with('plan')->latest()->limit(1)])
            ->when($request->search, fn ($q, $s) =>
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
            )
            ->when($request->role, fn ($q, $r) => $q->where('role', $r))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['subscriptions.plan']);

        return Inertia::render('Admin/Users/Show', [
            'user'  => $user,
            'plans' => Plan::active()->get(['id', 'name', 'slug', 'price', 'billing_cycle']),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'role' => ['required', Rule::in(['admin', 'user'])],
        ]);

        // Prevent removing the last admin
        if ($user->isAdmin() && $request->role === 'user') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return back()->with('error', 'Cannot remove the last admin.');
            }
        }

        $user->update(['role' => $request->role]);

        return back()->with('success', "Role updated to {$request->role}.");
    }

    public function grantSubscription(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'plan_id'    => ['required', 'exists:plans,id'],
            'ends_at'    => ['nullable', 'date', 'after:today'],
        ]);

        // Cancel any existing active subscription
        $user->subscriptions()
            ->whereIn('status', ['active', 'trial'])
            ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

        $plan   = \App\Models\Plan::findOrFail($request->plan_id);
        $endsAt = $request->filled('ends_at')
            ? \Carbon\Carbon::parse($request->ends_at)
            : $plan->computeEndsAt();

        Subscription::create([
            'user_id'    => $user->id,
            'plan_id'    => $request->plan_id,
            'status'     => 'active',
            'starts_at'  => now(),
            'ends_at'    => $endsAt,
        ]);

        return back()->with('success', 'Subscription granted successfully.');
    }

    public function cancelSubscription(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Subscription cancelled.');
    }
}
