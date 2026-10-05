<?php

namespace Tests\Feature;

use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AttendanceCorrectionApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_visit_defaults_to_pending_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create(['user_id' => $admin->id]);

        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-01',
            'status' => 'pending',
            'request_type' => 'manual_attendance',
        ]);
        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-02',
            'status' => 'approved',
            'request_type' => 'manual_attendance',
        ]);

        $response = $this->actingAs($admin)->get(route('hris.attendance-approvals.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('hris/attendance-approvals/index')
            ->where('filters.status', 'pending')
            ->has('requests.data', 1)
            ->where('requests.data.0.status', 'pending')
        );
    }

    public function test_empty_status_or_all_preserves_all_statuses_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create(['user_id' => $admin->id]);

        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-01',
            'status' => 'pending',
            'request_type' => 'manual_attendance',
        ]);
        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-02',
            'status' => 'approved',
            'request_type' => 'manual_attendance',
        ]);
        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-03',
            'status' => 'rejected',
            'request_type' => 'manual_attendance',
        ]);

        // When user selects 'Semua status' (status is empty string or all)
        $response = $this->actingAs($admin)->get(route('hris.attendance-approvals.index', ['status' => '']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('hris/attendance-approvals/index')
            ->where('filters.status', '')
            ->has('requests.data', 3)
        );

        $responseAll = $this->actingAs($admin)->get(route('hris.attendance-approvals.index', ['status' => 'all']));

        $responseAll->assertOk();
        $responseAll->assertInertia(fn (Assert $page) => $page
            ->component('hris/attendance-approvals/index')
            ->where('filters.status', '')
            ->has('requests.data', 3)
        );
    }

    public function test_date_range_picker_filters_attendance_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create(['user_id' => $admin->id]);

        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-01',
            'status' => 'pending',
            'request_type' => 'manual_attendance',
        ]);
        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-05',
            'status' => 'pending',
            'request_type' => 'manual_attendance',
        ]);
        AttendanceCorrectionRequest::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-10',
            'status' => 'pending',
            'request_type' => 'manual_attendance',
        ]);

        $response = $this->actingAs($admin)->get(route('hris.attendance-approvals.index', [
            'status' => 'pending',
            'start_date' => '2026-10-04',
            'end_date' => '2026-10-06',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('hris/attendance-approvals/index')
            ->where('filters.start_date', '2026-10-04')
            ->where('filters.end_date', '2026-10-06')
            ->has('requests.data', 1)
            ->where('requests.data.0.attendance_date', '2026-10-05')
        );
    }
}
