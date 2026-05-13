<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'free',
                'name' => 'Free',
                'price_per_employee' => 0,
                'max_employees' => 10,
                'max_months' => 2,
                'locked_features' => ['survey', 'notifications'],
                'is_active' => true,
            ],
            [
                'slug' => 'core',
                'name' => 'Core',
                'price_per_employee' => 2900,
                'max_employees' => null,
                'max_months' => null,
                'locked_features' => ['recruitment', 'kasbon', 'assets'],
                'is_active' => true,
            ],
            [
                'slug' => 'plus',
                'name' => 'Plus',
                'price_per_employee' => 7500,
                'max_employees' => null,
                'max_months' => null,
                'locked_features' => [],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                $plan,
            );
        }
    }
}
