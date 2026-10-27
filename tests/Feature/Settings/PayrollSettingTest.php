<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_payroll_cutoff_settings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.payroll.update'), [
                'active_working_days' => 22,
                'payroll_cutoff_day' => '25',
                'auto_deduct_leave_for_missing_checkout' => false,
            ])
            ->assertRedirect(route('settings.payroll.edit'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('company_settings', [
            'user_id' => $user->id,
            'active_working_days' => 22,
            'payroll_cutoff_day' => '25',
        ]);
    }

    public function test_payroll_settings_only_accept_valid_cutoff_values(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.payroll.update'), [
                'active_working_days' => 22,
                'payroll_cutoff_day' => '32',
                'auto_deduct_leave_for_missing_checkout' => false,
            ])
            ->assertSessionHasErrors('payroll_cutoff_day');
    }

    public function test_admin_can_update_working_days_type_setting(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.payroll.update'), [
                'active_working_days' => 20,
                'working_days_type' => '5_days',
                'payroll_cutoff_day' => 'end_of_month',
                'auto_deduct_leave_for_missing_checkout' => false,
            ])
            ->assertRedirect(route('settings.payroll.edit'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('company_settings', [
            'user_id' => $user->id,
            'active_working_days' => 20,
            'working_days_type' => '5_days',
        ]);
    }

    public function test_payroll_settings_validates_working_days_type(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.payroll.update'), [
                'active_working_days' => 22,
                'working_days_type' => 'invalid_type',
                'payroll_cutoff_day' => 'end_of_month',
                'auto_deduct_leave_for_missing_checkout' => false,
            ])
            ->assertSessionHasErrors('working_days_type');
    }
}
