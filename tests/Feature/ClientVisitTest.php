<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeClientVisit;
use App\Models\Position;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClientVisitTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_user_can_start_and_clock_out_client_visit_with_device_timezone(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'field@example.com',
            'email_verified_at' => now(),
        ]);
        $this->activatePlan($user);
        $employee = $this->employeeForUser($user);

        $this->actingAs($user)
            ->withHeader('X-Timezone', 'Asia/Makassar')
            ->postJson(route('portal.api.client-visits.store'), [
                'client_name' => 'PT Contoh',
                'work_description' => 'Meeting implementasi.',
                'clock_in_at' => '2026-05-19T09:30:00',
                'clock_in_latitude' => -6.20001,
                'clock_in_longitude' => 106.81667,
            ])
            ->assertCreated()
            ->assertJsonPath('data.client_name', 'PT Contoh')
            ->assertJsonPath('data.clock_in_at', '2026-05-19T09:30:00+08:00')
            ->assertJsonPath('data.status', 'in_progress');

        $visit = EmployeeClientVisit::query()->firstOrFail();

        $this->assertSame($employee->id, $visit->employee_id);
        $this->assertSame('2026-05-19', $visit->visit_date?->format('Y-m-d'));
        $this->assertSame('2026-05-19 01:30:00', $visit->clock_in_at?->format('Y-m-d H:i:s'));

        $this->actingAs($user)
            ->withHeader('X-Timezone', 'Asia/Makassar')
            ->putJson(route('portal.api.client-visits.clock-out', $visit), [
                'clock_out_at' => '2026-05-19T11:00:00',
                'clock_out_latitude' => -6.20111,
                'clock_out_longitude' => 106.81777,
            ])
            ->assertOk()
            ->assertJsonPath('data.clock_out_at', '2026-05-19T11:00:00+08:00')
            ->assertJsonPath('data.duration_seconds', 5400)
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_portal_user_can_have_multiple_client_visits_in_one_day(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'multi-visit@example.com',
            'email_verified_at' => now(),
        ]);
        $this->activatePlan($user);
        $this->employeeForUser($user);

        foreach (['Client A', 'Client B'] as $index => $clientName) {
            $this->actingAs($user)
                ->postJson(route('portal.api.client-visits.store'), [
                    'client_name' => $clientName,
                    'work_description' => 'Kunjungan '.$clientName,
                    'clock_in_at' => "2026-05-19T0{$index}:00:00Z",
                    'clock_in_latitude' => -6.2 - $index,
                    'clock_in_longitude' => 106.8 + $index,
                ])
                ->assertCreated();
        }

        $this->assertDatabaseCount('employee_client_visits', 2);

        $this->actingAs($user)
            ->getJson(route('portal.api.client-visits.index', ['date' => '2026-05-19']))
            ->assertOk()
            ->assertJsonCount(2, 'data.items');
    }

    public function test_portal_user_cannot_clock_out_another_users_client_visit(): void
    {
        $owner = User::factory()->create(['role' => 'user', 'email' => 'owner@example.com']);
        $intruder = User::factory()->create(['role' => 'user', 'email' => 'intruder@example.com']);
        $this->activatePlan($owner);
        $this->activatePlan($intruder);
        $ownerEmployee = $this->employeeForUser($owner);
        $this->employeeForUser($intruder);

        $visit = EmployeeClientVisit::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $ownerEmployee->id,
            'client_name' => 'PT Rahasia',
            'work_description' => 'Visit terbatas.',
            'visit_date' => '2026-05-19',
            'clock_in_at' => '2026-05-19 01:00:00',
            'clock_in_latitude' => -6.2,
            'clock_in_longitude' => 106.8,
        ]);

        $this->actingAs($intruder)
            ->putJson(route('portal.api.client-visits.clock-out', $visit), [
                'clock_out_at' => '2026-05-19T03:00:00Z',
                'clock_out_latitude' => -6.3,
                'clock_out_longitude' => 106.9,
            ])
            ->assertNotFound();

        $this->assertNull($visit->refresh()->clock_out_at);
    }

    public function test_admin_can_view_daily_client_visit_history_and_total_duration(): void
    {
        $this->withoutVite();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->activatePlan($admin);
        $employee = $this->employeeForUser($admin);

        EmployeeClientVisit::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'client_name' => 'Client A',
            'work_description' => 'Survey lokasi.',
            'visit_date' => '2026-05-19',
            'clock_in_at' => '2026-05-19 01:00:00',
            'clock_in_latitude' => -6.2,
            'clock_in_longitude' => 106.8,
            'clock_out_at' => '2026-05-19 02:00:00',
            'clock_out_latitude' => -6.21,
            'clock_out_longitude' => 106.81,
        ]);
        EmployeeClientVisit::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'client_name' => 'Client B',
            'work_description' => 'Training.',
            'visit_date' => '2026-05-19',
            'clock_in_at' => '2026-05-19 03:00:00',
            'clock_in_latitude' => -6.22,
            'clock_in_longitude' => 106.82,
            'clock_out_at' => '2026-05-19 03:30:00',
            'clock_out_latitude' => -6.23,
            'clock_out_longitude' => 106.83,
        ]);

        $this->actingAs($admin)
            ->get(route('hris.client-visits.index', ['date' => '2026-05-19']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/client-visits/index')
                ->where('summary.total_visits', 2)
                ->where('summary.total_duration_seconds', 5400)
                ->where('summary.employees.0.total_duration_seconds', 5400)
                ->where('visits.data.0.client_name', 'Client A')
            );
    }

    private function employeeForUser(User $user): Employee
    {
        $division = Division::factory()->create(['user_id' => $user->accountOwnerId()]);
        $position = Position::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
        ]);

        return Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'employment_status' => 'active',
        ]);
    }

    private function activatePlan(User $user): void
    {
        SubscriptionPlan::query()->updateOrCreate(
            ['slug' => 'plus'],
            [
                'name' => 'Plus',
                'price_per_employee' => 7500,
                'max_employees' => null,
                'max_months' => null,
                'locked_features' => [],
                'is_active' => true,
            ],
        );

        Subscription::query()->updateOrCreate(
            ['user_id' => $user->accountOwnerId()],
            [
                'plan_slug' => 'plus',
                'status' => 'active',
                'employee_count' => 0,
                'current_period_start' => now()->toDateString(),
                'current_period_end' => now()->addMonth()->toDateString(),
                'trial_ends_at' => null,
            ],
        );
    }
}
