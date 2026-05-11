<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\StoreLeaveRequest;
use App\Http\Requests\Hris\UpdateLeaveRequest;
use App\Models\Employee;
use App\Models\EmployeeLeaveBalance;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    /**
     * Display leave management page.
     */
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'date' => ['nullable', 'date'],
        ]);

        $activeDate = Carbon::parse($validated['date'] ?? today())->toDateString();

        $filters = [
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'date' => $activeDate,
        ];

        $leaves = LeaveRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->whereDate('start_date', '<=', $filters['date'])
            ->whereDate('end_date', '>=', $filters['date'])
            ->orderByDesc('start_date')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (LeaveRequest $leave) => [
                'id' => $leave->id,
                'employee_id' => $leave->employee_id,
                'employee_label' => $leave->employee
                    ? $leave->employee->employee_code.' - '.$leave->employee->full_name
                    : '-',
                'leave_type' => $leave->leave_type,
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'total_days' => $leave->total_days,
                'reason' => $leave->reason,
                'status' => $leave->status,
                'rejection_reason' => $leave->rejection_reason,
            ]);

        $employees = Employee::query()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        return Inertia::render('hris/leaves/index', [
            'leaves' => $leaves,
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]),
            'filters' => $filters,
            'statusOptions' => ['pending', 'approved', 'rejected', 'cancelled'],
            'typeOptions' => ['annual', 'sick', 'unpaid', 'other'],
            'stats' => [
                'pending' => LeaveRequest::query()->where('status', 'pending')->count(),
                'approved' => LeaveRequest::query()->where('status', 'approved')->count(),
            ],
        ]);
    }

    /**
     * Store leave request.
     */
    public function store(StoreLeaveRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $totalDays = $this->calculateTotalDays($validated['start_date'], $validated['end_date']);

        // Validate max_days_per_request for annual lump_sum policy
        if ($validated['leave_type'] === 'annual') {
            $owner = User::find($request->user()->accountOwnerId());
            $balanceService = app(LeaveBalanceService::class);
            $policy = $balanceService->getPolicy($owner, 'annual');

            if ($policy && $policy->isLumpSum() && $policy->max_days_per_request) {
                if ($totalDays > $policy->max_days_per_request) {
                    return back()->withErrors(['total_days' => "Maksimal pengajuan cuti tahunan adalah {$policy->max_days_per_request} hari sekaligus."]);
                }
            }
        }

        [$approvedAt, $approvedBy] = $this->resolveApprovalState($validated['status'], $request->user()?->id);

        $leave = LeaveRequest::create([
            ...$validated,
            'total_days' => $totalDays,
            'approved_at' => $approvedAt,
            'approved_by' => $approvedBy,
        ]);

        // Send WhatsApp notification if status is approved or rejected
        if (in_array($validated['status'], ['approved', 'rejected'], true)) {
            $leave->loadMissing('employee');
            app(\App\Services\WhatsAppNotificationService::class)->notifyLeaveStatus($leave);
        }

        // Deduct balance when annual leave is approved on creation
        if ($validated['leave_type'] === 'annual' && $validated['status'] === 'approved') {
            $balanceService = app(LeaveBalanceService::class);
            if (! $balanceService->deductBalance($leave)) {
                $remaining = $this->getRemainingBalance($leave);
                $leave->delete();

                return back()->withErrors(['balance' => "Saldo cuti tidak mencukupi. Sisa saldo: {$remaining} hari."]);
            }
        }

        return back();
    }

    /**
     * Update leave request.
     */
    public function update(UpdateLeaveRequest $request, LeaveRequest $leave): RedirectResponse
    {
        $validated = $request->validated();

        $totalDays = $this->calculateTotalDays($validated['start_date'], $validated['end_date']);
        $previousStatus = $leave->status;
        $newStatus = $validated['status'];

        // Validate max_days_per_request for annual lump_sum policy
        if ($validated['leave_type'] === 'annual') {
            $owner = User::find($request->user()->accountOwnerId());
            $balanceService = app(LeaveBalanceService::class);
            $policy = $balanceService->getPolicy($owner, 'annual');

            if ($policy && $policy->isLumpSum() && $policy->max_days_per_request) {
                if ($totalDays > $policy->max_days_per_request) {
                    return back()->withErrors(['total_days' => "Maksimal pengajuan cuti tahunan adalah {$policy->max_days_per_request} hari sekaligus."]);
                }
            }
        }

        [$approvedAt, $approvedBy] = $this->resolveApprovalState(
            $newStatus,
            $request->user()?->id,
            $leave->approved_at?->toDateTimeString(),
            $leave->approved_by
        );

        $leave->update([
            ...$validated,
            'total_days' => $totalDays,
            'approved_at' => $approvedAt,
            'approved_by' => $approvedBy,
        ]);

        // Send WhatsApp notification if status changed to approved or rejected
        if ($previousStatus !== $newStatus && in_array($newStatus, ['approved', 'rejected'], true)) {
            $leave->loadMissing('employee');
            app(\App\Services\WhatsAppNotificationService::class)->notifyLeaveStatus($leave);
        }

        // Handle balance changes for annual leave
        if ($leave->leave_type === 'annual') {
            $balanceService = app(LeaveBalanceService::class);

            // Restore balance when going from approved -> rejected/cancelled
            if ($previousStatus === 'approved' && in_array($newStatus, ['rejected', 'cancelled'])) {
                $balanceService->restoreBalance($leave);
            }

            // Deduct balance when newly approved (was not approved before)
            if ($newStatus === 'approved' && $previousStatus !== 'approved') {
                if (! $balanceService->deductBalance($leave)) {
                    $remaining = $this->getRemainingBalance($leave);
                    // Revert to previous status
                    $leave->update(['status' => $previousStatus, 'approved_at' => null, 'approved_by' => null]);

                    return back()->withErrors(['balance' => "Saldo cuti tidak mencukupi. Sisa saldo: {$remaining} hari."]);
                }
            }
        }

        return back();
    }

    /**
     * Delete leave request.
     */
    public function destroy(LeaveRequest $leave): RedirectResponse
    {
        $leave->delete();

        return back();
    }

    /**
     * Export leave requests to XLS-compatible file.
     */
    public function export(Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'date' => ['nullable', 'date'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'date' => Carbon::parse($validated['date'] ?? today())->toDateString(),
        ];

        $rows = LeaveRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->whereDate('start_date', '<=', $filters['date'])
            ->whereDate('end_date', '>=', $filters['date'])
            ->orderByDesc('start_date')
            ->get();

        $fileName = 'leaves_'.now()->format('Ymd_His').'.xls';

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'wb');

            fputcsv($out, [
                'Kode Pegawai',
                'Nama Pegawai',
                'Jenis Cuti',
                'Tanggal Mulai',
                'Tanggal Selesai',
                'Total Hari',
                'Status',
                'Alasan',
            ], "\t");

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->employee?->employee_code,
                    $row->employee?->full_name,
                    $row->leave_type,
                    $row->start_date?->format('Y-m-d'),
                    $row->end_date?->format('Y-m-d'),
                    $row->total_days,
                    $row->status,
                    $row->reason,
                ], "\t");
            }

            fclose($out);
        }, $fileName, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    /**
     * Get remaining balance for an employee on a leave request.
     */
    private function getRemainingBalance(LeaveRequest $leave): float
    {
        $balance = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $leave->employee_id)
            ->where('leave_type', $leave->leave_type)
            ->where('year', $leave->start_date->year)
            ->first();

        return $balance ? $balance->remainingBalance() : 0;
    }

    /**
     * Calculate total leave days inclusively.
     */
    private function calculateTotalDays(string $startDate, string $endDate): float
    {
        return (float) Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
    }

    /**
     * Resolve approval fields based on status.
     *
     * @return array{0: null|string, 1: null|int}
     */
    private function resolveApprovalState(string $status, null|int|string $userId, ?string $currentApprovedAt = null, ?int $currentApprovedBy = null): array
    {
        if ($status === 'approved') {
            return [$currentApprovedAt ?? now()->toDateTimeString(), $currentApprovedBy ?? (int) $userId];
        }

        return [null, null];
    }
}
