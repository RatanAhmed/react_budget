<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::withCount('subscriptions')
            ->with('services:id,title,slug,icon,color')
            ->withTrashed()
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/Plans/Index', [
            'plans'    => $plans,
            'services' => Service::active()->get(['id', 'title', 'slug', 'icon', 'color']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'description'    => ['nullable', 'string'],
            'price'          => ['required', 'numeric', 'min:0'],
            'billing_cycle'  => ['required', 'in:monthly,yearly,lifetime'],
            'duration_value' => ['nullable', 'integer', 'min:1'],
            'duration_unit'  => ['required', 'in:days,months,years'],
            'trial_days'     => ['integer', 'min:0'],
            'features'       => ['nullable', 'array'],
            'features.*'     => ['string'],
            'is_active'      => ['boolean'],
            'sort_order'     => ['integer', 'min:0'],
            'service_ids'    => ['nullable', 'array'],
            'service_ids.*'  => ['exists:services,id'],
        ]);

        $plan = Plan::create([
            ...$data,
            'slug' => Str::slug($data['name']),
        ]);

        if (! empty($data['service_ids'])) {
            $plan->services()->sync($data['service_ids']);
        }

        return back()->with('success', 'Plan created.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'description'    => ['nullable', 'string'],
            'price'          => ['required', 'numeric', 'min:0'],
            'billing_cycle'  => ['required', 'in:monthly,yearly,lifetime'],
            'duration_value' => ['nullable', 'integer', 'min:1'],
            'duration_unit'  => ['required', 'in:days,months,years'],
            'trial_days'     => ['integer', 'min:0'],
            'features'       => ['nullable', 'array'],
            'features.*'     => ['string'],
            'is_active'      => ['boolean'],
            'sort_order'     => ['integer', 'min:0'],
            'service_ids'    => ['nullable', 'array'],
            'service_ids.*'  => ['exists:services,id'],
        ]);

        $plan->update($data);
        $plan->services()->sync($data['service_ids'] ?? []);

        return back()->with('success', 'Plan updated.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        // Soft-delete only; don't delete if active subscriptions exist
        if ($plan->subscriptions()->whereIn('status', ['active', 'trial'])->exists()) {
            return back()->with('error', 'Cannot delete a plan with active subscriptions.');
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted.');
    }

    public function restore(int $id): RedirectResponse
    {
        Plan::withTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'Plan restored.');
    }
}
