<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeLeaveBalance;
use App\Models\EmployeeLeaveBalanceTransaction;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\CarbonInterface;
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
     * @return array{balance_year: int, period_start: string, period_end: string, total_quota: float, accrued_days: float}
     */
    public function calculateEntitlement(Employee $employee, LeavePolicy $policy, CarbonInterface $asOf): array
    {
        $asOf = $asOf->copy()->startOfDay();
        $hireDate = $employee->hire_date ? $employee->hire_date->copy()->startOfDay() : ($employee->created_at ? $employee->created_at->copy()->startOfDay() : now()->startOfDay());
        $yearlyDays = (float) $policy->yearly_days;

        if (in_array($policy->policy_type, ['anniversary', 'monthly_accrual'], true)) {
            $periodStart = $hireDate->copy()->year($asOf->year);

            if ($periodStart->isAfter($asOf)) {
                $periodStart = $periodStart->subYear();
            }

            if ($asOf->isBefore($hireDate)) {
                $periodStart = $hireDate->copy();
            }

            $periodEnd = $periodStart->copy()->addYear()->subDay();
        } else {
            $periodStart = $asOf->copy()->startOfYear();
            $periodEnd = $asOf->copy()->endOfYear()->startOfDay();
        }

        $eligibleFrom = $hireDate->copy()->addMonthsNoOverflow((int) $policy->waiting_period_months);
        $isEligible = ! $asOf->isBefore($eligibleFrom);
        $totalQuota = $yearlyDays;
        $accruedDays = $isEligible ? $yearlyDays : 0.0;

        if ($policy->policy_type === 'prorated') {
            if ($hireDate->year > $periodStart->year) {
                $totalQuota = 0.0;
            } elseif ($hireDate->year === $periodStart->year) {
                $workingMonths = 13 - $hireDate->month;
                $totalQuota = round(($yearlyDays / 12) * $workingMonths, 2);
            }

            $accruedDays = $isEligible ? $totalQuota : 0.0;
        }

        if ($policy->policy_type === 'monthly_accrual') {
            $accrualStart = $hireDate->isAfter($periodStart) ? $hireDate->copy() : $periodStart->copy();
            $completedMonths = 0;

            if (! $asOf->isBefore($accrualStart)) {
                $accrualUntil = $asOf->greaterThanOrEqualTo($periodEnd)
                    ? $periodEnd->copy()->addDay()
                    : $asOf;
                $completedMonths = min(12, (int) floor($accrualStart->diffInMonths($accrualUntil)));
            }

            $accruedDays = $isEligible
                ? round(min($yearlyDays, ($yearlyDays / 12) * $completedMonths), 2)
                : 0.0;
        }

        return [
            'balance_year' => $periodStart->year,
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodEnd->toDateString(),
            'total_quota' => $totalQuota,
            'accrued_days' => $accruedDays,
        ];
    }

    public function requestEligibilityError(Employee $employee, LeavePolicy $policy, CarbonInterface $startDate, float $totalDays): ?string
    {
        $hireDate = $employee->hire_date ? $employee->hire_date->copy()->startOfDay() : ($employee->created_at ? $employee->created_at->copy()->startOfDay() : now()->startOfDay());
        $eligibleFrom = $hireDate->copy()->addMonthsNoOverflow((int) $policy->waiting_period_months);

        if ($startDate->isBefore($eligibleFrom)) {
            return 'Cuti tahunan baru dapat diambil mulai '.$eligibleFrom->translatedFormat('d F Y').'.';
        }

        if ($policy->max_days_per_request && $totalDays > $policy->max_days_per_request) {
            return "Maksimal pengajuan cuti tahunan adalah {$policy->max_days_per_request} hari sekaligus.";
        }

        return null;
    }

    /**
     * Dapatkan atau buat balance record untuk employee pada periode terkait.
     */
    public function getOrCreateBalance(Employee $employee, string $leaveType, int $year, ?CarbonInterface $asOf = null): EmployeeLeaveBalance
    {
        $owner = User::findOrFail($employee->user_id);
        $policy = $this->getPolicy($owner, $leaveType) ?? new LeavePolicy([
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 0,
        ]);
        $referenceDate = $asOf ?? ($year === (int) now()->year
            ? now()
            : Carbon::create($year, 12, 31));
        $calculation = $this->calculateEntitlement($employee, $policy, $referenceDate);

        $existing = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $employee->id)
            ->where('leave_type', $leaveType)
            ->where(function ($q) use ($calculation, $year) {
                $q->where('year', $calculation['balance_year'])
                  ->orWhere('year', $year);
            })
            ->first();

        if ($existing) {
            return $existing;
        }

        $balanceYear = $calculation['balance_year'];

        return DB::transaction(function () use ($employee, $leaveType, $policy, $calculation, $balanceYear) {
            $balance = EmployeeLeaveBalance::withoutGlobalScopes()->create([
                'user_id' => $employee->user_id,
                'employee_id' => $employee->id,
                'leave_type' => $leaveType,
                'year' => $balanceYear,
                'period_start' => $calculation['period_start'],
                'period_end' => $calculation['period_end'],
                'policy_type' => $policy->policy_type,
                'total_quota' => $calculation['total_quota'],
                'accrued_days' => $calculation['accrued_days'],
                'used_days' => 0,
                'adjusted_days' => 0,
            ]);

            if ($calculation['accrued_days'] > 0) {
                EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                    'user_id' => $employee->user_id,
                    'employee_id' => $employee->id,
                    'leave_type' => $leaveType,
                    'year' => $balanceYear,
                    'amount' => $calculation['accrued_days'],
                    'type' => $policy->isAccrual() ? 'accrual' : 'grant',
                    'description' => 'Jatah awal cuti periode '.$calculation['period_start'].' s/d '.$calculation['period_end'],
                    'leave_request_id' => null,
                    'balance_after' => $calculation['accrued_days'],
                    'effective_date' => $calculation['period_start'],
                ]);
            }

            return $balance;
        });
    }

    /**
     * Inisialisasi balance untuk SEMUA karyawan aktif milik $owner di tahun $year.
     */
    public function initializeBalancesForAll(User $owner, string $leaveType, int $year, ?array $employeeIds = null, bool $forceAll = false): int
    {
        $policy = $this->getPolicy($owner, $leaveType) ?? new LeavePolicy([
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 0,
        ]);
        $referenceDate = Carbon::create($year, 12, 31);
        $asOfForAccrual = $year === (int) now()->year ? now() : $referenceDate;

        $employees = Employee::withoutGlobalScopes()
            ->where('user_id', $owner->id)
            ->where('is_active', true)
            ->where('employment_status', '!=', 'resigned')
            ->when($employeeIds !== null, fn ($query) => $query->whereIn('id', $employeeIds))
            ->get();

        $count = 0;
        foreach ($employees as $employee) {
            $calculation = $this->calculateEntitlement($employee, $policy, $referenceDate);
            if ($policy->policy_type === 'monthly_accrual' && $year === (int) now()->year) {
                $accrualCalc = $this->calculateEntitlement($employee, $policy, $asOfForAccrual);
                $calculation['accrued_days'] = $accrualCalc['accrued_days'];
            }

            $targetYear = $year;

            $existing = EmployeeLeaveBalance::withoutGlobalScopes()
                ->where('employee_id', $employee->id)
                ->where('leave_type', $leaveType)
                ->where(function ($q) use ($targetYear, $calculation) {
                    $q->where('year', $targetYear)
                      ->orWhere('year', $calculation['balance_year']);
                })
                ->first();

            if (! $existing) {
                DB::transaction(function () use ($employee, $leaveType, $policy, $calculation, $targetYear) {
                    $balance = EmployeeLeaveBalance::withoutGlobalScopes()->create([
                        'user_id' => $employee->user_id,
                        'employee_id' => $employee->id,
                        'leave_type' => $leaveType,
                        'year' => $targetYear,
                        'period_start' => $calculation['period_start'],
                        'period_end' => $calculation['period_end'],
                        'policy_type' => $policy->policy_type,
                        'total_quota' => $calculation['total_quota'],
                        'accrued_days' => $calculation['accrued_days'],
                        'used_days' => 0,
                        'adjusted_days' => 0,
                    ]);

                    if ($calculation['accrued_days'] > 0) {
                        EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                            'user_id' => $employee->user_id,
                            'employee_id' => $employee->id,
                            'leave_type' => $leaveType,
                            'year' => $targetYear,
                            'amount' => $calculation['accrued_days'],
                            'type' => $policy->isAccrual() ? 'accrual' : 'grant',
                            'description' => 'Jatah awal cuti periode '.$calculation['period_start'].' s/d '.$calculation['period_end'],
                            'leave_request_id' => null,
                            'balance_after' => $calculation['accrued_days'],
                            'effective_date' => $calculation['period_start'],
                        ]);
                    }
                });
                $count++;
            } elseif ($forceAll) {
                DB::transaction(function () use ($existing, $policy, $calculation, $targetYear) {
                    $oldAccrued = (float) $existing->accrued_days;
                    $newAccrued = (float) $calculation['accrued_days'];
                    $diff = round($newAccrued - $oldAccrued, 2);

                    $existing->update([
                        'year' => $targetYear,
                        'policy_type' => $policy->policy_type,
                        'total_quota' => $calculation['total_quota'],
                        'accrued_days' => $newAccrued,
                        'period_start' => $calculation['period_start'],
                        'period_end' => $calculation['period_end'],
                    ]);
                    $existing->refresh();

                    if ($diff != 0) {
                        EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                            'user_id' => $existing->user_id,
                            'employee_id' => $existing->employee_id,
                            'leave_type' => $existing->leave_type,
                            'year' => $targetYear,
                            'amount' => $diff,
                            'type' => 'adjustment',
                            'description' => "Penyesuaian kebijakan cuti ({$policy->policy_type}): kuota {$calculation['total_quota']} hari",
                            'leave_request_id' => null,
                            'balance_after' => $existing->remainingBalance(),
                            'effective_date' => now()->toDateString(),
                        ]);
                    }
                });
                $count++;
            }
        }

        return $count;
    }

    /**
     * Terapkan kebijakan cuti ke semua karyawan aktif milik $owner untuk tahun $year.
     */
    public function applyPolicyToAll(User $owner, LeavePolicy $policy, int $year, ?array $employeeIds = null): int
    {
        return $this->initializeBalancesForAll(
            $owner,
            $policy->leave_type,
            $year,
            $employeeIds,
            true
        );
    }

    /**
     * Jalankan akrual bulanan untuk semua karyawan aktif milik $owner dengan policy accrual.
     */
    public function accrueMonthly(User $owner, string $leaveType, ?array $employeeIds = null): int
    {
        $policy = $this->getPolicy($owner, $leaveType);

        if (! $policy || ! $policy->isAccrual()) {
            return 0;
        }

        $employees = Employee::withoutGlobalScopes()
            ->where('user_id', $owner->id)
            ->where('is_active', true)
            ->where('employment_status', '!=', 'resigned')
            ->when($employeeIds !== null, fn ($query) => $query->whereIn('id', $employeeIds))
            ->get();

        $count = 0;

        DB::transaction(function () use ($employees, $policy, $leaveType, &$count) {
            foreach ($employees as $employee) {
                $calculation = $this->calculateEntitlement($employee, $policy, now());
                $balance = EmployeeLeaveBalance::withoutGlobalScopes()
                    ->where('employee_id', $employee->id)
                    ->where('leave_type', $leaveType)
                    ->where('year', $calculation['balance_year'])
                    ->first();

                if (! $balance) {
                    $this->getOrCreateBalance($employee, $leaveType, $calculation['balance_year'], now());
                    $count++;

                    continue;
                }

                $added = $calculation['accrued_days'] - $balance->accrued_days;

                if ($added <= 0) {
                    continue;
                }

                $balance->increment('accrued_days', $added);
                $balance->update([
                    'total_quota' => $calculation['total_quota'],
                    'period_start' => $calculation['period_start'],
                    'period_end' => $calculation['period_end'],
                    'policy_type' => $policy->policy_type,
                ]);
                $balance->refresh();

                $balanceAfter = $balance->remainingBalance();

                EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                    'user_id' => $balance->user_id,
                    'employee_id' => $balance->employee_id,
                    'leave_type' => $leaveType,
                    'year' => $calculation['balance_year'],
                    'amount' => $added,
                    'type' => 'accrual',
                    'description' => 'Akrual cuti bulanan '.now()->format('F Y'),
                    'leave_request_id' => null,
                    'balance_after' => $balanceAfter,
                    'effective_date' => now()->toDateString(),
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
        $employee = Employee::withoutGlobalScopes()->find($leave->employee_id);
        if (! $employee) {
            return false;
        }
        $balance = $this->getOrCreateBalance(
            $employee,
            $leave->leave_type,
            $leave->start_date->year,
            $leave->start_date
        );
        $balanceYear = $balance->year;

        if (! $balance->canTake((float) $leave->total_days)) {
            return false;
        }

        DB::transaction(function () use ($balance, $leave, $balanceYear) {
            $balance->increment('used_days', (float) $leave->total_days);
            $balance->refresh();

            EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                'user_id' => $balance->user_id,
                'employee_id' => $leave->employee_id,
                'leave_type' => $leave->leave_type,
                'year' => $balanceYear,
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
        $employee = Employee::withoutGlobalScopes()->find($leave->employee_id);
        if (! $employee) {
            return;
        }
        $owner = User::findOrFail($employee->user_id);
        $policy = $this->getPolicy($owner, $leave->leave_type) ?? new LeavePolicy([
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 0,
        ]);
        $calculation = $this->calculateEntitlement($employee, $policy, $leave->start_date);
        $balanceYear = $calculation['balance_year'];

        $balance = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $leave->employee_id)
            ->where('leave_type', $leave->leave_type)
            ->where('year', $balanceYear)
            ->first();

        if (! $balance) {
            return;
        }

        DB::transaction(function () use ($balance, $leave, $balanceYear) {
            $balance->decrement('used_days', (float) $leave->total_days);
            $balance->refresh();

            EmployeeLeaveBalanceTransaction::withoutGlobalScopes()->create([
                'user_id' => $balance->user_id,
                'employee_id' => $leave->employee_id,
                'leave_type' => $leave->leave_type,
                'year' => $balanceYear,
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
            ->where('leave_type', $leaveType)
            ->where(function ($q) use ($year) {
                $q->where('year', $year)
                  ->orWhere(function ($sub) use ($year) {
                      $sub->whereYear('period_start', '<=', $year)
                          ->whereYear('period_end', '>=', $year);
                  });
            })
            ->orderByRaw('CASE WHEN year = ? THEN 0 ELSE 1 END', [$year])
            ->get()
            ->unique('employee_id');
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
