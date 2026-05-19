<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Services\LeaveBalanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user?->isClientSupervisor(), 403);

        $ownerId = $user->accountOwnerId();
        $subCompanyIds = $user->subCompanyScopeIds();
        abort_if($subCompanyIds === [], 403);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
        ]);
        $status = $validated['status'] ?? 'pending';

        return Inertia::render('client/approvals/index', [
            'status' => $status,
            'subCompanies' => $user->clientSubCompanies()
                ->orderBy('name')
                ->get(['sub_companies.id', 'code', 'name'])
                ->map(fn ($company) => $company->only(['id', 'code', 'name']))
                ->values(),
            'attendanceRequests' => AttendanceCorrectionRequest::query()
                ->with(['employee:id,employee_code,first_name,last_name,sub_company_id', 'shift:id,code,name'])
                ->where('user_id', $ownerId)
                ->whereHas('employee', fn ($query) => $query->whereIn('sub_company_id', $subCompanyIds))
                ->where('status', $status)
                ->orderByDesc('attendance_date')
                ->limit(50)
                ->get()
                ->map(fn (AttendanceCorrectionRequest $row): array => [
                    'id' => $row->id,
                    'employee_label' => $row->employee?->employee_code.' - '.$row->employee?->full_name,
                    'date' => $row->attendance_date?->format('Y-m-d'),
                    'description' => trim(($row->check_in_at?->format('H:i') ?? '-').' / '.($row->check_out_at?->format('H:i') ?? '-')),
                    'reason' => $row->reason,
                    'status' => $row->status,
                ]),
            'leaveRequests' => LeaveRequest::query()
                ->with('employee:id,employee_code,first_name,last_name,sub_company_id')
                ->where('user_id', $ownerId)
                ->whereHas('employee', fn ($query) => $query->whereIn('sub_company_id', $subCompanyIds))
                ->where('status', $status)
                ->orderByDesc('start_date')
                ->limit(50)
                ->get()
                ->map(fn (LeaveRequest $row): array => [
                    'id' => $row->id,
                    'employee_label' => $row->employee?->employee_code.' - '.$row->employee?->full_name,
                    'date' => $row->start_date?->format('Y-m-d').' s/d '.$row->end_date?->format('Y-m-d'),
                    'description' => $row->leave_type.' - '.$row->total_days.' hari',
                    'reason' => $row->reason,
                    'status' => $row->status,
                ]),
            'overtimeRequests' => OvertimeRequest::query()
                ->with('employee:id,employee_code,first_name,last_name,sub_company_id')
                ->where('user_id', $ownerId)
                ->whereHas('employee', fn ($query) => $query->whereIn('sub_company_id', $subCompanyIds))
                ->where('status', $status)
                ->orderByDesc('work_date')
                ->limit(50)
                ->get()
                ->map(fn (OvertimeRequest $row): array => [
                    'id' => $row->id,
                    'employee_label' => $row->employee?->employee_code.' - '.$row->employee?->full_name,
                    'date' => $row->work_date?->format('Y-m-d'),
                    'description' => $row->start_time.' - '.$row->end_time.' ('.$row->total_hours.' jam)',
                    'reason' => $row->reason,
                    'status' => $row->status,
                ]),
        ]);
    }

    public function approveAttendance(Request $request, AttendanceCorrectionRequest $attendanceRequest): RedirectResponse
    {
        $this->authorizeScoped($request, $attendanceRequest->employee_id, $attendanceRequest->user_id);

        DB::transaction(function () use ($request, $attendanceRequest): void {
            $attendance = EmployeeAttendance::query()->firstOrNew([
                'employee_id' => $attendanceRequest->employee_id,
                'attendance_date' => $attendanceRequest->attendance_date->toDateString(),
            ]);

            $attendance->fill([
                'user_id' => $request->user()->accountOwnerId(),
                'shift_id' => $attendanceRequest->shift_id ?? $attendance->shift_id,
                'status' => 'present',
                'check_in_at' => $attendanceRequest->check_in_at ?? $attendance->check_in_at,
                'check_out_at' => $attendanceRequest->check_out_at ?? $attendance->check_out_at,
                'notes' => trim((string) ($attendance->notes ? $attendance->notes.'; ' : '').'Approved by client supervisor #'.$request->user()->id),
            ]);
            $attendance->save();

            $attendanceRequest->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);
        });

        return back()->with('success', 'Request absensi disetujui.');
    }

    public function rejectAttendance(Request $request, AttendanceCorrectionRequest $attendanceRequest): RedirectResponse
    {
        $this->authorizeScoped($request, $attendanceRequest->employee_id, $attendanceRequest->user_id);
        $attendanceRequest->update($this->rejectionPayload($request));

        return back()->with('success', 'Request absensi ditolak.');
    }

    public function approveLeave(Request $request, LeaveRequest $leave): RedirectResponse
    {
        $this->authorizeScoped($request, $leave->employee_id, $leave->user_id);
        $leave->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'rejection_reason' => null,
        ]);

        if ($leave->leave_type === 'annual') {
            app(LeaveBalanceService::class)->deductBalance($leave);
        }

        return back()->with('success', 'Pengajuan cuti disetujui.');
    }

    public function rejectLeave(Request $request, LeaveRequest $leave): RedirectResponse
    {
        $this->authorizeScoped($request, $leave->employee_id, $leave->user_id);
        $payload = $this->rejectionPayload($request);
        $leave->update([
            ...$payload,
            'rejection_reason' => $payload['rejection_reason'],
        ]);

        return back()->with('success', 'Pengajuan cuti ditolak.');
    }

    public function approveOvertime(Request $request, OvertimeRequest $overtime): RedirectResponse
    {
        $this->authorizeScoped($request, $overtime->employee_id, $overtime->user_id);
        $overtime->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'notes' => null,
        ]);

        return back()->with('success', 'Pengajuan lembur disetujui.');
    }

    public function rejectOvertime(Request $request, OvertimeRequest $overtime): RedirectResponse
    {
        $this->authorizeScoped($request, $overtime->employee_id, $overtime->user_id);
        $payload = $this->rejectionPayload($request);
        $overtime->update([
            'status' => 'rejected',
            'approved_by' => $payload['approved_by'],
            'approved_at' => $payload['approved_at'],
            'notes' => $payload['rejection_reason'],
        ]);

        return back()->with('success', 'Pengajuan lembur ditolak.');
    }

    private function authorizeScoped(Request $request, int $employeeId, int $ownerId): void
    {
        $user = $request->user();
        abort_unless($user?->isClientSupervisor(), 403);
        abort_unless((int) $ownerId === $user->accountOwnerId(), 404);
        $subCompanyIds = $user->subCompanyScopeIds();
        abort_if($subCompanyIds === [], 403);

        $exists = Employee::query()
            ->where('user_id', $user->accountOwnerId())
            ->whereIn('sub_company_id', $subCompanyIds)
            ->where('id', $employeeId)
            ->exists();

        abort_unless($exists, 404);
    }

    private function rejectionPayload(Request $request): array
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:255'],
        ]);

        return [
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ];
    }
}
