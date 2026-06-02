<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubscriptionMiddleware
{
    /**
     * Protect a route by requiring an active subscription that includes
     * the given service slug.
     *
     * Usage in routes:
     *   ->middleware('subscribed:budget-planner')
     *   ->middleware('subscribed')   // just requires any active subscription
     */
    public function handle(Request $request, Closure $next, ?string $serviceSlug = null): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Admins bypass all subscription checks
        if ($user->isAdmin()) {
            return $next($request);
        }

        if (! $user->hasActiveSubscription()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'An active subscription is required.',
                ], 403);
            }

            return redirect()->route('pricing')
                ->with('warning', 'You need an active subscription to access this feature.');
        }

        // If a specific service slug is required, check access
        if ($serviceSlug && ! $user->canAccessService($serviceSlug)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your current plan does not include this service.',
                ], 403);
            }

            return redirect()->route('pricing')
                ->with('warning', 'Your current plan does not include this service. Upgrade to access it.');
        }

        return $next($request);
    }
}
