<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\PublicHoliday;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkCalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_holiday_with_type_and_apply_to_all_active_employees(): void
    {
        $user = User::factory()->create();

        $employee1 = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
            'employment_status' => 'active',
        ]);
        $employee2 = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $response = $this->actingAs($user)->post(route('hris.schedules.holidays.store'), [
            'date' => '2026-05-01',
            'name' => 'Hari Buruh Internasional',
            'holiday_type' => 'national',
            'apply_to_schedule' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('public_holidays', [
            'user_id' => $user->id,
            'name' => 'Hari Buruh Internasional',
            'holiday_type' => 'national',
            'is_national_holiday' => true,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee1->id,
            'work_date' => '2026-05-01',
            'shift_code' => 'OFF',
            'is_day_off' => true,
            'notes' => 'Hari Buruh Internasional',
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee2->id,
            'work_date' => '2026-05-01',
            'shift_code' => 'OFF',
            'is_day_off' => true,
            'notes' => 'Hari Buruh Internasional',
        ]);
    }

    public function test_admin_can_store_company_holiday_without_applying_to_schedule(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('hris.schedules.holidays.store'), [
            'date' => '2026-06-15',
            'name' => 'Ulang Tahun Perusahaan',
            'holiday_type' => 'company',
            'apply_to_schedule' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('public_holidays', [
            'user_id' => $user->id,
            'name' => 'Ulang Tahun Perusahaan',
            'holiday_type' => 'company',
            'is_national_holiday' => false,
        ]);

        $this->assertDatabaseCount('employee_schedules', 0);
    }

    public function test_admin_can_delete_holiday(): void
    {
        $user = User::factory()->create();
        $holiday = PublicHoliday::create([
            'user_id' => $user->id,
            'date' => '2026-08-17',
            'name' => 'HUT RI',
            'holiday_type' => 'national',
            'is_national_holiday' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('hris.schedules.holidays.destroy', $holiday));

        $response->assertRedirect();
        $this->assertDatabaseMissing('public_holidays', [
            'id' => $holiday->id,
        ]);
    }
}
