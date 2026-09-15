<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use App\Models\WorkShift;
use App\Models\EmployeeSchedule;
use App\Services\ApprovalWorkflowService;
use App\Services\LeaveApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalApprovalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employee = $this->employee($request->user());
        abort_unless($employee && app(ApprovalWorkflowService::class)->hasApprovalLine($employee), 404);

        $attendanceRows = AttendanceCorrectionRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with(['employee:id,employee_code,first_name,last_name', 'shift:id,name,code,start_time,end_time'])
            ->latest()
            ->get()
            ->map(function ($row) {
                $checkIn = $row->check_in_at ? \Carbon\Carbon::parse($row->check_in_at)->format('H:i') : '-';
                $checkOut = $row->check_out_at ? \Carbon\Carbon::parse($row->check_out_at)->format('H:i') : '-';
                $dateFormatted = $row->attendance_date ? \Carbon\Carbon::parse($row->attendance_date)->locale('id')->isoFormat('D MMM Y') : '-';

                return [
                    'id' => $row->id,
                    'type' => 'attendance',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $row->created_at?->toDateString(),
                    'title' => 'Koreksi Absensi (' . ($row->shift?->name ?? 'Shift') . ')',
                    'subtitle' => $dateFormatted . ' • ' . $checkIn . ' - ' . $checkOut,
                    'reason' => $row->reason,
                    'badge' => $row->request_type === 'clock_out' ? 'Lupa Clock Out' : ($row->request_type === 'clock_in' ? 'Lupa Clock In' : 'Koreksi Absen'),
                ];
            });

        $leaveRows = LeaveRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with('employee:id,employee_code,first_name,last_name')
            ->latest()
            ->get()
            ->map(function ($row) {
                $start = $row->start_date ? \Carbon\Carbon::parse($row->start_date)->locale('id')->isoFormat('D MMM') : '-';
                $end = $row->end_date ? \Carbon\Carbon::parse($row->end_date)->locale('id')->isoFormat('D MMM Y') : '-';
                $days = (float) $row->total_days;
                $leaveTypeMap = [
                    'annual' => 'Cuti Tahunan',
                    'sick' => 'Izin Sakit',
                    'unpaid' => 'Izin Tidak Berbayar',
                    'other' => 'Izin / Cuti Khusus',
                ];

                return [
                    'id' => $row->id,
                    'type' => 'leave',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $row->created_at?->toDateString(),
                    'title' => $leaveTypeMap[$row->leave_type] ?? 'Pengajuan Cuti',
                    'subtitle' => ($start === $end ? $start : $start . ' - ' . $end) . ' (' . $days . ' hari)',
                    'reason' => $row->reason,
                    'attachment' => $row->attachment ? asset('storage/' . $row->attachment) : null,
                    'attachment_name' => $row->attachment_name,
                    'badge' => $leaveTypeMap[$row->leave_type] ?? ucfirst((string) $row->leave_type),
                ];
            });

        $overtimeRows = OvertimeRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with('employee:id,employee_code,first_name,last_name')
            ->latest()
            ->get()
            ->map(function ($row) {
                $dateFormatted = $row->work_date ? \Carbon\Carbon::parse($row->work_date)->locale('id')->isoFormat('D MMM Y') : '-';
                $hours = (float) $row->total_hours;

                return [
                    'id' => $row->id,
                    'type' => 'overtime',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $row->created_at?->toDateString(),
                    'title' => $row->is_event ? 'Lembur Event: ' . ($row->event_name ?? 'Kegiatan Khusus') : 'Lembur Reguler',
                    'subtitle' => $dateFormatted . ' • ' . ($row->start_time ?? '-') . ' - ' . ($row->end_time ?? '-') . ' (' . $hours . ' jam)',
                    'reason' => $row->reason,
                    'badge' => $row->is_event ? 'Event' : 'Lembur',
                ];
            });

        $shiftRows = ShiftChangeRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with(['employee:id,employee_code,first_name,last_name', 'currentShift:id,name,code', 'requestedShift:id,name,code'])
            ->latest()
            ->get()
            ->map(function ($row) {
                $dateFormatted = $row->requested_date ? \Carbon\Carbon::parse($row->requested_date)->locale('id')->isoFormat('D MMM Y') : '-';
                $fromShift = $row->currentShift?->name ?? 'Shift Awal';
                $toShift = $row->requestedShift?->name ?? 'Shift Baru';

                return [
                    'id' => $row->id,
                    'type' => 'shift_change',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $row->created_at?->toDateString(),
                    'title' => 'Tukar Shift: ' . $fromShift . ' → ' . $toShift,
                    'subtitle' => 'Tanggal: ' . $dateFormatted,
                    'reason' => $row->reason,
                    'badge' => 'Tukar Shift',
                ];
            });

        $items = $attendanceRows
            ->concat($leaveRows)
            ->concat($overtimeRows)
            ->concat($shiftRows)
            ->sortByDesc('created_at')
            ->values();

        return response()->json(['data' => ['items' => $items]]);
    }
    public function approve(Request $request, string $type, int $id): JsonResponse
    {
        $model = $this->requestFor($type, $id); $actor = $request->user();
        $result = app(ApprovalWorkflowService::class)->approve($model, $actor);
        if ($result === ApprovalWorkflowService::ADVANCED) return response()->json(['message' => 'Approval tahap 1 berhasil.']);
        match ($type) {
            'leave' => app(LeaveApprovalService::class)->approve($model, $actor),
            'overtime' => $model->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now(), 'notes' => null]),
            'attendance' => $this->approveAttendance($model, $actor),
            'shift_change' => $this->approveShift($model, $actor),
        };
        app(\App\Services\TelegramNotificationService::class)->notifyEmployeeRequestStatus($type, $model, 'approved');
        return response()->json(['message' => 'Request disetujui.']);
    }
    public function reject(Request $request, string $type, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);
        $model = $this->requestFor($type, $id);
        app(ApprovalWorkflowService::class)->reject($model, $request->user(), $data['reason']);
        app(\App\Services\TelegramNotificationService::class)->notifyEmployeeRequestStatus($type, $model, 'rejected', $data['reason']);
        return response()->json(['message' => 'Request ditolak.']);
    }
    private function requestFor(string $type, int $id): AttendanceCorrectionRequest|LeaveRequest|OvertimeRequest|ShiftChangeRequest { return match ($type) { 'attendance' => AttendanceCorrectionRequest::findOrFail($id), 'leave' => LeaveRequest::findOrFail($id), 'overtime' => OvertimeRequest::findOrFail($id), 'shift_change' => ShiftChangeRequest::findOrFail($id), default => abort(404) }; }
    private function employee(User $user): ?Employee { return Employee::query()->where(function ($query) use ($user) { if ($user->email) $query->where('email', $user->email); if ($user->phone) $query->orWhere('phone', $user->phone); })->first(); }
    private function approveAttendance(AttendanceCorrectionRequest $item, User $actor): void
    {
        $attendance = EmployeeAttendance::query()->firstOrNew([
            'employee_id' => $item->employee_id,
            'attendance_date' => $item->attendance_date,
        ]);

        $attendance->fill([
            'user_id' => $item->user_id,
            'shift_id' => $item->shift_id ?? $attendance->shift_id,
            'status' => 'present',
            'check_in_at' => $item->check_in_at ?? $attendance->check_in_at,
            'check_out_at' => $item->check_out_at ?? $attendance->check_out_at,
        ]);
        $attendance->save();
        app(\App\Services\AutoOvertimeService::class)->syncFromAttendance($attendance, (int) $item->user_id);

        $item->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now()]);
    }
    private function approveShift(ShiftChangeRequest $item, User $actor): void { $shift = WorkShift::findOrFail($item->requested_shift_id); EmployeeSchedule::query()->updateOrCreate(['employee_id' => $item->employee_id, 'work_date' => $item->requested_date], ['user_id' => $item->user_id, 'shift_code' => $shift->code, 'start_time' => $shift->start_time, 'end_time' => $shift->end_time, 'is_day_off' => $shift->is_day_off]); $item->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now()]); }
}
