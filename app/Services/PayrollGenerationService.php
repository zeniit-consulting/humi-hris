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
    /**
     * Determine the date range (start, end) for a given payroll period and company setting.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    public function calculatePeriodDates(string $period, ?CompanySetting $setting, ?string $customStart = null, ?string $customEnd = null): array
    {
        if ($customStart && $customEnd) {
            return [
                Carbon::parse($customStart)->startOfDay(),
                Carbon::parse($customEnd)->endOfDay(),
            ];
        }

        $periodDate = Carbon::createFromFormat('Y-m-d', $period.'-01');
        $cutoffDay = $setting?->payroll_cutoff_day ?? 'end_of_month';

        if ($cutoffDay === 'end_of_month' || $cutoffDay === '' || ! is_numeric($cutoffDay)) {
            return [
                $periodDate->copy()->startOfMonth(),
                $periodDate->copy()->endOfMonth(),
            ];
        }

        $day = (int) $cutoffDay;
        $end = $periodDate->copy()->day(min($day, $periodDate->daysInMonth))->endOfDay();

        $prevMonth = $periodDate->copy()->subMonthNoOverflow();
        $startDaySetting = $setting?->payroll_period_start_day;

        if ($startDaySetting !== null && is_numeric($startDaySetting)) {
            $startDay = min((int) $startDaySetting, $prevMonth->daysInMonth);
            $start = $prevMonth->copy()->day($startDay)->startOfDay();
        } else {
            $prevCutoff = $prevMonth->copy()->day(min($day, $prevMonth->daysInMonth));
            $start = $prevCutoff->copy()->addDay()->startOfDay();
        }

        return [$start, $end];
    }

    public function generateForPeriod(
        int $ownerId,
        string $period,
        ?int $generatedBy = null,
        bool $markAsDraft = true,
        bool $includeSubCompanyEmployees = true,
        array $excludedEmployeeIds = [],
        float $serviceFeeTotal = 0,
        ?string $customPeriodStart = null,
        ?string $customPeriodEnd = null,
    ): PayrollRun {
        $setting = CompanySetting::query()->where('user_id', $ownerId)->first();
        [$start, $end] = $this->calculatePeriodDates($period, $setting, $customPeriodStart, $customPeriodEnd);

        return DB::transaction(function () use ($ownerId, $period, $start, $end, $generatedBy, $markAsDraft, $includeSubCompanyEmployees, $excludedEmployeeIds, $serviceFeeTotal): PayrollRun {
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
                    'service_fee_total' => round(max($serviceFeeTotal, 0), 2),
                    ...($markAsDraft ? [
                        'status' => 'draft',
                        'is_saved' => false,
                        'saved_at' => null,
                        'saved_by' => null,
                        'released_at' => null,
                        'released_by' => null,
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
        $ownerId = (int) $run->user_id;
        $setting = CompanySetting::query()->where('user_id', $ownerId)->first();

        if ($run->period_start && $run->period_end) {
            $start = Carbon::parse($run->period_start)->startOfDay();
            $end = Carbon::parse($run->period_end)->endOfDay();
        } else {
            [$start, $end] = $this->calculatePeriodDates($period, $setting);
        }

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
                    'status' => 'draft',
                    'is_saved' => false,
                    'saved_at' => null,
                    'saved_by' => null,
                    'released_at' => null,
                    'released_by' => null,
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
                    'status' => 'draft',
                    'is_saved' => false,
                    'saved_at' => null,
                    'saved_by' => null,
                    'released_at' => null,
                    'released_by' => null,
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

        $employees = $this->employees($ownerId, $start, $end, $includeSubCompanyEmployees, $excludedEmployeeIds);
        $items = $employees
            ->map(fn (Employee $employee): array => $this->payrollItem($ownerId, $run, $employee, $start, $end, $setting))
            ->values();

        return $this->applyServiceFee($items, $employees, (float) ($run->service_fee_total ?? 0));
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
                        ->where(fn ($q) => $q->where('user_id', $ownerId)->orWhereNull('user_id'))
                        ->whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()]);
                },
                'leaveRequests' => function ($query) use ($ownerId, $start, $end): void {
                    $query->withoutGlobalScopes()
                        ->where('user_id', $ownerId)
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
     * @param Collection<int, array<string, mixed>> $items
     * @param Collection<int, Employee> $employees
     * @return Collection<int, array<string, mixed>>
     */
    private function applyServiceFee(Collection $items, Collection $employees, float $serviceFeeTotal): Collection
    {
        $serviceFeeCents = (int) round(max($serviceFeeTotal, 0) * 100);
        $eligibleEmployees = $employees
            ->filter(fn (Employee $employee): bool => (float) $employee->service_fee_points > 0)
            ->values();
        $totalPoints = (float) $eligibleEmployees->sum('service_fee_points');

        if ($serviceFeeCents === 0 || $totalPoints <= 0) {
            return $items;
        }

        $allocatedCents = 0;
        $shares = [];
        foreach ($eligibleEmployees as $index => $employee) {
            $isLast = $index === $eligibleEmployees->count() - 1;
            $share = $isLast
                ? $serviceFeeCents - $allocatedCents
                : (int) floor($serviceFeeCents * ((float) $employee->service_fee_points / $totalPoints));
            $shares[$employee->id] = $share / 100;
            $allocatedCents += $share;
        }

        return $items->map(function (array $item) use ($shares): array {
            $serviceFeeShare = (float) ($shares[$item['employee_id']] ?? 0);
            if ($serviceFeeShare <= 0) {
                return $item;
            }

            $bonusBreakdown = $item['bonus_breakdown'];
            $bonusBreakdown['Service Fee'] = $serviceFeeShare;
            $item['bonus_breakdown'] = $bonusBreakdown;
            $item['allowances_total'] = round((float) $item['allowances_total'] + $serviceFeeShare, 2);
            $item['net_salary'] = round((float) $item['net_salary'] + $serviceFeeShare, 2);

            return $item;
        });
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
            ? $employee->attendances->whereIn('status', ['present', 'late', 'wfa'])->unique('attendance_date')->count()
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
        $eventOvertimePay = (float) $employee->overtimeRequests->where('is_event', true)->sum('event_nominal');
        $actualOvertimeHours = (float) $employee->overtimeRequests->where('is_event', false)->sum('total_hours');
        $overtimeHours = $this->payableOvertimeHours($actualOvertimeHours, $setting);
        $overtimePay = $eventOvertimePay;
        if ($overtimeHours > 0) {
            $isFixedRate = ($setting?->overtime_rate_type ?? 'formula') === 'fixed'
                && (float) ($setting?->overtime_fixed_rate_per_hour ?? 0) > 0;

            if ($isFixedRate) {
                $fixedRate = (float) $setting->overtime_fixed_rate_per_hour;
                $overtimePay += round($overtimeHours * $fixedRate, 2);
            } else {
                $hourlyRate = $monthlyBaseSalary / max((int) ($setting?->overtime_hour_divisor ?? 173), 1);
                $multiplierHour1 = (float) ($setting?->overtime_multiplier_hour1 ?? 1.5);
                $multiplierSubsequent = (float) ($setting?->overtime_multiplier_subsequent ?? 2.0);
                $firstHour = min($overtimeHours, 1.0);
                $remainingHours = max($overtimeHours - 1.0, 0.0);
                $overtimePay += round(
                    ($firstHour * $multiplierHour1 + $remainingHours * $multiplierSubsequent) * $hourlyRate,
                    2
                );
            }
        }

        // BPJS calculation: applies when company has BPJS enabled and employee has bpjs active and configured
        $bpjsWageBase = $monthlyBaseSalary + (float) $employee->allowances->sum('amount');
        $hasBpjsKes = (bool) ($setting?->bpjs_kesehatan_enabled ?? false)
            && (bool) ($employee->bpjs_kesehatan_enabled ?? false)
            && (! empty($employee->bpjs_kesehatan_number) || $employee->bpjs_kesehatan_enabled === true && ($setting?->bpjs_kesehatan_enabled ?? false));
        $hasBpjsTk = (bool) ($setting?->bpjs_ketenagakerjaan_enabled ?? false)
            && (bool) ($employee->bpjs_ketenagakerjaan_enabled ?? false);

        $empBpjsJkk = (bool) ($setting?->bpjs_jkk_enabled ?? true) && (bool) ($employee->bpjs_jkk_enabled ?? true);
        $empBpjsJkm = (bool) ($setting?->bpjs_jkm_enabled ?? true) && (bool) ($employee->bpjs_jkm_enabled ?? true);
        $empBpjsJht = (bool) ($setting?->bpjs_jht_enabled ?? true) && (bool) ($employee->bpjs_jht_enabled ?? true);
        $empBpjsJp = (bool) ($setting?->bpjs_jp_enabled ?? true) && (bool) ($employee->bpjs_jp_enabled ?? false);

        // Private insurance: check employee level or fallback to company setting if enabled for employee
        $hasPrivateInsurance = (bool) ($employee->private_insurance_enabled ?? false)
            || ((bool) ($setting?->private_insurance_enabled ?? false) && (float) ($setting?->private_insurance_nominal ?? 0) > 0 && $employee->private_insurance_enabled !== false);
        $privateInsuranceNominal = (float) ($employee->private_insurance_nominal ?? 0);
        if ($privateInsuranceNominal <= 0 && $hasPrivateInsurance && (float) ($setting?->private_insurance_nominal ?? 0) > 0) {
            $privateInsuranceNominal = (float) ($setting?->private_insurance_nominal ?? 0);
        }
        $privateInsuranceName = $employee->private_insurance_name
            ?: ($setting?->private_insurance_name ?: 'Asuransi Swasta');

        $bpjsKesClass = $employee->bpjs_kesehatan_class
            ?: ($setting?->bpjs_kesehatan_default_class ?: 'I');

        $bpjs = \App\Support\BpjsCalculator::calculate(
            calculationBase: $bpjsWageBase,
            bpjsKesEnabled: (bool) ($setting?->bpjs_kesehatan_enabled ?? false),
            bpjsTkEnabled: (bool) ($setting?->bpjs_ketenagakerjaan_enabled ?? false),
            empBpjsKesEnabled: (bool) ($employee->bpjs_kesehatan_enabled ?? false),
            empBpjsTkEnabled: (bool) ($employee->bpjs_ketenagakerjaan_enabled ?? false),
            empBpjsJpEnabled: $empBpjsJp,
            jkkRate: (float) ($setting?->bpjs_jkk_rate ?? 0.240),
            kesWageCap: (float) ($setting?->bpjs_kesehatan_wage_cap ?? 12_000_000),
            jpWageCap: (float) ($setting?->bpjs_jp_wage_cap ?? 10_042_300),
            empBpjsJkkEnabled: $empBpjsJkk,
            empBpjsJkmEnabled: $empBpjsJkm,
            empBpjsJhtEnabled: $empBpjsJht,
            privateInsuranceEnabled: $hasPrivateInsurance,
            privateInsuranceNominal: $privateInsuranceNominal,
        );

        // PPh 21 Calculation
        $isPph21Active = (bool) ($employee->pph21_enabled ?? ($employee->pph21_method !== 'none'));
        if (! $isPph21Active || $employee->pph21_method === 'none') {
            $pph21Method = 'none';
            $pph21Rate = 0.0;
            $pph21Allowance = 0.0;
            $pph21Deduction = 0.0;
            $pph21CompanyBorne = 0.0;
        } elseif (in_array($employee->pph21_method, ['ter_bulanan', 'ter_bulanan_net', 'ter_bulanan_gross_up'], true)) {
            $pph21Method = (string) $employee->pph21_method;

            // Taxable Gross Income for TER Bulanan:
            // Base salary (prorated if applicable) + Allowances + Overtime + Taxable company benefits (BPJS JKK, JKM, BPJS Kes)
            $taxableBenefits = round(
                (float) ($bpjs['bpjs_jkk_company'] ?? 0)
                + (float) ($bpjs['bpjs_jkm_company'] ?? 0)
                + (float) ($bpjs['bpjs_kesehatan_company'] ?? 0),
                2
            );
            $taxableGross = round($baseSalary + $allowancesTotal + $overtimePay + $taxableBenefits, 2);

            $terCalculator = app(Pph21TerCalculatorService::class);
            $ptkpCategory = (string) ($employee->ptkp_category ?: 'TK/0');
            $terResult = $terCalculator->calculateMonthly($ptkpCategory, $taxableGross, $pph21Method);

            $pph21Rate = (float) $terResult['tax_rate_percent'];
            $pph21Allowance = (float) $terResult['allowance'];
            $pph21Deduction = (float) $terResult['deduction'];
            $pph21CompanyBorne = (float) $terResult['company_borne'];
        } elseif ($employee->pph21_method === 'ter_harian') {
            $pph21Method = 'ter_harian';
            if ($isDailyWorker && $paidAttendanceDays > 0 && $dailyWage > 0) {
                $terCalculator = app(Pph21TerCalculatorService::class);
                $dailyResult = $terCalculator->calculateDaily($dailyWage, $paidAttendanceDays);
                $pph21Rate = (float) $dailyResult['tax_rate_percent'];
                $pph21Allowance = 0.0;
                $pph21Deduction = (float) $dailyResult['tax_amount'];
                $pph21CompanyBorne = 0.0;
            } else {
                $pph21Rate = round((float) ($employee->pph21_rate ?? 0), 2);
                $monthlyTax = round($pph21Rate, 2);
                [$pph21Allowance, $pph21Deduction, $pph21CompanyBorne] = $this->pph21Amounts($pph21Method, $monthlyTax);
            }
        } else {
            $pph21Method = (string) ($employee->pph21_method ?? 'gross');
            $pph21Rate = round((float) ($employee->pph21_rate ?? 0), 2);
            $monthlyTax = round($pph21Rate, 2);

            [$pph21Allowance, $pph21Deduction, $pph21CompanyBorne] = $this->pph21Amounts(
                $pph21Method,
                $monthlyTax,
            );
        }

        $kasbonDeduction = $this->deductionTotal($ownerId, $employee, $start, $end, 'kasbon');

        $manualDendas = EmployeeDeduction::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->where('employee_id', $employee->id)
            ->where('type', 'denda')
            ->whereBetween('deduction_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $manualDendaDeduction = round((float) $manualDendas->sum('amount'), 2);
        $manualBreakdownItems = $manualDendas->map(function ($denda) use ($start): array {
            return [
                'id' => 'manual_'.$denda->id,
                'type' => 'manual_denda',
                'type_label' => 'Denda Manual',
                'reference_id' => $denda->id,
                'date' => $denda->deduction_date?->toDateString() ?? $start->toDateString(),
                'title' => 'Denda Manual',
                'description' => ! empty($denda->notes) ? $denda->notes : 'Potongan denda manual',
                'amount' => round((float) $denda->amount, 2),
                'is_reverted' => false,
            ];
        })->values()->all();

        $attendanceLateDeduction = 0.0;
        $lateBreakdownItems = [];
        foreach ($employee->attendances as $att) {
            $penalty = app(\App\Services\AttendanceStatusService::class)->calculateLatePenaltyForAttendance(
                $att,
                $setting,
                $employee,
                syncAttendanceRecord: true,
            );
            if ($penalty > 0) {
                $attendanceLateDeduction += $penalty;
                $dateStr = $att->attendance_date?->toDateString() ?? '';
                $lateMin = (int) ($att->late_minutes ?? 0);
                $desc = $lateMin > 0 ? "Terlambat {$lateMin} menit" : 'Terlambat presensi';
                $isHalfDay = (bool) ($att->is_half_day ?? false);
                if ($isHalfDay) {
                    $desc .= ' (Setengah hari)';
                }
                $lateBreakdownItems[] = [
                    'id' => 'late_'.$att->id,
                    'type' => 'late_attendance',
                    'type_label' => $isHalfDay ? 'Keterlambatan (Potong Setengah Hari)' : 'Keterlambatan Presensi',
                    'reference_id' => $att->id,
                    'date' => $dateStr,
                    'title' => $isHalfDay ? 'Potongan Setengah Hari (Terlambat)' : 'Denda Keterlambatan',
                    'description' => $desc,
                    'amount' => round($penalty, 2),
                    'is_reverted' => false,
                    'is_half_day' => $isHalfDay,
                ];
            }
        }
        $attendanceLateDeduction = round($attendanceLateDeduction, 2);

        // Jika karyawan tidak absen sampai masa cutoff maka termasuk potongan setengah hari prorate
        $unrecordedCutoffDates = $this->unrecordedAttendanceCutoffDates($employee, $start, $end, $setting);
        $halfDayProrateRate = round(0.5 * (($monthlyBaseSalary + (float) $employee->allowances->where('is_active', true)->sum('amount')) / $activeWorkingDays), 2);
        $unrecordedCutoffDeduction = round(count($unrecordedCutoffDates) * $halfDayProrateRate, 2);
        $unrecordedBreakdownItems = [];
        foreach ($unrecordedCutoffDates as $missingDate) {
            $unrecordedBreakdownItems[] = [
                'id' => 'unrecorded_'.$missingDate,
                'type' => 'unrecorded_cutoff',
                'type_label' => 'Tidak Absen Cutoff',
                'reference_id' => null,
                'date' => $missingDate,
                'title' => 'Tidak Absen Sampai Cutoff',
                'description' => 'Potongan 0.5 hari kerja (prorata)',
                'amount' => $halfDayProrateRate,
                'is_reverted' => false,
            ];
        }

        $dendaBreakdown = array_merge($lateBreakdownItems, $unrecordedBreakdownItems, $manualBreakdownItems);

        $manualDeductionBreakdown = [];
        $otherDeductions = EmployeeDeduction::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->where('employee_id', $employee->id)
            ->whereNotIn('type', ['kasbon', 'denda'])
            ->whereBetween('deduction_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        foreach ($otherDeductions as $otherDeduction) {
            $label = ! empty($otherDeduction->notes) ? $otherDeduction->notes : ucfirst(str_replace('_', ' ', $otherDeduction->type));
            $manualDeductionBreakdown[$label] = round(($manualDeductionBreakdown[$label] ?? 0) + (float) $otherDeduction->amount, 2);
        }
        $manualDeductionTotal = round(collect($manualDeductionBreakdown)->sum(), 2);

        $dendaDeduction = round($manualDendaDeduction + $attendanceLateDeduction + $unrecordedCutoffDeduction, 2);
        $deductionsTotal = round(
            $kasbonDeduction + $dendaDeduction + $unpaidLeaveDeduction + $pph21Deduction + $manualDeductionTotal + $bpjs['bpjs_total_employee'],
            2
        );

        // BPJS Perusahaan dan Tunjangan PPH dikategorikan sebagai benefit, tidak dihitung ke dalam gaji
        $takeHomePayDeductions = round(
            $kasbonDeduction + $dendaDeduction + $unpaidLeaveDeduction + (in_array($pph21Method, ['gross_up', 'ter_bulanan_gross_up'], true) ? 0 : $pph21Deduction) + $manualDeductionTotal + $bpjs['bpjs_total_employee'],
            2
        );
        $netSalary = round(max(($baseSalary + $allowancesTotal + $overtimePay) - $takeHomePayDeductions, 0), 2);

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
            'bpjs_kesehatan_company' => $bpjs['bpjs_kesehatan_company'],
            'bpjs_kesehatan_employee' => $bpjs['bpjs_kesehatan_employee'],
            'bpjs_kesehatan_class' => $bpjsKesClass,
            'bpjs_jkk_company' => $bpjs['bpjs_jkk_company'],
            'bpjs_jkm_company' => $bpjs['bpjs_jkm_company'],
            'bpjs_jht_company' => $bpjs['bpjs_jht_company'],
            'bpjs_jht_employee' => $bpjs['bpjs_jht_employee'],
            'bpjs_jp_company' => $bpjs['bpjs_jp_company'],
            'bpjs_jp_employee' => $bpjs['bpjs_jp_employee'],
            'bpjs_total_company' => $bpjs['bpjs_total_company'],
            'bpjs_total_employee' => $bpjs['bpjs_total_employee'],
            'private_insurance_name' => $hasPrivateInsurance ? $privateInsuranceName : null,
            'private_insurance_nominal' => $hasPrivateInsurance ? $privateInsuranceNominal : 0.0,
            'kasbon_deduction' => $kasbonDeduction,
            'denda_deduction' => $dendaDeduction,
            'denda_breakdown' => $dendaBreakdown,
            'unpaid_leave_deduction' => $unpaidLeaveDeduction,
            'manual_deduction_total' => $manualDeductionTotal,
            'manual_deduction_breakdown' => $manualDeductionBreakdown,
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

        for ($date = $start->copy(); $date->lte($end); $date = $date->addDay()) {
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
                'denda_breakdown' => [],
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
            'gross', 'ter_bulanan' => [0, $monthlyTax, 0],
            'net', 'ter_bulanan_net' => [0, 0, $monthlyTax],
            'gross_up', 'ter_bulanan_gross_up' => [$monthlyTax, $monthlyTax, 0],
            'ter_harian' => [0, $monthlyTax, 0],
            'none' => [0, 0, 0],
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
        return $employee->leaveRequests
            ->where('leave_type', 'unpaid')
            ->sum(function ($leave) use ($start, $end): int {
                $leaveStart = Carbon::parse($leave->start_date)->max($start);
                $leaveEnd = Carbon::parse($leave->end_date)->min($end);

                return $leaveStart->greaterThan($leaveEnd) ? 0 : (int) ($leaveStart->diffInDays($leaveEnd) + 1);
            });
    }

    private function unrecordedAttendanceCutoffDays(Employee $employee, Carbon $start, Carbon $end, ?CompanySetting $setting): int
    {
        return count($this->unrecordedAttendanceCutoffDates($employee, $start, $end, $setting));
    }

    /**
     * @return array<string>
     */
    private function unrecordedAttendanceCutoffDates(Employee $employee, Carbon $start, Carbon $end, ?CompanySetting $setting): array
    {
        if (! (bool) ($setting?->unrecorded_cutoff_penalty_enabled ?? false)) {
            return [];
        }

        $cutoffDay = $setting->attendance_revision_cutoff_day ?? 'end_of_month';
        $cutoffDate = $cutoffDay === 'end_of_month'
            ? $end->copy()->endOfDay()
            : $end->copy()->day(min((int) $cutoffDay, $end->daysInMonth))->endOfDay();

        $schedules = $employee->schedules->keyBy(
            fn ($schedule): string => $schedule->work_date->toDateString()
        );
        $attendances = $employee->attendances->keyBy(
            fn ($att): string => $att->attendance_date?->toDateString() ?? ''
        );
        $approvedLeaves = $employee->leaveRequests;

        $missingDates = [];
        $evalEnd = $end->copy()->min(now());

        for ($date = $start->copy(); $date->lte($evalEnd); $date = $date->addDay()) {
            if ($date->greaterThan($cutoffDate)) {
                break;
            }

            $dateStr = $date->toDateString();
            $schedule = $schedules->get($dateStr);
            $isWorkingDay = $schedule ? ! $schedule->is_day_off : $date->isWeekday();

            if (! $isWorkingDay) {
                continue;
            }

            // Shifts with WFA do not require attendance and must not trigger cutoff deductions
            if ($schedule && (bool) $schedule->is_wfa) {
                continue;
            }

            $attendance = $attendances->get($dateStr);
            if ($attendance && ($attendance->check_in_at !== null || in_array($attendance->status, ['present', 'late', 'on_leave', 'wfa'], true))) {
                continue;
            }

            $hasLeave = $approvedLeaves->contains(function ($leave) use ($dateStr): bool {
                $startStr = Carbon::parse($leave->start_date)->toDateString();
                $endStr = Carbon::parse($leave->end_date)->toDateString();

                return $dateStr >= $startStr && $dateStr <= $endStr;
            });

            if (! $hasLeave) {
                $missingDates[] = $dateStr;
            }
        }

        return $missingDates;
    }
}
