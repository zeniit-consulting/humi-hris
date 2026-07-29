<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_missing_clock_out_cutoff_settings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.attendance.update'), [
                'missing_clock_out_request_days' => 2,
                'attendance_revision_cutoff_day' => 'end_of_month',
            ])
            ->assertRedirect(route('settings.attendance.edit'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('company_settings', [
            'user_id' => $user->id,
            'missing_clock_out_request_days' => 2,
            'attendance_revision_cutoff_day' => 'end_of_month',
        ]);
    }

    public function test_attendance_settings_only_accept_valid_monthly_cutoff_values(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.attendance.update'), [
                'missing_clock_out_request_days' => 2,
                'attendance_revision_cutoff_day' => '29',
            ])
            ->assertSessionHasErrors('attendance_revision_cutoff_day');
    }
}
