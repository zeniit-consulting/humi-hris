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
        abort_unless($employee, 404);
        $items = collect([
            ['type' => 'attendance', 'rows' => AttendanceCorrectionRequest::query()->where('status', 'pending')->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))->with('employee:id,employee_code,first_name,last_name')->get()],
            ['type' => 'leave', 'rows' => LeaveRequest::query()->where('status', 'pending')->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))->with('employee:id,employee_code,first_name,last_name')->get()],
            ['type' => 'overtime', 'rows' => OvertimeRequest::query()->where('status', 'pending')->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))->with('employee:id,employee_code,first_name,last_name')->get()],
            ['type' => 'shift_change', 'rows' => ShiftChangeRequest::query()->where('status', 'pending')->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))->with('employee:id,employee_code,first_name,last_name')->get()],
        ])->flatMap(fn (array $group) => $group['rows']->map(fn ($row) => ['id' => $row->id, 'type' => $group['type'], 'employee_label' => $row->employee?->employee_code.' - '.$row->employee?->full_name, 'stage' => $row->approval_stage + 1, 'created_at' => $row->created_at?->toDateString()]));
        return response()->json(['data' => ['items' => $items->values()]]);
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
        return response()->json(['message' => 'Request disetujui.']);
    }
    public function reject(Request $request, string $type, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);
        app(ApprovalWorkflowService::class)->reject($this->requestFor($type, $id), $request->user(), $data['reason']);
        return response()->json(['message' => 'Request ditolak.']);
    }
    private function requestFor(string $type, int $id): AttendanceCorrectionRequest|LeaveRequest|OvertimeRequest|ShiftChangeRequest { return match ($type) { 'attendance' => AttendanceCorrectionRequest::findOrFail($id), 'leave' => LeaveRequest::findOrFail($id), 'overtime' => OvertimeRequest::findOrFail($id), 'shift_change' => ShiftChangeRequest::findOrFail($id), default => abort(404) }; }
    private function employee(User $user): ?Employee { return Employee::query()->where(function ($query) use ($user) { if ($user->email) $query->where('email', $user->email); if ($user->phone) $query->orWhere('phone', $user->phone); })->first(); }
    private function approveAttendance(AttendanceCorrectionRequest $item, User $actor): void { EmployeeAttendance::query()->updateOrCreate(['employee_id' => $item->employee_id, 'attendance_date' => $item->attendance_date], ['user_id' => $item->user_id, 'shift_id' => $item->shift_id, 'status' => 'present', 'check_in_at' => $item->check_in_at, 'check_out_at' => $item->check_out_at]); $item->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now()]); }
    private function approveShift(ShiftChangeRequest $item, User $actor): void { $shift = WorkShift::findOrFail($item->requested_shift_id); EmployeeSchedule::query()->updateOrCreate(['employee_id' => $item->employee_id, 'work_date' => $item->requested_date], ['user_id' => $item->user_id, 'shift_code' => $shift->code, 'start_time' => $shift->start_time, 'end_time' => $shift->end_time, 'is_day_off' => $shift->is_day_off]); $item->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now()]); }
}
