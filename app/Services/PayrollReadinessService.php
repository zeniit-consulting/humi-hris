<?php

namespace App\Services;

use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollRun;
use App\Models\ShiftChangeRequest;

class PayrollReadinessService
{
    /**
     * @return array<string, mixed>
     */
    public function summarize(int $ownerId, string $period, ?PayrollRun $run = null): array
    {
        $run?->loadMissing('items.employee.bankAccounts');

        $activeEmployeeIds = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->whereIn('employment_status', ['active', 'probation', 'on_leave'])
            ->pluck('id');

        $payrollEmployeeIds = $run
            ? $run->items->pluck('employee_id')->filter()->unique()->values()
            : collect();

        $missingPayrollCount = $activeEmployeeIds->diff($payrollEmployeeIds)->count();

        $missingBankCount = Employee::query()
            ->where('user_id', $ownerId)
            ->whereIn('id', $activeEmployeeIds)
            ->whereDoesntHave('bankAccounts', fn ($query) => $query->where('is_primary', true))
            ->count();

        $resignedIncludedCount = $run
            ? $run->items->filter(fn ($item) => $item->employee
                && (! $item->employee->is_active || $item->employee->employment_status === 'resigned'))->count()
            : 0;

        $pendingApprovals = $this->pendingApprovalCount($ownerId);

        $checks = [
            [
                'key' => 'active_employees_included',
                'label' => 'Semua karyawan aktif masuk payroll',
                'complete' => $run !== null && $missingPayrollCount === 0,
                'severity' => 'warning',
                'description' => $run === null
                    ? 'Payroll belum digenerate'
                    : ($missingPayrollCount === 0
                        ? 'Semua karyawan aktif sudah masuk payroll'
                        : $missingPayrollCount.' karyawan aktif belum masuk payroll'),
            ],
            [
                'key' => 'bank_accounts',
                'label' => 'Rekening bank utama lengkap',
                'complete' => $missingBankCount === 0,
                'severity' => 'warning',
                'description' => $missingBankCount === 0
                    ? 'Semua karyawan aktif punya rekening utama'
                    : $missingBankCount.' karyawan aktif belum punya rekening utama',
            ],
            [
                'key' => 'pending_approvals',
                'label' => 'Approval payroll bersih',
                'complete' => $pendingApprovals === 0,
                'severity' => 'warning',
                'description' => $pendingApprovals === 0
                    ? 'Tidak ada approval pending'
                    : $pendingApprovals.' approval masih pending',
            ],
            [
                'key' => 'resigned_excluded',
                'label' => 'Karyawan resign tidak ikut payroll',
                'complete' => $resignedIncludedCount === 0,
                'severity' => 'error',
                'description' => $resignedIncludedCount === 0
                    ? 'Tidak ada karyawan resign di payroll'
                    : $resignedIncludedCount.' karyawan resign masih masuk payroll',
            ],
        ];

        $warningCount = collect($checks)
            ->where('complete', false)
            ->where('severity', 'warning')
            ->count();
        $errorCount = collect($checks)
            ->where('complete', false)
            ->where('severity', 'error')
            ->count();

        return [
            'period' => $period,
            'status' => $errorCount > 0 ? 'error' : ($warningCount > 0 ? 'warning' : 'ready'),
            'warning_count' => $warningCount,
            'error_count' => $errorCount,
            'checks' => $checks,
        ];
    }

    private function pendingApprovalCount(int $ownerId): int
    {
        return AttendanceCorrectionRequest::query()
            ->where('user_id', $ownerId)
            ->where('status', 'pending')
            ->count()
            + LeaveRequest::query()
                ->where('user_id', $ownerId)
                ->where('status', 'pending')
                ->count()
            + OvertimeRequest::query()
                ->where('user_id', $ownerId)
                ->where('status', 'pending')
                ->count()
            + ShiftChangeRequest::query()
                ->where('user_id', $ownerId)
                ->where('status', 'pending')
                ->count();
    }
}
