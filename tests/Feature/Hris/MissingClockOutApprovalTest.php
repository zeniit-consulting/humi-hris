<?php

namespace Tests\Feature\Hris;

use App\Models\ApprovalSetting;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MissingClockOutApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_approval_of_missing_clock_out_preserves_existing_clock_in(): void
    {
        $owner = User::factory()->create();
        $approverUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $approver = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $approverUser->email,
            'is_active' => true,
        ]);
        $requester = Employee::factory()->create(['user_id' => $owner->id]);

        ApprovalSetting::query()->create([
            'user_id' => $owner->id,
            'request_type' => 'attendance',
            'two_line_enabled' => false,
            'first_approver_employee_id' => $approver->id,
        ]);
        $attendance = EmployeeAttendance::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $requester->id,
            'attendance_date' => '2026-07-01',
            'status' => 'present',
            'check_in_at' => '2026-07-01 01:00:00',
            'check_out_at' => null,
        ]);
        $request = AttendanceCorrectionRequest::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $requester->id,
            'attendance_date' => '2026-07-01',
            'request_type' => 'missing_clock_out',
            'check_in_at' => null,
            'check_out_at' => '2026-07-01 10:00:00',
            'reason' => 'Lupa clock out.',
            'status' => 'pending',
        ]);

        $this->actingAs($approverUser)
            ->postJson(route('portal.api.approvals.approve', ['type' => 'attendance', 'id' => $request->id]))
            ->assertOk();

        $this->assertSame('2026-07-01 01:00:00', $attendance->fresh()->check_in_at?->format('Y-m-d H:i:s'));
        $this->assertSame('2026-07-01 10:00:00', $attendance->fresh()->check_out_at?->format('Y-m-d H:i:s'));
        $this->assertSame('approved', $request->fresh()->status);
    }
}
