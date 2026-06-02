<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Return all active services for the public landing page.
     */
    public function index(): Response
    {
        $services = Service::active()->get();

        return Inertia::render('SoftwareCenterLanding', [
            'canLogin'    => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
            'services'    => $services,
        ]);
    }

    /**
     * Show a single service detail / marketing page.
     */
    public function show(string $slug): Response
    {
        $service = Service::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // Map slug → dedicated page component (falls back to generic ServiceDetail)
        $pageMap = [
            'restaurant-business' => 'Services/RestaurantBusiness',
            'mobile-servicing'    => 'Services/MobileServicing',
            'website-selling'     => 'Services/WebsiteSelling',
            'resume-builder'      => 'Services/ResumeBuilder',
        ];

        $component = $pageMap[$slug] ?? 'Services/ServiceDetail';

        return Inertia::render($component, [
            'service' => $service,
        ]);
    }
}
