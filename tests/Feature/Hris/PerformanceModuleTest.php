<?php

namespace Tests\Feature\Hris;

use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\PerformanceKpiResult;
use App\Models\PerformanceKpiTemplate;
use App\Models\PerformanceObjective;
use App\Models\PerformancePeriod;
use App\Models\PerformanceReview;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_performance_page(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('hris.performances.index'))
            ->assertOk();
    }

    public function test_review_prefills_template_kpis_and_calculates_final_score_with_50_40_10_ratio(): void
    {
        $user = User::factory()->create();
        [$employee, $manager] = $this->employeePair($user);

        $period = PerformancePeriod::query()->create([
            'user_id' => $user->id,
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-30',
            'status' => 'active',
        ]);

        $template = PerformanceKpiTemplate::query()->create([
            'user_id' => $user->id,
            'position_id' => $employee->position_id,
            'name' => 'Sales KPI',
            'is_active' => true,
        ]);

        $this->actingAs($user)->post(route('hris.performances.templates.metrics.store', $template), [
            'name' => 'Revenue',
            'target_value' => 100,
            'actual_value' => 0,
            'unit' => '%',
            'weight' => 1,
            'input_type' => 'manual',
            'attendance_metric' => null,
            'direction' => 'higher_is_better',
        ])->assertRedirect();

        $this->actingAs($user)->post(route('hris.performances.reviews.store'), [
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'manager_id' => $manager->id,
        ])->assertRedirect();

        $review = PerformanceReview::query()->firstOrFail();
        $kpi = PerformanceKpiResult::query()->where('performance_review_id', $review->id)->firstOrFail();

        $this->assertSame('Revenue', $kpi->name);

        $this->actingAs($user)->put(route('hris.performances.kpi-results.update', $kpi), [
            'actual_value' => 80,
            'notes' => 'Progress bulan ini.',
        ])->assertRedirect();

        $this->actingAs($user)->post(route('hris.performances.reviews.objectives.store', $review), [
            'title' => 'Improve sales quality',
            'description' => null,
            'weight' => 1,
            'status' => 'on_track',
        ])->assertRedirect();

        $objective = PerformanceObjective::query()->firstOrFail();

        $this->actingAs($user)->post(route('hris.performances.objectives.key-results.store', $objective), [
            'title' => 'Win qualified opportunities',
            'target_value' => 100,
            'actual_value' => 100,
            'unit' => '%',
            'score' => 100,
            'status' => 'completed',
        ])->assertRedirect();

        $this->actingAs($user)->put(route('hris.performances.reviews.update', $review), [
            'manager_id' => $manager->id,
            'status' => 'completed',
            'manager_score' => 90,
            'manager_notes' => 'Strong delivery.',
            'strengths' => 'Follow up cepat.',
            'improvement_areas' => 'Forecasting.',
            'next_action' => 'Maintain pipeline review.',
        ])->assertRedirect();

        $review->refresh();

        $this->assertSame('100.00', (string) $review->okr_score);
        $this->assertSame('80.00', (string) $review->kpi_score);
        $this->assertSame('91.00', (string) $review->final_score);
    }

    public function test_attendance_kpi_reads_attendance_records_for_the_review_period(): void
    {
        $user = User::factory()->create();
        [$employee, $manager] = $this->employeePair($user);

        $period = PerformancePeriod::query()->create([
            'user_id' => $user->id,
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-30',
            'status' => 'active',
        ]);

        $template = PerformanceKpiTemplate::query()->create([
            'user_id' => $user->id,
            'division_id' => $employee->division_id,
            'name' => 'Attendance KPI',
            'is_active' => true,
        ]);

        $this->actingAs($user)->post(route('hris.performances.templates.metrics.store', $template), [
            'name' => 'Attendance Rate',
            'target_value' => 80,
            'unit' => '%',
            'weight' => 1,
            'input_type' => 'attendance',
            'attendance_metric' => 'attendance_rate',
            'direction' => 'higher_is_better',
        ])->assertRedirect();

        foreach ([
            ['attendance_date' => '2026-06-03', 'status' => 'present'],
            ['attendance_date' => '2026-06-04', 'status' => 'late'],
            ['attendance_date' => '2026-06-05', 'status' => 'absent'],
        ] as $row) {
            EmployeeAttendance::query()->create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'attendance_date' => $row['attendance_date'],
                'status' => $row['status'],
                'check_in_at' => $row['status'] === 'absent' ? null : $row['attendance_date'].' 08:00:00',
            ]);
        }

        $this->actingAs($user)->post(route('hris.performances.reviews.store'), [
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'manager_id' => $manager->id,
        ])->assertRedirect();

        $result = PerformanceKpiResult::query()->firstOrFail();

        $this->assertSame('66.67', (string) $result->actual_value);
        $this->assertSame('83.34', (string) $result->score);
    }

    public function test_manager_cannot_update_review_outside_their_scope(): void
    {
        $owner = User::factory()->create();
        [$employee, $manager] = $this->employeePair($owner);
        $otherManager = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => 'other.manager@example.com',
            'phone' => '6281111111111',
        ]);
        $subUser = User::factory()->create([
            'parent_user_id' => $owner->id,
            'role' => 'staff',
            'email' => $manager->email,
            'phone' => $manager->phone,
        ]);

        $period = PerformancePeriod::query()->create([
            'user_id' => $owner->id,
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-30',
            'status' => 'active',
        ]);

        $review = PerformanceReview::query()->create([
            'user_id' => $owner->id,
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'manager_id' => $otherManager->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($subUser)->put(route('hris.performances.reviews.update', $review), [
            'status' => 'completed',
            'manager_score' => 90,
            'manager_notes' => 'Tidak boleh.',
            'strengths' => null,
            'improvement_areas' => null,
            'next_action' => null,
        ])->assertForbidden();
    }

    public function test_closed_period_locks_reviews_from_score_edits(): void
    {
        $user = User::factory()->create();
        [$employee, $manager] = $this->employeePair($user);

        $period = PerformancePeriod::query()->create([
            'user_id' => $user->id,
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-30',
            'status' => 'active',
        ]);

        $review = PerformanceReview::query()->create([
            'user_id' => $user->id,
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'manager_id' => $manager->id,
            'status' => 'completed',
        ]);

        $kpi = PerformanceKpiResult::query()->create([
            'user_id' => $user->id,
            'performance_review_id' => $review->id,
            'name' => 'Quality',
            'target_value' => 100,
            'actual_value' => 80,
            'weight' => 1,
            'input_type' => 'manual',
            'direction' => 'higher_is_better',
        ]);

        $this->actingAs($user)->put(route('hris.performances.periods.update', $period), [
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-30',
            'status' => 'closed',
        ])->assertRedirect();

        $review->refresh();

        $this->assertSame('locked', $review->status);
        $this->assertNotNull($review->locked_at);

        $this->from(route('hris.performances.index'))
            ->actingAs($user)
            ->put(route('hris.performances.kpi-results.update', $kpi), [
                'actual_value' => 100,
                'notes' => null,
            ])
            ->assertRedirect(route('hris.performances.index'))
            ->assertSessionHasErrors('review');
    }

    /**
     * @return array{Employee, Employee}
     */
    private function employeePair(User $user): array
    {
        $division = Division::factory()->create(['user_id' => $user->id]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
        ]);
        $manager = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'manager-'.$user->id.'@example.com',
            'phone' => '62812345'.$user->id,
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'manager_id' => $manager->id,
        ]);

        return [$employee, $manager];
    }
}
