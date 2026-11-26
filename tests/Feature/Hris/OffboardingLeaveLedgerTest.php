<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeLeaveBalanceTransaction;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Services\EmployeeOffboardingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OffboardingLeaveLedgerTest extends TestCase
{
    use RefreshDatabase;

    public function test_offboarding_removes_future_leave_without_deleting_its_ledger(): void
    {
        $this->travelTo(now()->setDate(2026, 11, 26));
        $owner = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $owner->id]);
        $otherEmployee = Employee::factory()->create(['user_id' => $owner->id]);
        $this->actingAs($owner);

        $pastLeave = LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'start_date' => '2026-07-31',
            'end_date' => '2026-07-31',
        ]);
        $otherLeave = LeaveRequest::factory()->create([
            'employee_id' => $otherEmployee->id,
            'start_date' => '2026-08-03',
            'end_date' => '2026-08-03',
        ]);
        $futureLeave = LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'start_date' => '2026-08-03',
            'end_date' => '2026-08-03',
            'status' => 'approved',
            'leave_type' => 'annual',
            'total_days' => 1,
        ]);
        $transaction = EmployeeLeaveBalanceTransaction::create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'year' => 2026,
            'amount' => -1,
            'type' => 'usage',
            'description' => 'Pemakaian cuti 03/08/2026',
            'leave_request_id' => $futureLeave->id,
            'balance_after' => 11,
            'effective_date' => '2026-08-03',
        ]);

        app(EmployeeOffboardingService::class)->scheduleOrExecuteOffboard($employee, [
            'offboarded_at' => '2026-07-31',
            'offboarding_reason' => 'resigned',
        ], $owner);

        $this->assertDatabaseMissing('leave_requests', ['id' => $futureLeave->id]);
        $this->assertDatabaseHas('leave_requests', ['id' => $pastLeave->id]);
        $this->assertDatabaseHas('leave_requests', ['id' => $otherLeave->id]);
        $this->assertDatabaseHas('employee_leave_balance_transactions', [
            'id' => $transaction->id,
            'leave_request_id' => null,
            'amount' => -1,
            'balance_after' => 11,
            'description' => 'Pemakaian cuti 03/08/2026',
        ]);
        $this->assertSame('resigned', $employee->fresh()->employment_status);
    }
}
