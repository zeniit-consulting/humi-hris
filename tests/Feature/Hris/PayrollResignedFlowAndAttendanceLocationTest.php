<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\PayrollRun;
use App\Models\User;
use App\Services\PayrollGenerationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PayrollResignedFlowAndAttendanceLocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_options_include_all_current_statuses_for_filtering(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $activeEmp = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2025-01-01',
        ]);

        $resignedNoAttendance = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Andi',
            'last_name' => 'Wijaya',
            'is_active' => false,
            'employment_status' => 'resigned',
            'hire_date' => '2025-01-01',
            'offboarded_at' => '2026-05-15',
        ]);

        $resignedWithAttendance = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Citra',
            'last_name' => 'Lestari',
            'is_active' => false,
            'employment_status' => 'resigned',
            'hire_date' => '2025-01-01',
            'offboarded_at' => '2026-06-10',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $resignedWithAttendance->id,
            'attendance_date' => '2026-06-05',
            'check_in_at' => Carbon::parse('2026-06-05 08:00:00'),
            'check_out_at' => Carbon::parse('2026-06-05 17:00:00'),
            'status' => 'present',
        ]);

        $inactive = Employee::factory()->create(['user_id' => $user->id, 'is_active' => false, 'employment_status' => 'active', 'offboarded_at' => null]);
        $offboarded = Employee::factory()->create(['user_id' => $user->id, 'is_active' => true, 'employment_status' => 'active', 'offboarded_at' => today()->subDay()]);
        $otherOwner = Employee::factory()->create();

        $response = $this->actingAs($user)->get(route('hris.payrolls.index', ['period' => '2026-06']));
        $response->assertOk();

        $response->assertInertia(function (Assert $page) use ($activeEmp, $resignedWithAttendance, $resignedNoAttendance, $inactive, $offboarded, $otherOwner): void {
            $page->component('hris/payrolls/index');

            $page->where('employeeOptions', function ($options) use ($activeEmp, $resignedWithAttendance, $resignedNoAttendance, $inactive, $offboarded, $otherOwner) {
                $ids = collect($options)->pluck('id')->all();

                return in_array($activeEmp->id, $ids, true)
                    && in_array($resignedWithAttendance->id, $ids, true)
                    && in_array($resignedNoAttendance->id, $ids, true)
                    && ! in_array($otherOwner->id, $ids, true)
                    && collect($options)->firstWhere('id', $activeEmp->id)['payroll_status'] === 'active'
                    && collect($options)->firstWhere('id', $inactive->id)['payroll_status'] === 'inactive'
                    && collect($options)->firstWhere('id', $resignedWithAttendance->id)['payroll_status'] === 'resigned'
                    && collect($options)->firstWhere('id', $resignedNoAttendance->id)['payroll_status'] === 'inactive';
            });

            // resignedEmployeeOptions should list all resigned employees for optional manual addition
            $page->where('resignedEmployeeOptions', function ($options) use ($resignedWithAttendance, $resignedNoAttendance) {
                $ids = collect($options)->pluck('id')->all();

                return in_array($resignedWithAttendance->id, $ids, true)
                    && in_array($resignedNoAttendance->id, $ids, true);
            });
        });
    }

    public function test_automatic_batch_generation_includes_resigned_with_attendance_and_excludes_past_resigned(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $activeEmp = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Active',
            'last_name' => 'Worker',
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2025-01-01',
            'base_salary' => 5_000_000,
        ]);

        $pastResigned = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Past',
            'last_name' => 'Resigned',
            'is_active' => false,
            'employment_status' => 'resigned',
            'hire_date' => '2025-01-01',
            'offboarded_at' => '2026-04-10',
            'base_salary' => 4_000_000,
        ]);

        $currentResignedWithAtt = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Current',
            'last_name' => 'ResignedAtt',
            'is_active' => false,
            'employment_status' => 'resigned',
            'hire_date' => '2025-01-01',
            'offboarded_at' => '2026-06-15',
            'base_salary' => 6_000_000,
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $currentResignedWithAtt->id,
            'attendance_date' => '2026-06-02',
            'check_in_at' => Carbon::parse('2026-06-02 08:00:00'),
            'check_out_at' => Carbon::parse('2026-06-02 17:00:00'),
            'status' => 'present',
        ]);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($user->id, '2026-06', $user->id);

        $itemEmployeeIds = $run->items()->pluck('employee_id')->all();

        $this->assertContains($activeEmp->id, $itemEmployeeIds);
        $this->assertContains($currentResignedWithAtt->id, $itemEmployeeIds);
        $this->assertNotContains($pastResigned->id, $itemEmployeeIds);
    }

    public function test_user_can_manually_add_resigned_employee_with_manual_values(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $resigned = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Rudy',
            'last_name' => 'Kurniawan',
            'is_active' => false,
            'employment_status' => 'resigned',
            'hire_date' => '2024-01-01',
            'offboarded_at' => '2026-03-31',
            'base_salary' => 5_000_000,
        ]);

        $run = PayrollRun::query()->create([
            'user_id' => $user->id,
            'period' => '2026-06',
            'type' => 'regular',
            'status' => 'draft',
            'is_saved' => false,
            'period_start' => '2026-06-01',
            'period_end' => '2026-06-30',
            'generated_at' => now(),
            'employees_count' => 0,
            'total_base_salary' => 0,
            'total_allowances' => 0,
            'total_deductions' => 0,
            'total_net_salary' => 0,
        ]);

        $response = $this->actingAs($user)->post(route('hris.payrolls.items.store', $run), [
            'employee_id' => $resigned->id,
            'base_salary' => 7_500_000, // Pesangon / uang pisah
            'fixed_allowances' => [
                ['name' => 'Sisa Tunjangan Transport', 'amount' => 500_000],
            ],
            'variable_allowances' => [],
            'bonuses' => [
                ['name' => 'Kompensasi Cuti', 'amount' => 1_000_000],
            ],
            'manual_deductions' => [
                ['name' => 'Ganti Rugi Inventaris', 'amount' => 200_000],
            ],
        ]);

        $response->assertRedirect(route('hris.payrolls.index', ['period' => '2026-06', 'type' => 'regular', 'run_id' => $run->id]));

        $this->assertDatabaseHas('payroll_items', [
            'payroll_run_id' => $run->id,
            'employee_id' => $resigned->id,
            'base_salary' => 7_500_000,
            'allowances_total' => 1_500_000, // 500k + 1000k
            'manual_deduction_total' => 200_000,
            'net_salary' => 8_800_000, // 7.5M + 1.5M - 200k
        ]);

        $run->refresh();
        $this->assertSame(1, $run->employees_count);
        $this->assertEquals(8_800_000, (float) $run->total_net_salary);

        // Recalculating the run should preserve Rudy and his manual values
        app(PayrollGenerationService::class)->recalculateRun($run);
        $run->refresh();
        $this->assertSame(1, $run->employees_count);
        $rudyItem = $run->items()->where('employee_id', $resigned->id)->firstOrFail();
        $this->assertEquals(7_500_000, (float) $rudyItem->base_salary);
        $this->assertEquals(8_800_000, (float) $rudyItem->net_salary);
    }

    public function test_attendance_show_monthly_and_index_return_location_coordinates(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-15',
            'check_in_at' => Carbon::parse('2026-06-15 08:30:00'),
            'check_in_latitude' => -6.2088000,
            'check_in_longitude' => 106.8456000,
            'check_out_at' => Carbon::parse('2026-06-15 17:30:00'),
            'check_out_latitude' => -6.2089000,
            'check_out_longitude' => 106.8457000,
            'status' => 'present',
        ]);

        // Monthly view
        $monthlyResponse = $this->actingAs($user)->get(route('hris.attendances.monthly.show', [
            'employee' => $employee->id,
            'period' => '2026-06',
        ]));
        $monthlyResponse->assertOk();
        $monthlyResponse->assertInertia(function (Assert $page): void {
            $page->component('hris/attendances/monthly');
            $page->where('attendances', function ($attendances) {
                $record = collect($attendances)->firstWhere('attendance_date', '2026-06-15');

                return $record !== null
                    && abs($record['check_in_latitude'] - (-6.2088)) < 0.0001
                    && abs($record['check_in_longitude'] - 106.8456) < 0.0001
                    && abs($record['check_out_latitude'] - (-6.2089)) < 0.0001
                    && abs($record['check_out_longitude'] - 106.8457) < 0.0001;
            });
        });

        // Index view
        $indexResponse = $this->actingAs($user)->get(route('hris.attendances.index', [
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-30',
        ]));
        $indexResponse->assertOk();
        $indexResponse->assertInertia(function (Assert $page): void {
            $page->component('hris/attendances/index');
            $page->where('attendances.data', function ($attendances) {
                $record = collect($attendances)->firstWhere('attendance_date', '2026-06-15');

                return $record !== null
                    && abs($record['check_in_latitude'] - (-6.2088)) < 0.0001
                    && abs($record['check_in_longitude'] - 106.8456) < 0.0001
                    && abs($record['check_out_latitude'] - (-6.2089)) < 0.0001
                    && abs($record['check_out_longitude'] - 106.8457) < 0.0001;
            });
        });
    }
}
