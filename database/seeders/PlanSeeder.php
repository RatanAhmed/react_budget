<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Service;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'           => 'Free',
                'slug'           => 'free',
                'description'    => 'Get started with the basics at no cost.',
                'price'          => 0,
                'billing_cycle'  => 'lifetime',
                'duration_value' => null,       // never expires
                'duration_unit'  => 'months',
                'trial_days'     => 0,
                'is_active'      => true,
                'sort_order'     => 1,
                'features'       => [
                    'Budget Planner (basic)',
                    'Up to 50 expenses/month',
                    'Task Manager (basic)',
                ],
                'services'       => ['budget-planner', 'task-manager'],
            ],
            [
                'name'           => 'Pro',
                'slug'           => 'pro',
                'description'    => 'Everything in Free plus Resume Builder and advanced features.',
                'price'          => 299,
                'billing_cycle'  => 'monthly',
                'duration_value' => 1,          // 1 month
                'duration_unit'  => 'months',
                'trial_days'     => 7,
                'is_active'      => true,
                'sort_order'     => 2,
                'features'       => [
                    'Everything in Free',
                    'Resume Builder (unlimited)',
                    'Unlimited expenses & income',
                    'Advanced task scheduling',
                    'Priority support',
                ],
                'services'       => ['budget-planner', 'task-manager', 'resume-builder'],
            ],
            [
                'name'           => 'Business',
                'slug'           => 'business',
                'description'    => 'Full access to all services including restaurant and mobile servicing tools.',
                'price'          => 799,
                'billing_cycle'  => 'monthly',
                'duration_value' => 1,          // 1 month
                'duration_unit'  => 'months',
                'trial_days'     => 14,
                'is_active'      => true,
                'sort_order'     => 3,
                'features'       => [
                    'Everything in Pro',
                    'Restaurant Business tools',
                    'Mobile Servicing management',
                    'Website Selling module',
                    'Dedicated support',
                ],
                'services'       => ['budget-planner', 'task-manager', 'resume-builder', 'restaurant-business', 'mobile-servicing', 'website-selling'],
            ],
        ];

        foreach ($plans as $planData) {
            $serviceSlugs = $planData['services'];
            unset($planData['services']);

            $plan = Plan::updateOrCreate(['slug' => $planData['slug']], $planData);

            $serviceIds = Service::whereIn('slug', $serviceSlugs)->pluck('id');
            $plan->services()->sync($serviceIds);
        }
    }
}
