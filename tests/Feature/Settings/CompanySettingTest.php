<?php

namespace Tests\Feature\Settings;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanySettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_adding_an_attendance_location_preserves_existing_location_ids_and_employee_assignments(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'attendance_location_ids' => ['site-2'],
        ]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'Humi',
            'attendance_locations' => [
                [
                    'id' => 'site-1',
                    'name' => 'Kantor Pusat',
                    'latitude' => -6.2,
                    'longitude' => 106.816,
                    'radius_meters' => 100,
                ],
                [
                    'id' => 'site-2',
                    'name' => 'Kantor Cabang',
                    'latitude' => -6.21,
                    'longitude' => 106.817,
                    'radius_meters' => 100,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->patch(route('company.update'), [
                'name' => 'Humi',
                'portal_kasbon_enabled' => true,
                'employee_activation_otp_enabled' => true,
                'attendance_radius_meters' => 100,
                'attendance_locations' => [
                    [
                        'id' => 'site-1',
                        'name' => 'Kantor Pusat',
                        'latitude' => -6.2,
                        'longitude' => 106.816,
                        'radius_meters' => 100,
                    ],
                    [
                        'id' => 'site-2',
                        'name' => 'Kantor Cabang',
                        'latitude' => -6.21,
                        'longitude' => 106.817,
                        'radius_meters' => 100,
                    ],
                    [
                        'name' => 'Kantor Operasional',
                        'latitude' => -6.22,
                        'longitude' => 106.818,
                        'radius_meters' => 100,
                    ],
                ],
            ])
            ->assertRedirect(route('profile.edit'));

        $locations = CompanySetting::query()->firstOrFail()->attendance_locations;

        $this->assertSame(
            ['site-1', 'site-2'],
            array_values(array_slice(array_column($locations, 'id', 'name'), 0, 2)),
        );
        $this->assertSame(['site-2'], $employee->fresh()->attendance_location_ids);
    }
}
