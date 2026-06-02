<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $subscription = $user->activeSubscription();
        $history      = $user->subscriptions()->with('plan')->get();

        return Inertia::render('Subscription/Index', [
            'subscription' => $subscription?->load('plan.services'),
            'history'      => $history,
            'plans'        => Plan::active()
                ->with('services:id,title,slug,icon,color')
                ->get(),
        ]);
    }

    /**
     * Initiate a subscription to a plan.
     * For free plans this activates immediately; paid plans go through payment.
     */
    public function subscribe(Request $request): RedirectResponse
    {
        $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $user = auth()->user();

        // Cancel any existing active subscription
        $user->subscriptions()
            ->whereIn('status', ['active', 'trial'])
            ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

        Subscription::create([
            'user_id'   => $user->id,
            'plan_id'   => $plan->id,
            'status'    => 'active',
            'starts_at' => now(),
            'ends_at'   => $plan->computeEndsAt(),
        ]);

        return redirect()->route('dashboard')
            ->with('success', "You are now on the {$plan->name} plan.");
    }

    public function cancel(): RedirectResponse
    {
        $subscription = auth()->user()->activeSubscription();

        if (! $subscription) {
            return back()->with('error', 'No active subscription found.');
        }

        $subscription->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Your subscription has been cancelled.');
    }
}
