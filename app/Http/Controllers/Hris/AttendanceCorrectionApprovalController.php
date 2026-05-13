<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceCorrectionApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'date' => ['nullable', 'date'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? 'pending',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'date' => $validated['date'] ?? '',
        ];

        $requests = AttendanceCorrectionRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,division_id,position_id', 'employee.division:id,name', 'employee.position:id,name', 'shift:id,code,name,start_time,end_time,is_day_off', 'approver:id,name'])
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->when($filters['date'] !== '', fn ($query) => $query->whereDate('attendance_date', $filters['date']))
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('attendance_date')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (AttendanceCorrectionRequest $request) => $this->payload($request));

        $employees = Employee::query()
            ->where('user_id', $ownerId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name'])
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]);

        $stats = AttendanceCorrectionRequest::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('hris/attendance-approvals/index', [
            'requests' => $requests,
            'employees' => $employees,
            'filters' => $filters,
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => [
                'pending' => (int) ($stats['pending'] ?? 0),
                'approved' => (int) ($stats['approved'] ?? 0),
                'rejected' => (int) ($stats['rejected'] ?? 0),
            ],
        ]);
    }

    public function approve(Request $request, AttendanceCorrectionRequest $attendanceRequest): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $attendanceRequest->user_id === $ownerId, 404);

        if ($attendanceRequest->status !== 'pending') {
            return back()->with('error', 'Request absensi sudah diproses.');
        }

        DB::transaction(function () use ($request, $attendanceRequest, $ownerId): void {
            $attendance = EmployeeAttendance::query()->firstOrNew([
                'employee_id' => $attendanceRequest->employee_id,
                'attendance_date' => $attendanceRequest->attendance_date->toDateString(),
            ]);

            $attendance->fill([
                'user_id' => $ownerId,
                'shift_id' => $attendanceRequest->shift_id ?? $attendance->shift_id,
                'status' => 'present',
                'check_in_at' => $attendanceRequest->check_in_at ?? $attendance->check_in_at,
                'check_out_at' => $attendanceRequest->check_out_at ?? $attendance->check_out_at,
                'notes' => trim((string) ($attendance->notes ? $attendance->notes.'; ' : '').'Approved manual attendance request #'.$attendanceRequest->id),
            ]);
            $attendance->save();

            $attendanceRequest->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);
        });

        return back()->with('success', 'Request absensi disetujui dan data absensi diperbarui.');
    }

    public function reject(Request $request, AttendanceCorrectionRequest $attendanceRequest): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $attendanceRequest->user_id === $ownerId, 404);

        if ($attendanceRequest->status !== 'pending') {
            return back()->with('error', 'Request absensi sudah diproses.');
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:255'],
        ]);

        $attendanceRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Request absensi ditolak.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(AttendanceCorrectionRequest $request): array
    {
        return [
            'id' => $request->id,
            'employee_label' => $request->employee ? $request->employee->employee_code.' - '.$request->employee->full_name : '-',
            'division_name' => $request->employee?->division?->name,
            'position_name' => $request->employee?->position?->name,
            'attendance_date' => $request->attendance_date?->format('Y-m-d'),
            'shift' => $request->shift ? [
                'id' => $request->shift->id,
                'code' => $request->shift->code,
                'name' => $request->shift->name,
                'start_time' => $request->shift->start_time,
                'end_time' => $request->shift->end_time,
                'is_day_off' => $request->shift->is_day_off,
            ] : null,
            'check_in_at' => $request->check_in_at?->toIso8601String(),
            'check_out_at' => $request->check_out_at?->toIso8601String(),
            'reason' => $request->reason,
            'status' => $request->status,
            'approved_by' => $request->approver?->name,
            'approved_at' => $request->approved_at?->toIso8601String(),
            'rejection_reason' => $request->rejection_reason,
        ];
    }
}
