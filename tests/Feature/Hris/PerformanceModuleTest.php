<?php

namespace Tests\Feature\Hris;

use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\PerformanceKpiResult;
use App\Models\PerformanceKpiTemplate;
use App\Models\PerformanceObjective;
use App\Models\PerformancePeriod;
use App\Models\PerformanceReview;
use App\Models\Position;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
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
        $this->activatePlan($user, 'plus');

        $this->actingAs($user)
            ->get(route('hris.performances.index'))
            ->assertOk();
    }

    public function test_basic_plan_cannot_open_performance_page(): void
    {
        $user = User::factory()->create();
        $this->activatePlan($user, 'core', ['performance']);

        $this->actingAs($user)
            ->get(route('hris.performances.index'))
            ->assertRedirect(route('billing.index'));
    }

    public function test_free_plan_cannot_open_performance_page(): void
    {
        $user = User::factory()->create();
        $this->activatePlan($user, 'free', ['performance']);

        $this->actingAs($user)
            ->get(route('hris.performances.index'))
            ->assertRedirect(route('billing.index'));
    }

    public function test_review_prefills_template_kpis_and_calculates_final_score_with_50_40_10_ratio(): void
    {
        $user = User::factory()->create();
        $this->activatePlan($user, 'plus');
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
        ])->assertRedirect()->assertSessionHasNoErrors();

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

    public function test_key_result_score_is_calculated_from_actual_and_target_values(): void
    {
        $user = User::factory()->create();
        $this->activatePlan($user, 'plus');
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
            'status' => 'in_progress',
        ]);

        $this->actingAs($user)->post(route('hris.performances.reviews.objectives.store', $review), [
            'title' => 'Improve output',
            'description' => null,
            'weight' => 1,
            'status' => 'on_track',
        ])->assertRedirect();

        $objective = PerformanceObjective::query()->firstOrFail();

        $this->actingAs($user)->post(route('hris.performances.objectives.key-results.store', $objective), [
            'title' => 'Complete project milestones',
            'target_value' => 100,
            'actual_value' => 50,
            'unit' => '%',
            'score' => 120,
            'status' => 'on_track',
        ])->assertRedirect();

        $objective->refresh();
        $review->refresh();

        $this->assertSame('50.00', (string) $objective->keyResults()->firstOrFail()->score);
        $this->assertSame('50.00', (string) $objective->score);
        $this->assertSame('50.00', (string) $review->okr_score);
    }

    public function test_attendance_kpi_reads_attendance_records_for_the_review_period(): void
    {
        $user = User::factory()->create();
        $this->activatePlan($user, 'plus');
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
        ])->assertRedirect()->assertSessionHasNoErrors();

        $result = PerformanceKpiResult::query()->firstOrFail();

        $this->assertSame('66.67', (string) $result->actual_value);
        $this->assertSame('83.34', (string) $result->score);
    }

    public function test_attendance_kpi_counts_scheduled_workdays_without_attendance_as_absent(): void
    {
        $user = User::factory()->create();
        $this->activatePlan($user, 'plus');
        [$employee, $manager] = $this->employeePair($user);

        $period = PerformancePeriod::query()->create([
            'user_id' => $user->id,
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-03',
            'status' => 'active',
        ]);

        $template = PerformanceKpiTemplate::query()->create([
            'user_id' => $user->id,
            'division_id' => $employee->division_id,
            'name' => 'Attendance KPI',
            'is_active' => true,
        ]);

        $this->actingAs($user)->post(route('hris.performances.templates.metrics.store', $template), [
            'name' => 'Absent Count',
            'target_value' => 0,
            'unit' => 'hari',
            'weight' => 1,
            'input_type' => 'attendance',
            'attendance_metric' => 'absent_count',
            'direction' => 'lower_is_better',
        ])->assertRedirect();

        foreach (['2026-06-01', '2026-06-02', '2026-06-03'] as $date) {
            EmployeeSchedule::query()->create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'work_date' => $date,
                'shift_code' => 'SHIFT_A',
                'start_time' => '08:00',
                'end_time' => '17:00',
                'is_day_off' => false,
            ]);
        }

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-01',
            'status' => 'present',
            'check_in_at' => '2026-06-01 08:00:00',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-02',
            'status' => 'present',
            'check_in_at' => '2026-06-02 08:00:00',
        ]);

        $this->actingAs($user)->post(route('hris.performances.reviews.store'), [
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'manager_id' => $manager->id,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $result = PerformanceKpiResult::query()->firstOrFail();

        $this->assertSame('1.00', (string) $result->actual_value);
    }

    public function test_manager_cannot_update_review_outside_their_scope(): void
    {
        $owner = User::factory()->create();
        $this->activatePlan($owner, 'plus');
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
        $this->activatePlan($user, 'plus');
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

    /**
     * @param list<string> $lockedFeatures
     */
    private function activatePlan(User $user, string $planSlug, array $lockedFeatures = []): void
    {
        SubscriptionPlan::query()->updateOrCreate(
            ['slug' => $planSlug],
            [
                'name' => match ($planSlug) {
                    'free' => 'Free',
                    'core' => 'Basic',
                    default => 'Plus',
                },
                'price_per_employee' => match ($planSlug) {
                    'free' => 0,
                    'core' => 2900,
                    default => 7500,
                },
                'max_employees' => $planSlug === 'free' ? 10 : null,
                'max_months' => $planSlug === 'free' ? 1 : null,
                'locked_features' => $lockedFeatures,
                'is_active' => true,
            ],
        );

        Subscription::query()->updateOrCreate(
            ['user_id' => $user->accountOwnerId()],
            [
                'plan_slug' => $planSlug,
                'status' => 'active',
                'employee_count' => 0,
                'current_period_start' => now()->toDateString(),
                'current_period_end' => now()->addMonth()->toDateString(),
                'trial_ends_at' => null,
            ],
        );
    }
}
