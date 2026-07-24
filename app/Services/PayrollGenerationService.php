<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Models\PayrollRun;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PayrollGenerationService
{
    public function generateForPeriod(
        int $ownerId,
        string $period,
        ?int $generatedBy = null,
        bool $markAsDraft = true,
        bool $includeSubCompanyEmployees = true,
        array $excludedEmployeeIds = [],
    ): PayrollRun {
        $start = Carbon::createFromFormat('Y-m-d', $period.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        return DB::transaction(function () use ($ownerId, $period, $start, $end, $generatedBy, $markAsDraft, $includeSubCompanyEmployees, $excludedEmployeeIds): PayrollRun {
            $run = PayrollRun::query()->updateOrCreate(
                [
                    'user_id' => $ownerId,
                    'period' => $period,
                    'type' => 'regular',
                ],
                [
                    'period_start' => $start->toDateString(),
                    'period_end' => $end->toDateString(),
                    'generated_at' => now(),
                    'generated_by' => $generatedBy,
                    ...($markAsDraft ? [
                        'is_saved' => false,
                        'saved_at' => null,
                        'saved_by' => null,
                    ] : []),
                ]
            );

            return $this->recalculateRun($run, $generatedBy, $markAsDraft, $includeSubCompanyEmployees, $excludedEmployeeIds);
        });
    }

    public function recalculateRun(
        PayrollRun $run,
        ?int $generatedBy = null,
        bool $markAsDraft = false,
        bool $includeSubCompanyEmployees = true,
        array $excludedEmployeeIds = [],
    ): PayrollRun {
        $period = $run->period;
        $start = Carbon::createFromFormat('Y-m-d', $period.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $ownerId = (int) $run->user_id;

        return DB::transaction(function () use ($run, $ownerId, $start, $end, $generatedBy, $markAsDraft, $includeSubCompanyEmployees, $excludedEmployeeIds): PayrollRun {
            $items = $this->payrollItems($ownerId, $run, $start, $end, $includeSubCompanyEmployees, $excludedEmployeeIds);

            $run->items()->delete();

            if ($items->isNotEmpty()) {
                $run->items()->createMany($items->toArray());
            }

            $run->update([
                'period_start' => $start->toDateString(),
                'period_end' => $end->toDateString(),
                'employees_count' => $items->count(),
                'total_base_salary' => round((float) $items->sum('base_salary'), 2),
                'total_allowances' => round((float) $items->sum('allowances_total'), 2),
                'total_deductions' => round((float) $items->sum('deductions_total'), 2),
                'total_net_salary' => round((float) $items->sum('net_salary'), 2),
                'generated_at' => now(),
                'generated_by' => $generatedBy ?? $run->generated_by,
                ...($markAsDraft ? [
                    'is_saved' => false,
                    'saved_at' => null,
                    'saved_by' => null,
                ] : []),
            ]);

            return $run->refresh();
        });
    }

    public function generateThr(int $ownerId, string $referenceDate): PayrollRun
    {
        $ref = Carbon::parse($referenceDate);
        $period = $ref->format('Y-m');

        return DB::transaction(function () use ($ownerId, $ref, $period): PayrollRun {
            $run = PayrollRun::query()->updateOrCreate(
                ['user_id' => $ownerId, 'period' => $period, 'type' => 'thr'],
                [
                    'period_start' => $ref->copy()->startOfMonth()->toDateString(),
                    'period_end' => $ref->copy()->endOfMonth()->toDateString(),
                    'thr_reference_date' => $ref->toDateString(),
                    'generated_at' => now(),
                    'is_saved' => false,
                    'saved_at' => null,
                    'saved_by' => null,
                ]
            );

            $items = $this->thrItems($ownerId, $run, $ref);
            $run->items()->delete();
            if ($items->isNotEmpty()) {
                $run->items()->createMany($items->toArray());
            }

            $run->update([
                'employees_count' => $items->count(),
                'total_base_salary' => round((float) $items->sum('base_salary'), 2),
                'total_allowances' => 0,
                'total_deductions' => 0,
                'total_net_salary' => round((float) $items->sum('net_salary'), 2),
            ]);

            return $run->refresh();
        });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function payrollItems(int $ownerId, PayrollRun $run, Carbon $start, Carbon $end, bool $includeSubCompanyEmployees = true, array $excludedEmployeeIds = []): Collection
    {
        $setting = CompanySetting::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->first();

        return $this->employees($ownerId, $start, $end, $includeSubCompanyEmployees, $excludedEmployeeIds)
            ->map(fn (Employee $employee): array => $this->payrollItem($ownerId, $run, $employee, $start, $end, $setting))
            ->values();
    }

    /**
     * @return Collection<int, Employee>
     */
    private function employees(int $ownerId, Carbon $start, Carbon $end, bool $includeSubCompanyEmployees = true, array $excludedEmployeeIds = []): Collection
    {
        return Employee::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->whereDate('hire_date', '<=', $end->toDateString())
            ->where(function ($query) use ($start): void {
                $query
                    ->where(function ($active): void {
                        $active->where('is_active', true)
                            ->whereIn('employment_status', ['active', 'probation', 'on_leave']);
                    })
                    ->orWhere(function ($resigned) use ($start): void {
                        $resigned->where('employment_status', 'resigned')
                            ->whereNotNull('offboarded_at')
                            ->whereDate('offboarded_at', '>=', $start->toDateString());
                    });
            })
            ->when(! $includeSubCompanyEmployees, fn ($query) => $query->whereNull('sub_company_id'))
            ->when($excludedEmployeeIds !== [], fn ($query) => $query->whereNotIn('id', $excludedEmployeeIds))
            ->with([
                'allowances' => function ($query) use ($ownerId, $start, $end): void {
                    $query
                        ->withoutGlobalScopes()
                        ->where('user_id', $ownerId)
                        ->where('is_active', true)
                        ->where(function ($builder) use ($end): void {
                            $builder->whereNull('effective_start_date')
                                ->orWhere('effective_start_date', '<=', $end->toDateString());
                        })
                        ->where(function ($builder) use ($start): void {
                            $builder->whereNull('effective_end_date')
                                ->orWhere('effective_end_date', '>=', $start->toDateString());
                        });
                },
                'overtimeRequests' => function ($query) use ($ownerId, $start, $end): void {
                    $query->withoutGlobalScopes()
                        ->where('user_id', $ownerId)
                        ->where('status', 'approved')
                        ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()]);
                },
                'schedules' => function ($query) use ($ownerId, $start, $end): void {
                    $query->withoutGlobalScopes()
                        ->where('user_id', $ownerId)
                        ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()]);
                },
                'attendances' => function ($query) use ($ownerId, $start, $end): void {
                    $query->withoutGlobalScopes()
                        ->where('user_id', $ownerId)
                        ->whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()]);
                },
                'leaveRequests' => function ($query) use ($ownerId, $start, $end): void {
                    $query->withoutGlobalScopes()
                        ->where('user_id', $ownerId)
                        ->where('leave_type', 'unpaid')
                        ->where('status', 'approved')
                        ->whereDate('start_date', '<=', $end->toDateString())
                        ->whereDate('end_date', '>=', $start->toDateString());
                },
            ])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    private function payrollItem(
        int $ownerId,
        PayrollRun $run,
        Employee $employee,
        Carbon $start,
        Carbon $end,
        ?CompanySetting $setting,
    ): array {
        $monthlyBaseSalary = (float) ($employee->base_salary ?? 0);
        [$prorationFactor, $workingDays, $payableDays] = $this->prorationDetails($employee, $start, $end);
        $isDailyWorker = $employee->employment_type === 'DW';
        $dailyWage = (float) ($employee->daily_wage ?? 0);
        $paidAttendanceDays = $isDailyWorker
            ? $employee->attendances->whereIn('status', ['present', 'late'])->unique('attendance_date')->count()
            : 0;
        $baseSalary = $isDailyWorker
            ? round($dailyWage * $paidAttendanceDays, 2)
            : round($monthlyBaseSalary * $prorationFactor, 2);

        $allowanceGrouped = $employee->allowances
            ->groupBy('name')
            ->map(fn ($rows) => round((float) $rows->sum('amount') * $prorationFactor, 2))
            ->sortKeys();

        $allowancesTotal = round((float) $allowanceGrouped->sum(), 2);
        $unpaidLeaveDays = $isDailyWorker ? 0 : $this->unpaidLeaveDays($employee, $start, $end);
        $activeWorkingDays = max((int) ($setting?->active_working_days ?? 22), 1);
        $unpaidLeaveDeduction = round(
            (($monthlyBaseSalary + (float) $employee->allowances->sum('amount')) / $activeWorkingDays) * $unpaidLeaveDays,
            2,
        );

        // Overtime calculation
        $actualOvertimeHours = (float) $employee->overtimeRequests->sum('total_hours');
        $overtimeHours = $this->payableOvertimeHours($actualOvertimeHours, $setting);
        $hourlyRate = $monthlyBaseSalary / max((int) ($setting->overtime_hour_divisor ?? 173), 1);
        $overtimePay = 0.0;
        if ($overtimeHours > 0) {
            $multiplierHour1 = (float) ($setting->overtime_multiplier_hour1 ?? 1.5);
            $multiplierSubsequent = (float) ($setting->overtime_multiplier_subsequent ?? 2.0);
            $firstHour = min($overtimeHours, 1.0);
            $remainingHours = max($overtimeHours - 1.0, 0.0);
            $overtimePay = round(
                ($firstHour * $multiplierHour1 + $remainingHours * $multiplierSubsequent) * $hourlyRate,
                2
            );
        }

        $pph21Method = (string) ($employee->pph21_method ?? 'gross');
        $pph21Rate = round((float) ($employee->pph21_rate ?? 0), 2);
        $monthlyTax = round($pph21Rate, 2);

        [$pph21Allowance, $pph21Deduction, $pph21CompanyBorne] = $this->pph21Amounts(
            $pph21Method,
            $monthlyTax,
        );

        $kasbonDeduction = $this->deductionTotal($ownerId, $employee, $start, $end, 'kasbon');
        $dendaDeduction = $this->deductionTotal($ownerId, $employee, $start, $end, 'denda');
        $deductionsTotal = round($kasbonDeduction + $dendaDeduction + $unpaidLeaveDeduction + $pph21Deduction, 2);
        $netSalary = round(max(($baseSalary + $allowancesTotal + $overtimePay + $pph21Allowance) - $deductionsTotal, 0), 2);

        return [
            'user_id' => $ownerId,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => $baseSalary,
            'allowances_total' => $allowancesTotal,
            'is_prorated' => $prorationFactor < 1,
            'proration_working_days' => $workingDays,
            'proration_payable_days' => $payableDays,
            'proration_factor' => round($prorationFactor, 6),
            'overtime_hours' => $overtimeHours,
            'overtime_pay' => $overtimePay,
            'pph21_method' => $pph21Method,
            'pph21_rate' => $pph21Rate,
            'pph21_allowance' => $pph21Allowance,
            'pph21_deduction' => $pph21Deduction,
            'pph21_company_borne' => $pph21CompanyBorne,
            'kasbon_deduction' => $kasbonDeduction,
            'denda_deduction' => $dendaDeduction,
            'unpaid_leave_deduction' => $unpaidLeaveDeduction,
            'deductions_total' => $deductionsTotal,
            'net_salary' => $netSalary,
            'allowance_breakdown' => $allowanceGrouped->toArray(),
            'variable_allowance_breakdown' => [],
            'bonus_breakdown' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * @return array{0: float, 1: int, 2: int}
     */
    private function prorationDetails(Employee $employee, Carbon $start, Carbon $end): array
    {
        $employmentStart = $employee->hire_date && $employee->hire_date->greaterThan($start)
            ? Carbon::parse($employee->hire_date)
            : $start->copy();
        $employmentEnd = $employee->offboarded_at && $employee->offboarded_at->lessThan($end)
            ? Carbon::parse($employee->offboarded_at)
            : $end->copy();

        if ($employmentStart->greaterThan($employmentEnd)) {
            return [0.0, 0, 0];
        }

        $schedules = $employee->schedules->keyBy(
            fn ($schedule): string => $schedule->work_date->toDateString()
        );
        $workingDays = 0;
        $payableDays = 0;

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $schedule = $schedules->get($date->toDateString());
            $isWorkingDay = $schedule ? ! $schedule->is_day_off : $date->isWeekday();

            if (! $isWorkingDay) {
                continue;
            }

            $workingDays++;

            if ($date->betweenIncluded($employmentStart, $employmentEnd)) {
                $payableDays++;
            }
        }

        $factor = $workingDays > 0
            ? min($payableDays / $workingDays, 1.0)
            : 1.0;

        return [$factor, $workingDays, $payableDays];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function thrItems(int $ownerId, PayrollRun $run, Carbon $ref): Collection
    {
        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->whereIn('employment_status', ['active', 'probation', 'on_leave'])
            ->whereNotNull('hire_date')
            ->orderBy('first_name')->orderBy('last_name')
            ->get(['id', 'hire_date', 'base_salary', 'user_id']);

        return $employees->map(function (Employee $employee) use ($ownerId, $run, $ref): array {
            $baseSalary = (float) ($employee->base_salary ?? 0);
            $hireDate = Carbon::parse($employee->hire_date);
            $monthsOfService = (int) $hireDate->diffInMonths($ref);
            $thrAmount = $monthsOfService >= 12
                ? $baseSalary
                : round(($monthsOfService / 12) * $baseSalary, 2);

            return [
                'user_id' => $ownerId,
                'payroll_run_id' => $run->id,
                'employee_id' => $employee->id,
                'base_salary' => $baseSalary,
                'allowances_total' => 0,
                'overtime_hours' => 0,
                'overtime_pay' => 0,
                'pph21_method' => null,
                'pph21_rate' => 0,
                'pph21_allowance' => 0,
                'pph21_deduction' => 0,
                'pph21_company_borne' => 0,
                'kasbon_deduction' => 0,
                'denda_deduction' => 0,
                'deductions_total' => 0,
                'net_salary' => $thrAmount,
                'thr_months_of_service' => min($monthsOfService, 12),
                'thr_amount' => $thrAmount,
                'allowance_breakdown' => [],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->values();
    }

    /**
     * @return array{0: float, 1: float, 2: float}
     */
    private function pph21Amounts(string $method, float $monthlyTax): array
    {
        return match ($method) {
            'gross' => [0, $monthlyTax, 0],
            'net' => [0, 0, $monthlyTax],
            'gross_up' => [$monthlyTax, $monthlyTax, 0],
            'ter_harian' => [0, $monthlyTax, 0],
            default => [0, 0, 0],
        };
    }

    private function deductionTotal(int $ownerId, Employee $employee, Carbon $start, Carbon $end, string $type): float
    {
        return round((float) EmployeeDeduction::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->where('employee_id', $employee->id)
            ->where('type', $type)
            ->whereBetween('deduction_date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount'), 2);
    }

    private function payableOvertimeHours(float $actualHours, ?CompanySetting $setting): float
    {
        if (($setting?->overtime_calculation_mode ?? 'hourly') !== 'threshold_daily') {
            return $actualHours;
        }

        $threshold = max((int) ($setting?->overtime_threshold_hours ?? 8), 1);

        return floor($actualHours / $threshold) * 8;
    }

    private function unpaidLeaveDays(Employee $employee, Carbon $start, Carbon $end): int
    {
        return $employee->leaveRequests->sum(function ($leave) use ($start, $end): int {
            $leaveStart = Carbon::parse($leave->start_date)->max($start);
            $leaveEnd = Carbon::parse($leave->end_date)->min($end);

            return $leaveStart->greaterThan($leaveEnd) ? 0 : $leaveStart->diffInDays($leaveEnd) + 1;
        });
    }
}
