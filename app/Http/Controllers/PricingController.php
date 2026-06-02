<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::active()
            ->with('services:id,title,slug,icon,color,description')
            ->get();

        return Inertia::render('Pricing', [
            'plans'           => $plans,
            'canLogin'        => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister'     => \Illuminate\Support\Facades\Route::has('register'),
            'currentPlanSlug' => auth()->user()?->activeSubscription()?->plan?->slug,
        ]);
    }
}
