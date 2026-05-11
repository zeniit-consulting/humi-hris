<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeLeaveBalance;
use App\Models\EmployeeLeaveBalanceTransaction;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LeaveBalanceService
{
    /**
     * Dapatkan policy aktif untuk leave_type milik owner.
     */
    public function getPolicy(User $owner, string $leaveType): ?LeavePolicy
    {
        return LeavePolicy::withoutGlobalScopes()
            ->where('user_id', $owner->id)
            ->where('leave_type', $leaveType)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Dapatkan atau buat balance record untuk employee di tahun tertentu.
     */
    public function getOrCreateBalance(Employee $employee, string $leaveType, int $year): EmployeeLeaveBalance
    {
        $existing = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $employee->id)
            ->where('leave_type', $leaveType)
            ->where('year', $year)
            ->first();

        if ($existing) {
            return $existing;
        }

        $owner = User::find($employee->user_id);
        $policy = $this->getPolicy($owner, $leaveType);

        return DB::transaction(function () use ($employee, $leaveType, $year, $policy) {
            $policyType = $policy?->policy_type ?? 'lump_sum';
            $yearlyDays = $policy?->yearly_days ?? 12;

            $isLumpSum = $policyType === 'lump_sum';

            $balance = EmployeeLeaveBalance::withoutGlobalScopes()->create([
                'user_id' => $employee->user_id,
                'employee_id' => $employee->id,
                'leave_type' => $leaveType,
                'year' => $year,
                'policy_type' => $policyType,
                'total_quota' => $yearlyDays,
                'accrued_days' => $isLumpSum ? $yearlyDays : 0,
                'used_days' => 0,
                'adjusted_days' => 0,
            ]);

            if ($isLumpSum) {
                EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                    'user_id' => $employee->user_id,
                    'employee_id' => $employee->id,
                    'leave_type' => $leaveType,
                    'year' => $year,
                    'amount' => $yearlyDays,
                    'type' => 'grant',
                    'description' => "Jatah cuti {$year} diberikan sekaligus (lump sum)",
                    'leave_request_id' => null,
                    'balance_after' => $yearlyDays,
                    'effective_date' => Carbon::create($year, 1, 1)->toDateString(),
                ]);
            }

            return $balance;
        });
    }

    /**
     * Inisialisasi balance untuk SEMUA karyawan aktif milik $owner di tahun $year.
     */
    public function initializeBalancesForAll(User $owner, string $leaveType, int $year): int
    {
        $policy = $this->getPolicy($owner, $leaveType);
        $policyType = $policy?->policy_type ?? 'lump_sum';
        $yearlyDays = $policy?->yearly_days ?? 12;
        $isLumpSum = $policyType === 'lump_sum';

        $employees = Employee::withoutGlobalScopes()
            ->where('user_id', $owner->id)
            ->where('is_active', true)
            ->get();

        $existingEmployeeIds = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('user_id', $owner->id)
            ->where('leave_type', $leaveType)
            ->where('year', $year)
            ->pluck('employee_id')
            ->toArray();

        $toInit = $employees->filter(fn ($e) => ! in_array($e->id, $existingEmployeeIds));

        $count = 0;

        DB::transaction(function () use ($toInit, $owner, $leaveType, $year, $policyType, $yearlyDays, $isLumpSum, &$count) {
            foreach ($toInit as $employee) {
                EmployeeLeaveBalance::withoutGlobalScopes()->create([
                    'user_id' => $owner->id,
                    'employee_id' => $employee->id,
                    'leave_type' => $leaveType,
                    'year' => $year,
                    'policy_type' => $policyType,
                    'total_quota' => $yearlyDays,
                    'accrued_days' => $isLumpSum ? $yearlyDays : 0,
                    'used_days' => 0,
                    'adjusted_days' => 0,
                ]);

                if ($isLumpSum) {
                    EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                        'user_id' => $owner->id,
                        'employee_id' => $employee->id,
                        'leave_type' => $leaveType,
                        'year' => $year,
                        'amount' => $yearlyDays,
                        'type' => 'grant',
                        'description' => "Jatah cuti {$year} diberikan sekaligus (lump sum)",
                        'leave_request_id' => null,
                        'balance_after' => $yearlyDays,
                        'effective_date' => Carbon::create($year, 1, 1)->toDateString(),
                    ]);
                }

                $count++;
            }
        });

        return $count;
    }

    /**
     * Jalankan akrual bulanan untuk semua karyawan aktif milik $owner dengan policy accrual.
     */
    public function accrueMonthly(User $owner, string $leaveType): int
    {
        $policy = $this->getPolicy($owner, $leaveType);

        if (! $policy || ! $policy->isAccrual()) {
            return 0;
        }

        $year = now()->year;
        $yearlyDays = $policy->yearly_days;

        $balances = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('user_id', $owner->id)
            ->where('leave_type', $leaveType)
            ->where('year', $year)
            ->where('policy_type', 'accrual')
            ->whereColumn('accrued_days', '<', 'total_quota')
            ->get();

        $count = 0;

        DB::transaction(function () use ($balances, $leaveType, $year, &$count) {
            foreach ($balances as $balance) {
                $newAccrued = min($balance->accrued_days + 1, (float) $balance->total_quota);
                $added = $newAccrued - $balance->accrued_days;

                if ($added <= 0) {
                    continue;
                }

                $balance->increment('accrued_days', $added);
                $balance->refresh();

                $balanceAfter = $balance->remainingBalance();

                EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                    'user_id' => $balance->user_id,
                    'employee_id' => $balance->employee_id,
                    'leave_type' => $leaveType,
                    'year' => $year,
                    'amount' => $added,
                    'type' => 'accrual',
                    'description' => 'Akrual cuti bulanan '.now()->format('F Y'),
                    'leave_request_id' => null,
                    'balance_after' => $balanceAfter,
                    'effective_date' => now()->startOfMonth()->toDateString(),
                ]);

                $count++;
            }
        });

        return $count;
    }

    /**
     * Potong saldo saat cuti annual disetujui.
     */
    public function deductBalance(LeaveRequest $leave): bool
    {
        $year = $leave->start_date->year;

        $balance = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $leave->employee_id)
            ->where('leave_type', $leave->leave_type)
            ->where('year', $year)
            ->first();

        if (! $balance) {
            // coba buat balance otomatis
            $employee = Employee::withoutGlobalScopes()->find($leave->employee_id);
            if (! $employee) {
                return false;
            }
            $balance = $this->getOrCreateBalance($employee, $leave->leave_type, $year);
        }

        if (! $balance->canTake((float) $leave->total_days)) {
            return false;
        }

        DB::transaction(function () use ($balance, $leave, $year) {
            $balance->increment('used_days', (float) $leave->total_days);
            $balance->refresh();

            EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                'user_id' => $balance->user_id,
                'employee_id' => $leave->employee_id,
                'leave_type' => $leave->leave_type,
                'year' => $year,
                'amount' => -(float) $leave->total_days,
                'type' => 'usage',
                'description' => "Pemakaian cuti: {$leave->start_date->format('d/m/Y')} s/d {$leave->end_date->format('d/m/Y')}",
                'leave_request_id' => $leave->id,
                'balance_after' => $balance->remainingBalance(),
                'effective_date' => $leave->start_date->toDateString(),
            ]);
        });

        return true;
    }

    /**
     * Kembalikan saldo saat cuti annual yang sudah approved dibatalkan/ditolak.
     */
    public function restoreBalance(LeaveRequest $leave): void
    {
        $year = $leave->start_date->year;

        $balance = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $leave->employee_id)
            ->where('leave_type', $leave->leave_type)
            ->where('year', $year)
            ->first();

        if (! $balance) {
            return;
        }

        DB::transaction(function () use ($balance, $leave, $year) {
            $balance->decrement('used_days', (float) $leave->total_days);
            $balance->refresh();

            EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                'user_id' => $balance->user_id,
                'employee_id' => $leave->employee_id,
                'leave_type' => $leave->leave_type,
                'year' => $year,
                'amount' => (float) $leave->total_days,
                'type' => 'reversal',
                'description' => "Pembalikan cuti: {$leave->start_date->format('d/m/Y')} s/d {$leave->end_date->format('d/m/Y')}",
                'leave_request_id' => $leave->id,
                'balance_after' => $balance->remainingBalance(),
                'effective_date' => now()->toDateString(),
            ]);
        });
    }

    /**
     * Manual adjustment saldo oleh HR.
     */
    public function adjustBalance(Employee $employee, string $leaveType, int $year, float $amount, string $description): void
    {
        $balance = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $employee->id)
            ->where('leave_type', $leaveType)
            ->where('year', $year)
            ->first();

        if (! $balance) {
            $balance = $this->getOrCreateBalance($employee, $leaveType, $year);
        }

        DB::transaction(function () use ($balance, $employee, $leaveType, $year, $amount, $description) {
            $balance->increment('adjusted_days', $amount);
            $balance->refresh();

            EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                'user_id' => $balance->user_id,
                'employee_id' => $employee->id,
                'leave_type' => $leaveType,
                'year' => $year,
                'amount' => $amount,
                'type' => 'adjustment',
                'description' => $description,
                'leave_request_id' => null,
                'balance_after' => $balance->remainingBalance(),
                'effective_date' => now()->toDateString(),
            ]);
        });
    }

    /**
     * Dapatkan summary balance per karyawan untuk owner di tahun tertentu.
     */
    public function getBalanceSummary(User $owner, int $year, string $leaveType): Collection
    {
        return EmployeeLeaveBalance::withoutGlobalScopes()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $owner->id)
            ->where('year', $year)
            ->where('leave_type', $leaveType)
            ->get();
    }

    /**
     * Dapatkan ledger (riwayat transaksi) untuk 1 employee.
     */
    public function getLedger(Employee $employee, int $year, string $leaveType): Collection
    {
        return EmployeeLeaveBalanceTransaction::withoutGlobalScopes()
            ->with('leaveRequest:id,start_date,end_date,status')
            ->where('employee_id', $employee->id)
            ->where('leave_type', $leaveType)
            ->where('year', $year)
            ->orderBy('effective_date')
            ->orderBy('id')
            ->get();
    }
}
