<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayrollRun>
 */
class PayrollRunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'period' => now()->format('Y-m'),
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'employees_count' => 0,
            'total_base_salary' => 0,
            'total_allowances' => 0,
            'total_deductions' => 0,
            'total_net_salary' => 0,
            'generated_at' => now(),
            'generated_by' => null,
            'is_saved' => false,
            'saved_at' => null,
            'saved_by' => null,
            'status' => 'draft',
            'released_at' => null,
            'released_by' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'is_saved' => false,
            'released_at' => null,
            'released_by' => null,
        ]);
    }

    public function released(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
            'released_at' => now(),
            'saved_at' => now(),
        ]);
    }
}

