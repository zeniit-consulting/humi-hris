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
    ): PayrollRun {
        $start = Carbon::createFromFormat('Y-m-d', $period.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        return DB::transaction(function () use ($ownerId, $period, $start, $end, $generatedBy, $markAsDraft): PayrollRun {
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

            return $this->recalculateRun($run, $generatedBy, $markAsDraft);
        });
    }

    public function recalculateRun(
        PayrollRun $run,
        ?int $generatedBy = null,
        bool $markAsDraft = false,
    ): PayrollRun {
        $period = $run->period;
        $start = Carbon::createFromFormat('Y-m-d', $period.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $ownerId = (int) $run->user_id;

        return DB::transaction(function () use ($run, $ownerId, $start, $end, $generatedBy, $markAsDraft): PayrollRun {
            $items = $this->payrollItems($ownerId, $run, $start, $end);

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
                    'period_end'   => $ref->copy()->endOfMonth()->toDateString(),
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
    private function payrollItems(int $ownerId, PayrollRun $run, Carbon $start, Carbon $end): Collection
    {
        $setting = CompanySetting::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->first();

        return $this->employees($ownerId, $start, $end)
            ->map(fn (Employee $employee): array => $this->payrollItem($ownerId, $run, $employee, $start, $end, $setting))
            ->values();
    }

    /**
     * @return Collection<int, Employee>
     */
    private function employees(int $ownerId, Carbon $start, Carbon $end): Collection
    {
        return Employee::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->whereIn('employment_status', ['active', 'probation', 'on_leave'])
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
        $baseSalary = (float) ($employee->base_salary ?? 0);

        $allowanceGrouped = $employee->allowances
            ->groupBy('name')
            ->map(fn ($rows) => round((float) $rows->sum('amount'), 2))
            ->sortKeys();

        $allowancesTotal = round((float) $allowanceGrouped->sum(), 2);

        // Overtime calculation
        $overtimeHours = (float) $employee->overtimeRequests->sum('total_hours');
        $hourlyRate = $baseSalary / max((int) ($setting->overtime_hour_divisor ?? 173), 1);
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
        $deductionsTotal = round($kasbonDeduction + $dendaDeduction + $pph21Deduction, 2);
        $netSalary = round(max(($baseSalary + $allowancesTotal + $overtimePay + $pph21Allowance) - $deductionsTotal, 0), 2);

        return [
            'user_id' => $ownerId,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => $baseSalary,
            'allowances_total' => $allowancesTotal,
            'overtime_hours' => $overtimeHours,
            'overtime_pay' => $overtimePay,
            'pph21_method' => $pph21Method,
            'pph21_rate' => $pph21Rate,
            'pph21_allowance' => $pph21Allowance,
            'pph21_deduction' => $pph21Deduction,
            'pph21_company_borne' => $pph21CompanyBorne,
            'kasbon_deduction' => $kasbonDeduction,
            'denda_deduction' => $dendaDeduction,
            'deductions_total' => $deductionsTotal,
            'net_salary' => $netSalary,
            'allowance_breakdown' => $allowanceGrouped->toArray(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
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
                'user_id'               => $ownerId,
                'payroll_run_id'        => $run->id,
                'employee_id'           => $employee->id,
                'base_salary'           => $baseSalary,
                'allowances_total'      => 0,
                'overtime_hours'        => 0,
                'overtime_pay'          => 0,
                'pph21_method'          => null,
                'pph21_rate'            => 0,
                'pph21_allowance'       => 0,
                'pph21_deduction'       => 0,
                'pph21_company_borne'   => 0,
                'kasbon_deduction'      => 0,
                'denda_deduction'       => 0,
                'deductions_total'      => 0,
                'net_salary'            => $thrAmount,
                'thr_months_of_service' => min($monthsOfService, 12),
                'thr_amount'            => $thrAmount,
                'allowance_breakdown'   => [],
                'created_at'            => now(),
                'updated_at'            => now(),
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
}
