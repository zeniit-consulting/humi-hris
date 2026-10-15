<?php

namespace App\Http\Controllers;

use App\Models\AttendanceCorrectionRequest;
use App\Models\ClientInvoice;
use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeEmploymentHistory;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\ManpowerRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\ReimbursementRequest;
use App\Models\ShiftChangeRequest;
use App\Models\SubCompany;
use App\Models\User;
use App\Support\RoleRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display dashboard with HRIS overview and attendance chart.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role === 'user' || ($user->isSubAdmin() && \App\Support\DeviceDetector::isMobile($request))) {
            return redirect()->to(RoleRedirect::for($user, $request));
        }

        $ownerId = $user->accountOwnerId();

        $validated = $request->validate([
            'period' => ['nullable', 'string', 'max:20'],
            'period_type' => ['nullable', 'in:month,quarter,semester'],
            'range' => ['nullable', 'in:today,this_week,this_month'],
            'outsourcing_period' => ['nullable', 'date_format:Y-m'],
            'outsourcing_sub_company_id' => ['nullable', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
        ]);

        $periodInfo = $this->resolvePeriodInfo(
            $ownerId,
            $validated['period'] ?? null,
            $validated['period_type'] ?? null
        );

        $period = $periodInfo['period'];
        $periodDate = $periodInfo['period_date'];
        $isCurrentPeriod = $periodInfo['is_current'];
        $activeRange = $validated['range'] ?? 'this_week';
        $outsourcingPeriod = $validated['outsourcing_period'] ?? (
            $periodInfo['type'] === 'month' ? $period : now()->format('Y-m')
        );
        $outsourcingSubCompanyId = $validated['outsourcing_sub_company_id'] ?? null;
        $today = Carbon::today();

        // Determine reference date for daily attendance and chart
        $referenceDate = $isCurrentPeriod ? $today->copy() : $periodInfo['end_date']->copy();

        $startDate = match ($activeRange) {
            'today' => $referenceDate->copy(),
            'this_month' => $periodInfo['start_date']->copy(),
            default => $isCurrentPeriod ? $today->copy()->startOfWeek() : $periodInfo['start_date']->copy(),
        };

        $chartEndDate = match ($activeRange) {
            'today' => $referenceDate->copy(),
            'this_month' => $periodInfo['end_date']->copy(),
            default => $isCurrentPeriod ? $today->copy() : $periodInfo['end_date']->copy(),
        };

        $totalEmployees = Employee::query()->count();
        $activeEmployees = Employee::query()->where('is_active', true)->count();
        $totalDivisions = Division::query()->count();
        $totalPositions = Position::query()->count();
        $openPositions = (int) JobVacancy::query()
            ->where('status', 'published')
            ->where(function ($query) use ($today): void {
                $query->whereNull('closing_date')
                    ->orWhereDate('closing_date', '>=', $today);
            })
            ->sum('openings');

        $monthlyPayrollBurn = (float) (PayrollRun::query()
            ->where('user_id', $ownerId)
            ->whereIn('period', $periodInfo['months'])
            ->latest('generated_at')
            ->value('total_net_salary') ?? 0);

        $resignedYtd = Employee::query()
            ->where('employment_status', 'resigned')
            ->whereYear('updated_at', $periodDate->year)
            ->count();

        $attritionYtd = ($activeEmployees + $resignedYtd) > 0
            ? round(($resignedYtd / ($activeEmployees + $resignedYtd)) * 100, 1)
            : 0;

        $todayAttendance = EmployeeAttendance::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereDate('attendance_date', $referenceDate)
            ->groupBy('status')
            ->pluck('total', 'status');

        $presentToday = (int) ($todayAttendance['present'] ?? 0);
        $lateToday = (int) ($todayAttendance['late'] ?? 0);
        $onLeaveToday = (int) ($todayAttendance['on_leave'] ?? 0);

        $fallbackAbsent = max($activeEmployees - ($presentToday + $lateToday + $onLeaveToday), 0);
        $absentToday = (int) ($todayAttendance['absent'] ?? $fallbackAbsent);

        $todayRate = $activeEmployees > 0
            ? round((($presentToday + $lateToday) / $activeEmployees) * 100, 1)
            : 0;

        $genderStatsRaw = Employee::query()
            ->where('is_active', true)
            ->selectRaw('gender, COUNT(*) as total')
            ->groupBy('gender')
            ->pluck('total', 'gender');

        $genderStats = [];
        foreach ($genderStatsRaw as $rawKey => $cnt) {
            $normalizedKey = trim((string) $rawKey) !== '' ? (string) $rawKey : 'unknown';
            $genderStats[$normalizedKey] = ($genderStats[$normalizedKey] ?? 0) + (int) $cnt;
        }

        $dailyRaw = EmployeeAttendance::query()
            ->selectRaw('attendance_date, status, COUNT(*) as total')
            ->whereBetween('attendance_date', [$startDate->toDateString(), $chartEndDate->toDateString()])
            ->groupBy('attendance_date', 'status')
            ->orderBy('attendance_date')
            ->get();

        $dailyGrouped = $dailyRaw->groupBy(
            fn (EmployeeAttendance $attendance) => $attendance->attendance_date->toDateString()
        );

        $dates = collect();
        $cursor = $startDate->copy();

        while ($cursor->lte($chartEndDate)) {
            $dates->push($cursor->copy());
            $cursor = $cursor->addDay();
        }

        $attendanceChart = $dates->map(function ($date) use ($dailyGrouped, $activeEmployees) {
            $dateKey = $date->toDateString();
            $rows = collect($dailyGrouped->get($dateKey, []));
            $counts = $rows->pluck('total', 'status');

            $present = (int) ($counts['present'] ?? 0);
            $late = (int) ($counts['late'] ?? 0);
            $onLeave = (int) ($counts['on_leave'] ?? 0);
            $fallbackAbsent = max($activeEmployees - ($present + $late + $onLeave), 0);
            $absent = (int) ($counts['absent'] ?? $fallbackAbsent);

            $attendanceRate = $activeEmployees > 0
                ? round((($present + $late) / $activeEmployees) * 100, 1)
                : 0;

            return [
                'date' => $dateKey,
                'label' => $date->format('d M'),
                'present' => $present,
                'late' => $late,
                'on_leave' => $onLeave,
                'absent' => $absent,
                'attendance_rate' => $attendanceRate,
            ];
        });

        return Inertia::render('dashboard', [
            'filters' => [
                'period' => $period,
                'period_type' => $periodInfo['type'],
                'period_label' => $periodInfo['period_label'],
                'range' => $activeRange,
                'outsourcing_period' => $outsourcingPeriod,
                'outsourcing_sub_company_id' => $outsourcingSubCompanyId ? (string) $outsourcingSubCompanyId : '',
            ],
            'availablePeriods' => $this->availablePeriods($ownerId),
            'availablePeriodOptions' => $this->availablePeriodOptions($ownerId),
            'stats' => [
                'total_employees' => $totalEmployees,
                'active_employees' => $activeEmployees,
                'total_divisions' => $totalDivisions,
                'total_positions' => $totalPositions,
                'present_today' => $presentToday,
                'late_today' => $lateToday,
                'on_leave_today' => $onLeaveToday,
                'absent_today' => $absentToday,
                'open_positions' => $openPositions,
                'monthly_payroll_burn' => $monthlyPayrollBurn,
                'attrition_ytd' => $attritionYtd,
                'resigned_ytd' => $resignedYtd,
                'today_attendance_rate' => $todayRate,
                'gender' => $genderStats,
            ],
            'attendanceChart' => $attendanceChart,
            'executiveInsights' => $this->executiveInsights($ownerId, $periodDate, $periodInfo),
            'payrollBurnrate' => $this->payrollBurnrateSummary($ownerId, $periodDate),
            'insuranceBurnrate' => $this->insuranceBurnrateSummary($ownerId, $periodDate),
            'employeeMobility' => $this->employeeMobilitySummary($ownerId, $periodDate),
            'reimburseRate' => $this->reimburseRateSummary($ownerId, $periodDate),
            'actionQueue' => $this->actionQueue($ownerId, $today),
            'attendanceFocus' => $this->attendanceFocus($ownerId, $referenceDate, $periodInfo),
            'recentRequests' => $this->recentRequests($ownerId, $periodInfo),
            'contractReminders' => $this->contractReminders($ownerId, $periodDate),
            'outsourcing' => $this->outsourcingSummary(
                $ownerId,
                $outsourcingPeriod,
                $outsourcingSubCompanyId,
                $today,
            ),
            'pieCharts' => [
                'gender_by_division' => $this->genderByDivisionData($ownerId, $periodInfo),
                'payroll_by_division' => $this->payrollByDivisionData($ownerId, $periodInfo),
                'reimburse_by_category' => $this->reimburseByCategoryData($ownerId, $periodInfo),
                'reimburse_by_division' => $this->reimburseByDivisionData($ownerId, $periodInfo),
                'resign_reasons' => $this->resignReasonsData($ownerId, $periodInfo),
            ],
        ]);
    }

    private function outsourcingSummary(
        int $ownerId,
        string $period,
        ?int $subCompanyId,
        Carbon $today,
    ): array {
        $subCompanies = SubCompany::query()
            ->where('user_id', $ownerId)
            ->when($subCompanyId, fn ($query) => $query->where('id', $subCompanyId))
            ->withCount([
                'employees as outsourced_employees_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'is_active']);

        $subCompanyIds = $subCompanies->pluck('id');
        $todayDate = $today->toDateString();

        $outsourcedEmployees = Employee::query()
            ->where('user_id', $ownerId)
            ->whereIn('sub_company_id', $subCompanyIds)
            ->where('is_active', true);

        $attendanceCounts = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereDate('attendance_date', $todayDate)
            ->whereHas('employee', fn ($query) => $query->whereIn('sub_company_id', $subCompanyIds))
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $activeOutsourced = (clone $outsourcedEmployees)->count();
        $presentToday = (int) ($attendanceCounts['present'] ?? 0);
        $lateToday = (int) ($attendanceCounts['late'] ?? 0);
        $onLeaveToday = (int) ($attendanceCounts['on_leave'] ?? 0);
        $absentToday = max($activeOutsourced - ($presentToday + $lateToday + $onLeaveToday), 0);

        $invoiceQuery = ClientInvoice::query()
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->whereIn('sub_company_id', $subCompanyIds);

        $billedAmount = (float) (clone $invoiceQuery)->where('status', '!=', 'cancelled')->sum('total_amount');
        $paidAmount = (float) (clone $invoiceQuery)->where('status', 'paid')->sum('total_amount');
        $outstandingAmount = (float) (clone $invoiceQuery)->whereIn('status', ['draft', 'sent'])->sum('total_amount');
        $payrollCost = $this->outsourcingPayrollCost($ownerId, $period, $subCompanyIds->all());

        $manpowerOpen = ManpowerRequest::query()
            ->where('user_id', $ownerId)
            ->whereIn('sub_company_id', $subCompanyIds)
            ->whereIn('status', ['open', 'in_progress'])
            ->selectRaw('COUNT(*) as requests, SUM(requested_headcount - fulfilled_headcount) as remaining')
            ->first();

        return [
            'subCompanies' => SubCompany::query()
                ->where('user_id', $ownerId)
                ->orderBy('name')
                ->get(['id', 'code', 'name'])
                ->map(fn (SubCompany $company): array => [
                    'id' => $company->id,
                    'label' => $company->code.' - '.$company->name,
                ]),
            'stats' => [
                'active_clients' => $subCompanies->where('is_active', true)->count(),
                'outsourced_employees' => $activeOutsourced,
                'internal_employees' => Employee::query()->where('user_id', $ownerId)->whereNull('sub_company_id')->where('is_active', true)->count(),
                'present_today' => $presentToday + $lateToday,
                'absent_today' => $absentToday,
                'attendance_rate' => $activeOutsourced > 0 ? round((($presentToday + $lateToday) / $activeOutsourced) * 100, 1) : 0,
                'billed_amount' => $billedAmount,
                'paid_amount' => $paidAmount,
                'outstanding_amount' => $outstandingAmount,
                'payroll_cost' => $payrollCost,
                'gross_margin' => $billedAmount - $payrollCost,
                'manpower_requests' => (int) ($manpowerOpen?->requests ?? 0),
                'remaining_manpower' => (int) ($manpowerOpen?->remaining ?? 0),
            ],
            'perClient' => $subCompanies->map(function (SubCompany $company) use ($ownerId, $period, $todayDate): array {
                $employees = (int) $company->outsourced_employees_count;
                $attendance = EmployeeAttendance::query()
                    ->where('user_id', $ownerId)
                    ->whereDate('attendance_date', $todayDate)
                    ->whereHas('employee', fn ($query) => $query->where('sub_company_id', $company->id))
                    ->selectRaw('status, COUNT(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status');

                $present = (int) ($attendance['present'] ?? 0);
                $late = (int) ($attendance['late'] ?? 0);
                $leave = (int) ($attendance['on_leave'] ?? 0);
                $invoiceTotal = (float) ClientInvoice::query()
                    ->where('user_id', $ownerId)
                    ->where('sub_company_id', $company->id)
                    ->where('period', $period)
                    ->where('status', '!=', 'cancelled')
                    ->sum('total_amount');
                $outstandingInvoice = (float) ClientInvoice::query()
                    ->where('user_id', $ownerId)
                    ->where('sub_company_id', $company->id)
                    ->where('period', $period)
                    ->whereIn('status', ['draft', 'sent'])
                    ->sum('total_amount');
                $payroll = $this->outsourcingPayrollCost($ownerId, $period, [$company->id]);
                $remainingManpower = (int) (ManpowerRequest::query()
                    ->where('user_id', $ownerId)
                    ->where('sub_company_id', $company->id)
                    ->whereIn('status', ['open', 'in_progress'])
                    ->sum(DB::raw('requested_headcount - fulfilled_headcount')) ?? 0);
                $attendanceRate = $employees > 0 ? round((($present + $late) / $employees) * 100, 1) : 0;
                $margin = $invoiceTotal - $payroll;
                $slaBreaches = collect([
                    $attendanceRate < 95 ? 'attendance' : null,
                    $remainingManpower > 0 ? 'manpower' : null,
                    $outstandingInvoice > 0 ? 'billing' : null,
                    $margin < 0 ? 'margin' : null,
                ])->filter()->values();

                return [
                    'id' => $company->id,
                    'label' => $company->code.' - '.$company->name,
                    'active' => $company->is_active,
                    'employees' => $employees,
                    'present_today' => $present + $late,
                    'absent_today' => max($employees - ($present + $late + $leave), 0),
                    'attendance_rate' => $attendanceRate,
                    'invoice_total' => $invoiceTotal,
                    'outstanding_invoice' => $outstandingInvoice,
                    'payroll_cost' => $payroll,
                    'margin' => $margin,
                    'remaining_manpower' => $remainingManpower,
                    'sla_score' => max(100 - ($slaBreaches->count() * 25), 0),
                    'sla_breaches' => $slaBreaches,
                ];
            })->values(),
        ];
    }

    private function attendanceFocus(int $ownerId, Carbon $referenceDate, string|array $period): array
    {
        $targetDate = $referenceDate->toDateString();

        $attendedEmployeeIds = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereDate('attendance_date', $targetDate)
            ->pluck('employee_id');

        $missingClockIns = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->whereNotIn('id', $attendedEmployeeIds)
            ->orderBy('first_name')
            ->limit(20)
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'sub_company_id'])
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
                'href' => route('hris.attendances.index', ['date' => $targetDate, 'employee_id' => $employee->id]),
            ]);

        // Query late attendances for the period (prioritizing the reference date or the selected month)
        $lateAttendanceQuery = EmployeeAttendance::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->where('status', 'late');

        $isCurrent = is_array($period) ? $period['is_current'] : ($period === now()->format('Y-m'));

        if ($isCurrent) {
            $lateAttendanceQuery->whereDate('attendance_date', $targetDate);
        } else {
            $startDateStr = is_array($period)
                ? $period['start_date']->toDateString()
                : Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
            $endDateStr = is_array($period)
                ? $period['end_date']->toDateString()
                : Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();

            $lateAttendanceQuery->whereBetween('attendance_date', [$startDateStr, $endDateStr]);
        }

        $lateItems = $lateAttendanceQuery
            ->orderByDesc('attendance_date')
            ->orderBy('check_in_at')
            ->limit(20)
            ->get()
            ->map(fn (EmployeeAttendance $attendance): array => [
                'id' => $attendance->id,
                'label' => $attendance->employee
                    ? $attendance->employee->employee_code.' - '.$attendance->employee->full_name
                    : 'Karyawan',
                'time' => $this->attendanceLocalTime($attendance),
                'date_label' => $attendance->attendance_date?->format('d M Y') ?? $targetDate,
                'href' => route('hris.attendances.index', ['date' => $attendance->attendance_date?->toDateString() ?? $targetDate, 'employee_id' => $attendance->employee_id]),
            ]);

        return [
            'missing_clock_ins_count' => Employee::query()
                ->where('user_id', $ownerId)
                ->where('is_active', true)
                ->whereNotIn('id', $attendedEmployeeIds)
                ->count(),
            'late_today_count' => $lateItems->count(),
            'missingClockIns' => $missingClockIns,
            'lateToday' => $lateItems,
            'items' => $lateItems
                ->map(fn (array $item): array => [
                    'id' => 'late-'.$item['id'],
                    'label' => $item['label'],
                    'description' => 'Telat · Clock in '.$item['time'].' · '.($item['date_label'] ?? ''),
                    'href' => $item['href'],
                ])
                ->concat($missingClockIns->map(fn (array $item): array => [
                    'id' => 'missing-'.$item['id'],
                    'label' => $item['label'],
                    'description' => 'Belum clock in',
                    'href' => $item['href'],
                ]))
                ->take(20)
                ->values(),
        ];
    }

    private function attendanceLocalTime(EmployeeAttendance $attendance): string
    {
        if ($attendance->check_in_at === null) {
            return '-';
        }

        $timezone = is_string($attendance->timezone)
            && in_array($attendance->timezone, timezone_identifiers_list(), true)
                ? $attendance->timezone
                : config('app.timezone');

        $label = match ($timezone) {
            'Asia/Jakarta', 'Asia/Pontianak' => 'WIB',
            'Asia/Makassar', 'Asia/Ujung_Pandang' => 'WITA',
            'Asia/Jayapura' => 'WIT',
            default => $timezone,
        };

        return $attendance->check_in_at->copy()->setTimezone($timezone)->format('H:i').' '.$label;
    }

    private function recentRequests(int $ownerId, string|array $period): array
    {
        $items = collect()
            ->merge($this->recentAttendanceRequests($ownerId, $period))
            ->merge($this->recentLeaveRequests($ownerId, $period))
            ->merge($this->recentOvertimeRequests($ownerId, $period))
            ->merge($this->recentShiftChangeRequests($ownerId, $period))
            ->sortByDesc('created_at')
            ->take(20)
            ->values();

        return [
            'items' => $items->map(fn (array $item): array => [
                ...$item,
                'created_at' => $item['created_at']?->diffForHumans(),
            ]),
        ];
    }

    private function contractReminders(int $ownerId, Carbon $periodDate): array
    {
        $periodStart = $periodDate->copy()->startOfMonth()->toDateString();
        $periodEnd = $periodDate->copy()->endOfMonth()->toDateString();
        $isCurrentMonth = $periodDate->format('Y-m') === now()->format('Y-m');

        $dateRange = $isCurrentMonth
            ? [now()->toDateString(), now()->addDays(30)->toDateString()]
            : [$periodStart, $periodEnd];

        $contractQuery = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->where('employment_type', 'PKWT')
            ->whereBetween('contract_end_date', $dateRange);
        $probationQuery = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->where('employment_status', 'probation')
            ->whereBetween('probation_end_date', $dateRange);

        $contracts = (clone $contractQuery)
            ->orderBy('contract_end_date')
            ->limit(20)
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'contract_end_date'])
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'type' => 'Kontrak',
                'employee_label' => $employee->employee_code.' - '.$employee->full_name,
                'end_date' => $employee->contract_end_date?->toDateString(),
            ]);

        $probations = (clone $probationQuery)
            ->orderBy('probation_end_date')
            ->limit(20)
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'probation_end_date'])
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'type' => 'Probation',
                'employee_label' => $employee->employee_code.' - '.$employee->full_name,
                'end_date' => $employee->probation_end_date?->toDateString(),
            ]);

        return [
            'total' => (clone $contractQuery)->count() + (clone $probationQuery)->count(),
            'items' => $contracts
                ->concat($probations)
                ->sortBy('end_date')
                ->take(20)
                ->values()
                ->map(fn (array $item): array => [
                    ...$item,
                    'date_label' => Carbon::parse($item['end_date'])->translatedFormat('d M Y'),
                    'days_remaining' => (int) $periodDate->diffInDays(Carbon::parse($item['end_date'])),
                    'href' => route('hris.employees.index', ['search' => str($item['employee_label'])->before(' - ')->toString()]),
                ]),
        ];
    }

    private function recentAttendanceRequests(int $ownerId, string|array $period): array
    {
        if (is_array($period)) {
            $start = $period['start_date']->toDateString();
            $end = $period['end_date']->toDateString();
        } else {
            $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
            $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();
        }

        return AttendanceCorrectionRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('attendance_date', [$start, $end])
                    ->orWhereBetween('created_at', [$start.' 00:00:00', $end.' 23:59:59']);
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (AttendanceCorrectionRequest $request): array => [
                'id' => 'attendance-'.$request->id,
                'type' => 'Koreksi Absensi',
                'employee_label' => $this->employeeLabel($request->employee),
                'date_label' => $request->attendance_date?->format('d M Y') ?? '-',
                'status' => $request->status,
                'href' => route('hris.attendance-approvals.index'),
                'created_at' => $request->created_at,
            ])
            ->all();
    }

    private function recentLeaveRequests(int $ownerId, string|array $period): array
    {
        if (is_array($period)) {
            $start = $period['start_date']->toDateString();
            $end = $period['end_date']->toDateString();
        } else {
            $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
            $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();
        }

        return LeaveRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhereBetween('created_at', [$start.' 00:00:00', $end.' 23:59:59']);
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (LeaveRequest $request): array => [
                'id' => 'leave-'.$request->id,
                'type' => 'Cuti/Sakit',
                'employee_label' => $this->employeeLabel($request->employee),
                'date_label' => ($request->start_date?->format('d M Y') ?? '-').' - '.($request->end_date?->format('d M Y') ?? '-'),
                'status' => $request->status,
                'href' => route('hris.leave-approvals.index'),
                'created_at' => $request->created_at,
            ])
            ->all();
    }

    private function recentOvertimeRequests(int $ownerId, string|array $period): array
    {
        if (is_array($period)) {
            $start = $period['start_date']->toDateString();
            $end = $period['end_date']->toDateString();
        } else {
            $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
            $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();
        }

        return OvertimeRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('work_date', [$start, $end])
                    ->orWhereBetween('created_at', [$start.' 00:00:00', $end.' 23:59:59']);
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (OvertimeRequest $request): array => [
                'id' => 'overtime-'.$request->id,
                'type' => 'Lembur',
                'employee_label' => $this->employeeLabel($request->employee),
                'date_label' => $request->work_date?->format('d M Y') ?? '-',
                'status' => $request->status,
                'href' => route('hris.overtime-approvals.index'),
                'created_at' => $request->created_at,
            ])
            ->all();
    }

    private function recentShiftChangeRequests(int $ownerId, string|array $period): array
    {
        if (is_array($period)) {
            $start = $period['start_date']->toDateString();
            $end = $period['end_date']->toDateString();
        } else {
            $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
            $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();
        }

        return ShiftChangeRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('requested_date', [$start, $end])
                    ->orWhereBetween('created_at', [$start.' 00:00:00', $end.' 23:59:59']);
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (ShiftChangeRequest $request): array => [
                'id' => 'shift-'.$request->id,
                'type' => 'Perubahan Jadwal',
                'employee_label' => $this->employeeLabel($request->employee),
                'date_label' => $request->requested_date?->format('d M Y') ?? '-',
                'status' => $request->status,
                'href' => route('hris.shift-change-requests.index'),
                'created_at' => $request->created_at,
            ])
            ->all();
    }

    private function employeeLabel(?Employee $employee): string
    {
        return $employee
            ? $employee->employee_code.' - '.$employee->full_name
            : 'Karyawan';
    }

    private function actionQueue(int $ownerId, Carbon $today): array
    {
        $documentThreshold = $today->copy()->addDays(30)->toDateString();
        $expiredDocuments = EmployeeDocument::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('file_path')
            ->whereDate('expires_at', '<', $today->toDateString())
            ->count();
        $expiringDocuments = EmployeeDocument::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('file_path')
            ->whereBetween('expires_at', [$today->toDateString(), $documentThreshold])
            ->count();

        $items = [
            [
                'key' => 'attendance_corrections',
                'label' => 'Approval koreksi absensi',
                'count' => AttendanceCorrectionRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count(),
                'severity' => 'high',
                'href' => route('hris.attendance-approvals.index'),
            ],
            [
                'key' => 'leave_approvals',
                'label' => 'Approval cuti',
                'count' => LeaveRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count(),
                'severity' => 'medium',
                'href' => route('hris.leave-approvals.index'),
            ],
            [
                'key' => 'overtime_approvals',
                'label' => 'Approval lembur',
                'count' => OvertimeRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count(),
                'severity' => 'medium',
                'href' => route('hris.overtime-approvals.index'),
            ],
            [
                'key' => 'shift_change_approvals',
                'label' => 'Approval perubahan jadwal',
                'count' => ShiftChangeRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count(),
                'severity' => 'medium',
                'href' => route('hris.shift-change-requests.index'),
            ],
            [
                'key' => 'manpower_gap',
                'label' => 'Kebutuhan tenaga belum terpenuhi',
                'count' => (int) (ManpowerRequest::query()
                    ->where('user_id', $ownerId)
                    ->whereIn('status', ['open', 'in_progress'])
                    ->sum(DB::raw('requested_headcount - fulfilled_headcount')) ?? 0),
                'severity' => 'high',
                'href' => route('hris.manpower-requests.index'),
            ],
            [
                'key' => 'billing_outstanding',
                'label' => 'Invoice klien draft/terkirim',
                'count' => ClientInvoice::query()->where('user_id', $ownerId)->whereIn('status', ['draft', 'sent'])->count(),
                'severity' => 'medium',
                'href' => route('hris.client-billings.index'),
            ],
            [
                'key' => 'document_compliance',
                'label' => 'Dokumen expired/akan habis',
                'count' => $expiredDocuments + $expiringDocuments,
                'severity' => $expiredDocuments > 0 ? 'high' : 'medium',
                'href' => route('hris.employees.index'),
            ],
        ];

        return [
            'total' => collect($items)->sum('count'),
            'items' => collect($items)
                ->filter(fn (array $item): bool => $item['count'] > 0)
                ->sortBy(fn (array $item): int => (($item['severity'] === 'high' ? 0 : 1) * 100_000) - $item['count'])
                ->values(),
        ];
    }

    private function outsourcingPayrollCost(int $ownerId, string $period, array $subCompanyIds): float
    {
        $run = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->where('type', 'regular')
            ->first();

        if (! $run) {
            return (float) Employee::query()
                ->where('user_id', $ownerId)
                ->whereIn('sub_company_id', $subCompanyIds)
                ->where('is_active', true)
                ->sum('base_salary');
        }

        return (float) $run->items()
            ->whereHas('employee', fn ($query) => $query->whereIn('sub_company_id', $subCompanyIds))
            ->sum('net_salary');
    }

    /**
     * Get list of unique periods (Y-m) that contain operational / HR data for this account.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function availablePeriods(int $ownerId): array
    {
        $attendancePeriods = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('attendance_date')
            ->selectRaw("DISTINCT SUBSTRING(attendance_date, 1, 7) as period")
            ->pluck('period');

        $payrollPeriods = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('period')
            ->selectRaw("DISTINCT period")
            ->pluck('period');

        $leavePeriods = LeaveRequest::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('start_date')
            ->selectRaw("DISTINCT SUBSTRING(start_date, 1, 7) as period")
            ->pluck('period');

        $overtimePeriods = OvertimeRequest::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('work_date')
            ->selectRaw("DISTINCT SUBSTRING(work_date, 1, 7) as period")
            ->pluck('period');

        $reimbursePeriods = ReimbursementRequest::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('created_at')
            ->selectRaw("DISTINCT SUBSTRING(created_at, 1, 7) as period")
            ->pluck('period');

        $allPeriods = collect([now()->format('Y-m')])
            ->merge($attendancePeriods)
            ->merge($payrollPeriods)
            ->merge($leavePeriods)
            ->merge($overtimePeriods)
            ->merge($reimbursePeriods)
            ->filter(fn ($p) => is_string($p) && preg_match('/^\d{4}-\d{2}$/', $p))
            ->unique()
            ->sortDesc()
            ->values();

        return $allPeriods->map(fn (string $periodVal): array => [
            'value' => $periodVal,
            'label' => Carbon::createFromFormat('Y-m', $periodVal)->translatedFormat('F Y'),
        ])->all();
    }

    /**
     * @return array{
     *     month: list<array{value: string, label: string}>,
     *     quarter: list<array{value: string, label: string}>,
     *     semester: list<array{value: string, label: string}>
     * }
     */
    private function availablePeriodOptions(int $ownerId): array
    {
        $monthPeriods = $this->availablePeriods($ownerId);

        $years = collect($monthPeriods)
            ->map(fn ($p) => (int) substr($p['value'], 0, 4))
            ->push((int) now()->year)
            ->unique()
            ->sortDesc()
            ->values();

        $quarterOptions = [];
        foreach ($years as $yr) {
            $quarterOptions[] = ['value' => "{$yr}-Q4", 'label' => "Q4 (Okt - Des) {$yr}"];
            $quarterOptions[] = ['value' => "{$yr}-Q3", 'label' => "Q3 (Jul - Sep) {$yr}"];
            $quarterOptions[] = ['value' => "{$yr}-Q2", 'label' => "Q2 (Apr - Jun) {$yr}"];
            $quarterOptions[] = ['value' => "{$yr}-Q1", 'label' => "Q1 (Jan - Mar) {$yr}"];
        }

        $semesterOptions = [];
        foreach ($years as $yr) {
            $semesterOptions[] = ['value' => "{$yr}-S2", 'label' => "Semester 2 (Jul - Des) {$yr}"];
            $semesterOptions[] = ['value' => "{$yr}-S1", 'label' => "Semester 1 (Jan - Jun) {$yr}"];
        }

        return [
            'month' => $monthPeriods,
            'quarter' => $quarterOptions,
            'semester' => $semesterOptions,
        ];
    }

    /**
     * @return array{
     *     type: 'month'|'quarter'|'semester',
     *     period: string,
     *     period_date: Carbon,
     *     start_date: Carbon,
     *     end_date: Carbon,
     *     months: list<string>,
     *     label: string,
     *     period_label: string,
     *     is_current: bool
     * }
     */
    private function resolvePeriodInfo(int $ownerId, ?string $rawPeriod, ?string $rawType): array
    {
        $period = trim((string) $rawPeriod);
        $type = $rawType;

        if (preg_match('/^\d{4}-Q[1-4]$/i', $period)) {
            $type = 'quarter';
            $period = strtoupper($period);
        } elseif (preg_match('/^\d{4}-S[1-2]$/i', $period)) {
            $type = 'semester';
            $period = strtoupper($period);
        } elseif (preg_match('/^\d{4}-\d{2}$/', $period)) {
            $type = 'month';
        }

        if (! in_array($type, ['month', 'quarter', 'semester'], true)) {
            $type = 'month';
        }

        $now = Carbon::now();

        if ($type === 'quarter') {
            if (! preg_match('/^(\d{4})-Q([1-4])$/i', $period, $m)) {
                $quarterNum = (int) ceil($now->month / 3);
                $year = (int) $now->year;
                $period = "{$year}-Q{$quarterNum}";
            } else {
                $year = (int) $m[1];
                $quarterNum = (int) $m[2];
            }

            $startMonthNum = ($quarterNum - 1) * 3 + 1;
            $endMonthNum = $quarterNum * 3;

            $months = [];
            for ($mNum = $startMonthNum; $mNum <= $endMonthNum; $mNum++) {
                $months[] = sprintf('%04d-%02d', $year, $mNum);
            }

            $firstMonth = $months[0];
            $lastMonth = end($months);

            [$startDate] = $this->resolvePeriodDates($ownerId, $firstMonth);
            [, $endDate] = $this->resolvePeriodDates($ownerId, $lastMonth);

            $qNames = [
                1 => 'Q1 (Jan - Mar)',
                2 => 'Q2 (Apr - Jun)',
                3 => 'Q3 (Jul - Sep)',
                4 => 'Q4 (Okt - Des)',
            ];

            $label = ($qNames[$quarterNum] ?? "Q{$quarterNum}")." {$year}";
            $periodLabel = $startDate->translatedFormat('d M').' - '.$endDate->translatedFormat('d M Y');
            $periodDate = Carbon::createFromFormat('Y-m-d', $firstMonth.'-01')->startOfMonth();
            $isCurrent = $period === ($now->year.'-Q'.ceil($now->month / 3));

            return [
                'type' => 'quarter',
                'period' => $period,
                'period_date' => $periodDate,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'months' => $months,
                'label' => $label,
                'period_label' => $periodLabel,
                'is_current' => $isCurrent,
            ];
        }

        if ($type === 'semester') {
            if (! preg_match('/^(\d{4})-S([1-2])$/i', $period, $m)) {
                $semNum = $now->month > 6 ? 2 : 1;
                $year = (int) $now->year;
                $period = "{$year}-S{$semNum}";
            } else {
                $year = (int) $m[1];
                $semNum = (int) $m[2];
            }

            $startMonthNum = $semNum === 1 ? 1 : 7;
            $endMonthNum = $semNum === 1 ? 6 : 12;

            $months = [];
            for ($mNum = $startMonthNum; $mNum <= $endMonthNum; $mNum++) {
                $months[] = sprintf('%04d-%02d', $year, $mNum);
            }

            $firstMonth = $months[0];
            $lastMonth = end($months);

            [$startDate] = $this->resolvePeriodDates($ownerId, $firstMonth);
            [, $endDate] = $this->resolvePeriodDates($ownerId, $lastMonth);

            $semNames = [
                1 => 'Semester 1 (Jan - Jun)',
                2 => 'Semester 2 (Jul - Des)',
            ];

            $label = ($semNames[$semNum] ?? "Semester {$semNum}")." {$year}";
            $periodLabel = $startDate->translatedFormat('d M').' - '.$endDate->translatedFormat('d M Y');
            $periodDate = Carbon::createFromFormat('Y-m-d', $firstMonth.'-01')->startOfMonth();
            $isCurrent = $period === ($now->year.'-S'.($now->month > 6 ? 2 : 1));

            return [
                'type' => 'semester',
                'period' => $period,
                'period_date' => $periodDate,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'months' => $months,
                'label' => $label,
                'period_label' => $periodLabel,
                'is_current' => $isCurrent,
            ];
        }

        // Default: month
        if (! preg_match('/^\d{4}-\d{2}$/', $period)) {
            $period = $now->format('Y-m');
        }

        $periodDate = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
        [$startDate, $endDate] = $this->resolvePeriodDates($ownerId, $period);
        $periodLabel = $startDate->translatedFormat('d M').' - '.$endDate->translatedFormat('d M Y');
        $label = $periodDate->translatedFormat('F Y');
        $isCurrent = $period === $now->format('Y-m');

        return [
            'type' => 'month',
            'period' => $period,
            'period_date' => $periodDate,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'months' => [$period],
            'label' => $label,
            'period_label' => $periodLabel,
            'is_current' => $isCurrent,
        ];
    }

    /**
     * Compute 6-month payroll burnrate trend and summary metrics.
     *
     * @return array{
     *     current_burnrate: float,
     *     previous_burnrate: float,
     *     growth_rate: float,
     *     avg_per_employee: float,
     *     trend: list<array<string, mixed>>
     * }
     */
    private function payrollBurnrateSummary(int $ownerId, Carbon $periodDate): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push($periodDate->copy()->subMonths($i));
        }

        $allRuns = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where(function ($query) {
                $query->where('is_locked', true)
                    ->orWhere('status', 'released')
                    ->orWhereNotNull('released_at');
            })
            ->whereBetween('period', [$months->first()->format('Y-m'), $months->last()->format('Y-m')])
            ->get()
            ->groupBy('period');

        $trend = $months->map(function (Carbon $m) use ($allRuns): array {
            $p = $m->format('Y-m');
            $runs = $allRuns->get($p, collect());
            $hasRun = $runs->isNotEmpty();

            if ($hasRun) {
                $regularRun = $runs->firstWhere('type', 'regular') ?? $runs->first();
                $net = (float) $runs->sum('total_net_salary');
                $base = (float) $runs->sum('total_base_salary');
                $allowances = (float) $runs->sum('total_allowances');
                $deductions = (float) $runs->sum('total_deductions');
                $empCount = (int) ($regularRun->employees_count ?? $runs->max('employees_count') ?? 0);
                $isLocked = (bool) $runs->contains(fn ($r) => (bool) $r->is_locked);
                $isReleased = (bool) $runs->contains(fn ($r) => $r->status === 'released' || $r->released_at !== null);
            } else {
                $base = 0.0;
                $allowances = 0.0;
                $deductions = 0.0;
                $net = 0.0;
                $empCount = 0;
                $isLocked = false;
                $isReleased = false;
            }

            return [
                'period' => $p,
                'label' => $m->translatedFormat('M y'),
                'net_salary' => $net,
                'base_salary' => $base,
                'allowances' => $allowances,
                'deductions' => $deductions,
                'employees_count' => $empCount,
                'is_projected' => false,
                'is_fixed' => $hasRun,
                'is_locked' => $isLocked,
                'is_released' => $isReleased,
            ];
        })->values();

        $currentPoint = $trend->last();
        $prevPoint = $trend->count() >= 2 ? $trend->get($trend->count() - 2) : null;
        $currentBurn = (float) ($currentPoint['net_salary'] ?? 0);
        $prevBurn = (float) ($prevPoint['net_salary'] ?? 0);
        $growthRate = ($prevBurn > 0 && $currentBurn > 0) ? round((($currentBurn - $prevBurn) / $prevBurn) * 100, 1) : 0.0;
        $avgPerEmp = ($currentPoint['employees_count'] ?? 0) > 0 ? round($currentBurn / $currentPoint['employees_count'], 0) : 0.0;

        return [
            'current_burnrate' => $currentBurn,
            'previous_burnrate' => $prevBurn,
            'growth_rate' => $growthRate,
            'avg_per_employee' => $avgPerEmp,
            'trend' => $trend->all(),
        ];
    }

    /**
     * Compute 6-month insurance burnrate trend and statutory BPJS cost summary.
     *
     * @return array{
     *     current_insurance_burn: float,
     *     bpjs_kesehatan_current: float,
     *     bpjs_tk_current: float,
     *     ratio_to_payroll: float,
     *     trend: list<array<string, mixed>>
     * }
     */
    private function insuranceBurnrateSummary(int $ownerId, Carbon $periodDate): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push($periodDate->copy()->subMonths($i));
        }

        $allRuns = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where(function ($query) {
                $query->where('is_locked', true)
                    ->orWhere('status', 'released')
                    ->orWhereNotNull('released_at');
            })
            ->whereBetween('period', [$months->first()->format('Y-m'), $months->last()->format('Y-m')])
            ->with('items')
            ->get()
            ->groupBy('period');

        $trend = $months->map(function (Carbon $m) use ($allRuns): array {
            $p = $m->format('Y-m');
            $runs = $allRuns->get($p, collect());
            $items = $runs->flatMap->items;

            if ($items->isNotEmpty()) {
                $actualKes = (float) $items->sum('bpjs_kesehatan_company');
                $actualTk = (float) $items->sum(fn ($it) => (float) $it->bpjs_jkk_company + (float) $it->bpjs_jkm_company + (float) $it->bpjs_jht_company + (float) $it->bpjs_jp_company);
                $actualPrivate = (float) $items->sum('private_insurance_nominal');
                $actualTotal = (float) $items->sum('bpjs_total_company') + $actualPrivate;
                $payrollNet = (float) $runs->sum('total_net_salary');

                if ($actualTotal > 0) {
                    $bpjsKes = $actualKes;
                    $bpjsTk = $actualTk > 0 ? $actualTk : ($actualTotal - $actualKes - $actualPrivate);
                    $privateIns = $actualPrivate;
                    $totalIns = $actualTotal;
                    $empCount = $items->count();
                } else {
                    $bpjsKes = 0.0;
                    $bpjsTk = 0.0;
                    foreach ($items as $it) {
                        $base = (float) $it->base_salary;
                        $bpjsKes += min($base, 12_000_000) * 0.04;
                        $bpjsTk += ($base * 0.0424) + (min($base, 10_042_300) * 0.02);
                    }
                    $privateIns = 0.0;
                    $totalIns = $bpjsKes + $bpjsTk;
                    $empCount = $items->count();
                }
            } else {
                $bpjsKes = 0.0;
                $bpjsTk = 0.0;
                $privateIns = 0.0;
                $totalIns = 0.0;
                $empCount = 0;
                $payrollNet = 0.0;
            }

            $ratio = $payrollNet > 0 ? round(($totalIns / $payrollNet) * 100, 1) : 0.0;

            return [
                'period' => $p,
                'label' => $m->translatedFormat('M y'),
                'bpjs_kesehatan' => round($bpjsKes, 2),
                'bpjs_ketenagakerjaan' => round($bpjsTk, 2),
                'private_insurance' => round($privateIns, 2),
                'total_insurance' => round($totalIns, 2),
                'insurance_ratio' => $ratio,
                'employees_count' => $empCount,
                'is_projected' => false,
                'is_fixed' => $runs->isNotEmpty(),
            ];
        })->values();

        $currentPoint = $trend->last();
        $currentTotal = (float) ($currentPoint['total_insurance'] ?? 0);
        $currentKes = (float) ($currentPoint['bpjs_kesehatan'] ?? 0);
        $currentTk = (float) ($currentPoint['bpjs_ketenagakerjaan'] ?? 0);
        $currentRatio = (float) ($currentPoint['insurance_ratio'] ?? 0);

        return [
            'current_insurance_burn' => $currentTotal,
            'bpjs_kesehatan_current' => $currentKes,
            'bpjs_tk_current' => $currentTk,
            'ratio_to_payroll' => $currentRatio,
            'trend' => $trend->all(),
        ];
    }

    /**
     * Compute 6-month employee mobility (hires, exits, mutations) summary.
     *
     * @return array{
     *     total_hires: int,
     *     total_exits: int,
     *     total_mutations: int,
     *     net_growth: int,
     *     avg_turnover_rate: float,
     *     trend: list<array<string, mixed>>
     * }
     */
    private function employeeMobilitySummary(int $ownerId, Carbon $periodDate): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push($periodDate->copy()->subMonths($i));
        }

        $activeHeadcount = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->count();

        $trend = $months->map(function (Carbon $m) use ($ownerId, $activeHeadcount): array {
            $p = $m->format('Y-m');

            $hires = Employee::query()
                ->where('user_id', $ownerId)
                ->whereRaw("SUBSTRING(hire_date, 1, 7) = ?", [$p])
                ->count();

            $exits = Employee::query()
                ->where('user_id', $ownerId)
                ->where(function ($q) use ($p) {
                    $q->whereRaw("SUBSTRING(offboarded_at, 1, 7) = ?", [$p])
                        ->orWhere(fn ($sq) => $sq->where('employment_status', 'resigned')->whereRaw("SUBSTRING(updated_at, 1, 7) = ?", [$p]));
                })
                ->count();

            $mutations = EmployeeEmploymentHistory::query()
                ->where('user_id', $ownerId)
                ->whereIn('event_type', ['promotion', 'transfer', 'demotion', 'status_change', 'salary_change', 'position_change'])
                ->where(function ($q) use ($p) {
                    $q->whereRaw("SUBSTRING(effective_date, 1, 7) = ?", [$p])
                        ->orWhereRaw("SUBSTRING(created_at, 1, 7) = ?", [$p]);
                })
                ->count();

            $turnoverRate = $activeHeadcount > 0 ? round(($exits / $activeHeadcount) * 100, 1) : 0.0;

            return [
                'period' => $p,
                'label' => $m->translatedFormat('M y'),
                'hires' => $hires,
                'exits' => $exits,
                'mutations' => $mutations,
                'net_growth' => $hires - $exits,
                'headcount' => $activeHeadcount,
                'turnover_rate' => $turnoverRate,
            ];
        })->values();

        $totalHires = (int) $trend->sum('hires');
        $totalExits = (int) $trend->sum('exits');
        $totalMutations = (int) $trend->sum('mutations');
        $avgTurnover = round($trend->avg('turnover_rate') ?? 0, 1);

        return [
            'total_hires' => $totalHires,
            'total_exits' => $totalExits,
            'total_mutations' => $totalMutations,
            'net_growth' => $totalHires - $totalExits,
            'avg_turnover_rate' => $avgTurnover,
            'trend' => $trend->all(),
        ];
    }

    /**
     * Compute 6-month reimbursement claim rate, volume, and categories.
     *
     * @return array{
     *     current_approved_amount: float,
     *     current_total_count: int,
     *     current_approval_rate: float,
     *     avg_claim_amount: float,
     *     trend: list<array<string, mixed>>
     * }
     */
    private function reimburseRateSummary(int $ownerId, Carbon $periodDate): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push($periodDate->copy()->subMonths($i));
        }

        $trend = $months->map(function (Carbon $m) use ($ownerId): array {
            $p = $m->format('Y-m');
            [$periodStart, $periodEnd] = $this->resolvePeriodDates($ownerId, $p);
            $startStr = $periodStart->copy()->startOfDay()->toDateTimeString();
            $endStr = $periodEnd->copy()->endOfDay()->toDateTimeString();

            // Only fixed reimbursements with status 'paid' ('dibayar') within cutoff
            $paidRequests = ReimbursementRequest::query()
                ->where('user_id', $ownerId)
                ->where('status', 'paid')
                ->where(function ($q) use ($startStr, $endStr) {
                    $q->whereRaw("COALESCE(processed_at, approved_at, created_at) BETWEEN ? AND ?", [$startStr, $endStr]);
                })
                ->get();

            $allRequests = ReimbursementRequest::query()
                ->where('user_id', $ownerId)
                ->where(function ($q) use ($p) {
                    $q->whereRaw("SUBSTRING(created_at, 1, 7) = ?", [$p]);
                })
                ->get();

            $totalCount = $allRequests->count();
            $approvedCount = $allRequests->whereIn('status', ['approved', 'processing', 'paid'])->count();
            $rejectedCount = $allRequests->where('status', 'rejected')->count();
            $pendingCount = $allRequests->where('status', 'pending')->count();

            $paidCount = $paidRequests->count();
            $paidAmount = (float) $paidRequests->sum('amount');
            $submittedAmount = (float) $allRequests->sum('amount');

            $approvalRate = ($approvedCount + $rejectedCount) > 0
                ? round(($approvedCount / ($approvedCount + $rejectedCount)) * 100, 1)
                : ($totalCount > 0 ? 100.0 : 0.0);

            $travels = (float) $paidRequests->filter(fn ($r) => strcasecmp($r->category, 'Travels') === 0)->sum('amount');
            $meals = (float) $paidRequests->filter(fn ($r) => strcasecmp($r->category, 'Meals') === 0)->sum('amount');
            $supplies = (float) $paidRequests->filter(fn ($r) => strcasecmp($r->category, 'Supplies') === 0)->sum('amount');
            $others = (float) $paidRequests->filter(fn ($r) => ! in_array(strtolower($r->category), ['travels', 'meals', 'supplies'], true))->sum('amount');

            return [
                'period' => $p,
                'label' => $m->translatedFormat('M y'),
                'approved_amount' => $paidAmount,
                'paid_amount' => $paidAmount,
                'submitted_amount' => $submittedAmount,
                'total_count' => $paidCount,
                'all_total_count' => $totalCount,
                'paid_count' => $paidCount,
                'approved_count' => $approvedCount,
                'rejected_count' => $rejectedCount,
                'pending_count' => $pendingCount,
                'approval_rate' => $approvalRate,
                'categories' => [
                    'travels' => $travels,
                    'meals' => $meals,
                    'supplies' => $supplies,
                    'others' => $others,
                ],
            ];
        })->values();

        $currentPoint = $trend->last();
        $currentPaid = (float) ($currentPoint['paid_amount'] ?? 0);
        $currentCount = (int) ($currentPoint['paid_count'] ?? 0);
        $currentRate = (float) ($currentPoint['approval_rate'] ?? 0);
        $avgClaim = $currentCount > 0 ? round($currentPaid / $currentCount, 0) : 0.0;

        return [
            'current_approved_amount' => $currentPaid,
            'current_total_count' => $currentCount,
            'current_approval_rate' => $currentRate,
            'avg_claim_amount' => $avgClaim,
            'trend' => $trend->all(),
        ];
    }

    /**
     * Compute data for the 7 executive strategic questions:
     * 1. Berapa jumlah karyawan aktif?
     * 2. Berapa biaya gaji bulan ini?
     * 3. Apakah absensi membaik?
     * 4. Departemen mana yang kekurangan orang?
     * 5. Siapa yang sering terlambat atau absen?
     * 6. Kontrak siapa yang segera berakhir?
     * 7. Berapa tingkat turnover karyawan?
     */
    private function executiveInsights(int $ownerId, Carbon $periodDate, string|array $period): array
    {
        // 1. Karyawan Aktif
        $totalEmployees = Employee::query()->where('user_id', $ownerId)->count();
        $activeEmployees = Employee::query()->where('user_id', $ownerId)->where('is_active', true)->count();
        $activeRate = $totalEmployees > 0 ? round(($activeEmployees / $totalEmployees) * 100, 1) : 0.0;
        $pkwttCount = Employee::query()->where('user_id', $ownerId)->where('is_active', true)->where('employment_type', 'PKWTT')->count();
        $pkwtCount = Employee::query()->where('user_id', $ownerId)->where('is_active', true)->where('employment_type', 'PKWT')->count();
        $probationCount = Employee::query()->where('user_id', $ownerId)->where('is_active', true)->where('employment_status', 'probation')->count();

        // 2. Biaya Gaji Bulan Ini (Hanya payroll fix: locked / released)
        $months = is_array($period) ? $period['months'] : [$period];
        $latestRun = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->whereIn('period', $months)
            ->where(function ($query) {
                $query->where('is_locked', true)
                    ->orWhere('status', 'released')
                    ->orWhereNotNull('released_at');
            })
            ->latest('generated_at')
            ->first();

        $prevPeriod = $periodDate->copy()->subMonth()->format('Y-m');
        $prevRun = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where('period', $prevPeriod)
            ->where(function ($query) {
                $query->where('is_locked', true)
                    ->orWhere('status', 'released')
                    ->orWhereNotNull('released_at');
            })
            ->latest('generated_at')
            ->first();

        if ($latestRun) {
            $payrollCost = (float) $latestRun->total_net_salary;
            $baseCost = (float) $latestRun->total_base_salary;
            $allowanceCost = (float) $latestRun->total_allowances;
            $isProjected = false;
            $empCount = (int) $latestRun->employees_count;
        } else {
            $payrollCost = 0.0;
            $baseCost = 0.0;
            $allowanceCost = 0.0;
            $isProjected = false;
            $empCount = 0;
        }

        $prevCost = (float) ($prevRun?->total_net_salary ?? 0);
        $payrollGrowth = ($prevCost > 0 && $payrollCost > 0) ? round((($payrollCost - $prevCost) / $prevCost) * 100, 1) : 0.0;
        $avgPerEmp = $empCount > 0 ? round($payrollCost / $empCount, 0) : 0.0;

        // 3. Apakah absensi membaik?
        $isCurrentMonth = is_array($period) ? $period['is_current'] : ($period === now()->format('Y-m'));
        if ($isCurrentMonth) {
            $currStart = now()->subDays(30)->toDateString();
            $currEnd = now()->toDateString();
            $prevStart = now()->subDays(60)->toDateString();
            $prevEnd = now()->subDays(31)->toDateString();
        } else {
            $currStart = is_array($period) ? $period['start_date']->toDateString() : $periodDate->copy()->startOfMonth()->toDateString();
            $currEnd = is_array($period) ? $period['end_date']->toDateString() : $periodDate->copy()->endOfMonth()->toDateString();
            $prevStart = Carbon::parse($currStart)->subDays(30)->toDateString();
            $prevEnd = Carbon::parse($currStart)->subDay()->toDateString();
        }

        $currAtt = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereBetween('attendance_date', [$currStart, $currEnd])
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        $prevAtt = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereBetween('attendance_date', [$prevStart, $prevEnd])
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        $currPresent = (int) ($currAtt['present'] ?? 0);
        $currLate = (int) ($currAtt['late'] ?? 0);
        $currLeave = (int) ($currAtt['on_leave'] ?? 0);
        $currAbsent = (int) ($currAtt['absent'] ?? 0);
        $currTotal = $currPresent + $currLate + $currLeave + $currAbsent;

        $prevPresent = (int) ($prevAtt['present'] ?? 0);
        $prevLate = (int) ($prevAtt['late'] ?? 0);
        $prevLeave = (int) ($prevAtt['on_leave'] ?? 0);
        $prevAbsent = (int) ($prevAtt['absent'] ?? 0);
        $prevTotal = $prevPresent + $prevLate + $prevLeave + $prevAbsent;

        $currAttendanceRate = $currTotal > 0 ? round((($currPresent + $currLate) / $currTotal) * 100, 1) : 0.0;
        $prevAttendanceRate = $prevTotal > 0 ? round((($prevPresent + $prevLate) / $prevTotal) * 100, 1) : 0.0;
        $attendanceDiff = round($currAttendanceRate - $prevAttendanceRate, 1);

        $currLateRate = $currTotal > 0 ? round(($currLate / $currTotal) * 100, 1) : 0.0;
        $prevLateRate = $prevTotal > 0 ? round(($prevLate / $prevTotal) * 100, 1) : 0.0;
        $lateDiff = round($currLateRate - $prevLateRate, 1);

        if ($prevTotal === 0 && $currTotal > 0) {
            $attendanceVerdict = 'stabil';
            $verdictLabel = 'Stabil di '.$currAttendanceRate.'%';
            $verdictBadge = 'success';
        } elseif ($attendanceDiff > 1.0) {
            $attendanceVerdict = 'membaik';
            $verdictLabel = 'Membaik (+'.$attendanceDiff.'%)';
            $verdictBadge = 'success';
        } elseif ($attendanceDiff < -2.0) {
            $attendanceVerdict = 'menurun';
            $verdictLabel = 'Perlu Perhatian ('.$attendanceDiff.'%)';
            $verdictBadge = 'destructive';
        } else {
            $attendanceVerdict = 'stabil';
            $verdictLabel = 'Stabil ('.($attendanceDiff >= 0 ? '+'.$attendanceDiff : $attendanceDiff).'%)';
            $verdictBadge = 'default';
        }

        // 4. Departemen mana yang kekurangan orang?
        $divisions = Division::query()
            ->where('user_id', $ownerId)
            ->withCount(['employees as headcount' => fn ($q) => $q->where('is_active', true)])
            ->get();

        $vacancies = JobVacancy::query()
            ->where('user_id', $ownerId)
            ->where('status', 'published')
            ->selectRaw('division_id, COUNT(*) as vacancies_count, COALESCE(SUM(openings), 0) as openings_count')
            ->groupBy('division_id')
            ->get()
            ->keyBy('division_id');

        $manpowerGaps = ManpowerRequest::query()
            ->where('manpower_requests.user_id', $ownerId)
            ->whereIn('manpower_requests.status', ['open', 'in_progress'])
            ->join('positions', 'manpower_requests.position_id', '=', 'positions.id')
            ->selectRaw('positions.division_id, SUM(manpower_requests.requested_headcount - manpower_requests.fulfilled_headcount) as gap')
            ->groupBy('positions.division_id')
            ->get()
            ->keyBy('division_id');

        $deptShortages = $divisions->map(function (Division $div) use ($vacancies, $manpowerGaps): array {
            $vCount = (int) ($vacancies[$div->id]->vacancies_count ?? 0);
            $oCount = (int) ($vacancies[$div->id]->openings_count ?? 0);
            $mGap = (int) ($manpowerGaps[$div->id]->gap ?? 0);
            $totalGap = $oCount + $mGap;

            return [
                'division_id' => $div->id,
                'name' => $div->name,
                'code' => $div->code,
                'headcount' => (int) $div->headcount,
                'vacancies_count' => $vCount,
                'openings' => $oCount,
                'shortage' => $totalGap,
            ];
        })->sortByDesc('shortage')->values()->all();

        $totalShortage = collect($deptShortages)->sum('shortage');

        // 5. Siapa yang sering terlambat atau absen?
        $topLate = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->where('status', 'late')
            ->selectRaw('employee_id, COUNT(*) as late_count')
            ->groupBy('employee_id')
            ->orderByDesc('late_count')
            ->limit(5)
            ->with(['employee' => fn ($q) => $q->select('id', 'employee_code', 'first_name', 'last_name', 'division_id')->with('division:id,name')])
            ->get()
            ->map(fn ($r) => [
                'id' => $r->employee_id,
                'name' => $r->employee?->full_name ?? 'Karyawan',
                'code' => $r->employee?->employee_code ?? '-',
                'division' => $r->employee?->division?->name ?? '-',
                'count' => (int) $r->late_count,
                'href' => route('hris.attendances.index', ['employee_id' => $r->employee_id, 'status' => 'late']),
            ])->all();

        $topAbsent = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->where('status', 'absent')
            ->selectRaw('employee_id, COUNT(*) as absent_count')
            ->groupBy('employee_id')
            ->orderByDesc('absent_count')
            ->limit(5)
            ->with(['employee' => fn ($q) => $q->select('id', 'employee_code', 'first_name', 'last_name', 'division_id')->with('division:id,name')])
            ->get()
            ->map(fn ($r) => [
                'id' => $r->employee_id,
                'name' => $r->employee?->full_name ?? 'Karyawan',
                'code' => $r->employee?->employee_code ?? '-',
                'division' => $r->employee?->division?->name ?? '-',
                'count' => (int) $r->absent_count,
                'href' => route('hris.attendances.index', ['employee_id' => $r->employee_id, 'status' => 'absent']),
            ])->all();

        // 6. Kontrak siapa yang segera berakhir?
        $contractThreshold = now()->addDays(60)->toDateString();
        $expiringContracts = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->where(function ($q) use ($contractThreshold) {
                $q->where(fn ($sq) => $sq->whereNotNull('contract_end_date')->whereDate('contract_end_date', '<=', $contractThreshold))
                    ->orWhere(fn ($sq) => $sq->whereNotNull('probation_end_date')->whereDate('probation_end_date', '<=', $contractThreshold));
            })
            ->orderByRaw('COALESCE(contract_end_date, probation_end_date) ASC')
            ->limit(10)
            ->with('division:id,name')
            ->get()
            ->map(function (Employee $emp) {
                $isProbation = $emp->employment_status === 'probation' && $emp->probation_end_date !== null;
                $endDate = $isProbation ? $emp->probation_end_date : $emp->contract_end_date;
                $days = now()->diffInDays($endDate, false);

                return [
                    'id' => $emp->id,
                    'name' => $emp->full_name,
                    'code' => $emp->employee_code,
                    'division' => $emp->division?->name ?? '-',
                    'type' => $isProbation ? 'Probation' : ($emp->employment_type ?? 'PKWT'),
                    'end_date' => $endDate?->format('d M Y'),
                    'days_remaining' => (int) $days,
                    'is_urgent' => $days <= 14,
                    'href' => route('hris.employees.index', ['search' => $emp->employee_code]),
                ];
            })->all();

        // 7. Berapa tingkat turnover karyawan?
        $resignedYtd = Employee::query()
            ->where('user_id', $ownerId)
            ->where('employment_status', 'resigned')
            ->whereYear('updated_at', $periodDate->year)
            ->count();

        $turnoverRate = ($activeEmployees + $resignedYtd) > 0
            ? round(($resignedYtd / ($activeEmployees + $resignedYtd)) * 100, 1)
            : 0.0;

        $retentionRate = round(max(100 - $turnoverRate, 0), 1);

        if ($turnoverRate < 5.0) {
            $turnoverStatus = 'healthy';
            $turnoverLabel = 'Sangat Sehat (< 5%)';
        } elseif ($turnoverRate <= 10.0) {
            $turnoverStatus = 'normal';
            $turnoverLabel = 'Normal / Terkendali (5-10%)';
        } else {
            $turnoverStatus = 'warning';
            $turnoverLabel = 'Tinggi / Perlu Perhatian (> 10%)';
        }

        return [
            'active_employees' => [
                'total' => $totalEmployees,
                'active' => $activeEmployees,
                'active_rate' => $activeRate,
                'pkwtt_count' => $pkwttCount,
                'pkwt_count' => $pkwtCount,
                'probation_count' => $probationCount,
                'resigned_count' => $resignedYtd,
            ],
            'payroll_cost' => [
                'total_cost' => $payrollCost,
                'base_cost' => $baseCost,
                'allowance_cost' => $allowanceCost,
                'growth_rate' => $payrollGrowth,
                'avg_per_employee' => $avgPerEmp,
                'is_projected' => $isProjected,
            ],
            'attendance_improvement' => [
                'verdict' => $attendanceVerdict,
                'verdict_label' => $verdictLabel,
                'verdict_badge' => $verdictBadge,
                'attendance_rate' => $currAttendanceRate,
                'prev_attendance_rate' => $prevAttendanceRate,
                'attendance_diff' => $attendanceDiff,
                'late_rate' => $currLateRate,
                'prev_late_rate' => $prevLateRate,
                'late_diff' => $lateDiff,
                'present_count' => $currPresent,
                'late_count' => $currLate,
                'absent_count' => $currAbsent,
            ],
            'department_shortage' => [
                'total_shortage' => $totalShortage,
                'departments' => $deptShortages,
            ],
            'frequent_late_and_absent' => [
                'top_late' => $topLate,
                'top_absent' => $topAbsent,
            ],
            'contract_expiring' => [
                'total_expiring' => count($expiringContracts),
                'items' => $expiringContracts,
            ],
            'turnover_rate' => [
                'rate' => $turnoverRate,
                'status' => $turnoverStatus,
                'status_label' => $turnoverLabel,
                'retention_rate' => $retentionRate,
                'resigned_ytd' => $resignedYtd,
                'active_employees' => $activeEmployees,
            ],
        ];
    }

    /**
     * @return array{
     *     divisions: list<array{id: int, name: string, male: int, female: int, other: int, total: int}>,
     *     overall: array{male: int, female: int, other: int, total: int}
     * }
     */
    private function genderByDivisionData(int $ownerId, string|array|null $period = null): array
    {
        $periodInfo = is_array($period)
            ? $period
            : ($period ? $this->resolvePeriodInfo($ownerId, (string) $period, null) : null);

        $periodLabel = $periodInfo ? $periodInfo['period_label'] : now()->translatedFormat('F Y');

        $rows = Employee::query()
            ->where('employees.user_id', $ownerId)
            ->where('employees.is_active', true)
            ->leftJoin('divisions', 'employees.division_id', '=', 'divisions.id')
            ->selectRaw("
                divisions.id as division_id,
                divisions.name as division_name,
                employees.gender as gender,
                COUNT(*) as total
            ")
            ->groupBy('divisions.id', 'divisions.name', 'employees.gender')
            ->get();

        $divisionsMap = [];
        $overall = ['male' => 0, 'female' => 0, 'other' => 0, 'total' => 0];

        foreach ($rows as $row) {
            $divId = (int) ($row->division_id ?? 0);
            $divName = $row->division_name ? (string) $row->division_name : 'Tanpa Divisi';
            $rawGender = strtolower(trim((string) $row->gender));
            $gender = match ($rawGender) {
                'male', 'm', 'pria', 'laki-laki' => 'male',
                'female', 'f', 'wanita', 'perempuan' => 'female',
                default => 'other',
            };
            $count = (int) $row->total;

            if (!isset($divisionsMap[$divId])) {
                $divisionsMap[$divId] = [
                    'id' => $divId,
                    'name' => $divName,
                    'male' => 0,
                    'female' => 0,
                    'other' => 0,
                    'total' => 0,
                ];
            }

            $divisionsMap[$divId][$gender] += $count;
            $divisionsMap[$divId]['total'] += $count;

            $overall[$gender] += $count;
            $overall['total'] += $count;
        }

        $divisionList = array_values($divisionsMap);
        usort($divisionList, fn ($a, $b) => $b['total'] <=> $a['total']);

        return [
            'divisions' => $divisionList,
            'overall' => $overall,
        ];
    }

    /**
     * @return array{
     *     total: float,
     *     divisions: list<array{id: int, name: string, amount: float, percentage: float, employees_count: int}>,
     *     is_fixed?: boolean,
     *     is_locked?: boolean,
     *     is_released?: boolean
     * }
     */
    /**
     * Resolve the date range [start, end] for a given period based on the company's cutoff settings.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolvePeriodDates(int $ownerId, string $period): array
    {
        $setting = CompanySetting::query()->where('user_id', $ownerId)->first();
        $cutoffDay = $setting?->payroll_cutoff_day ?? 'end_of_month';
        $periodDate = Carbon::createFromFormat('Y-m-d', $period.'-01');

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

    /**
     * Compute payroll breakdown by division from the selected period's PayrollRun.
     * Only fixed payroll (locked or released) enters the chart.
     *
     * @return array{
     *     total: float,
     *     period_label: string,
     *     divisions: list<array{id: int, name: string, amount: float, percentage: float, employees_count: int}>
     * }
     */
    private function payrollByDivisionData(int $ownerId, string|array $period): array
    {
        $periodInfo = is_array($period) ? $period : $this->resolvePeriodInfo($ownerId, (string) $period, null);

        $runs = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->whereIn('period', $periodInfo['months'])
            ->where(function ($query) {
                $query->where('is_locked', true)
                    ->orWhere('status', 'released')
                    ->orWhereNotNull('released_at');
            })
            ->latest('generated_at')
            ->get();

        $periodLabel = $periodInfo['period_label'];

        if ($runs->isNotEmpty()) {
            $runIds = $runs->pluck('id')->all();

            $items = PayrollItem::query()
                ->whereIn('payroll_items.payroll_run_id', $runIds)
                ->join('employees', 'payroll_items.employee_id', '=', 'employees.id')
                ->leftJoin('divisions', 'employees.division_id', '=', 'divisions.id')
                ->selectRaw("
                    divisions.id as division_id,
                    divisions.name as division_name,
                    SUM(payroll_items.net_salary) as total_amount,
                    COUNT(DISTINCT payroll_items.employee_id) as employees_count
                ")
                ->groupBy('divisions.id', 'divisions.name')
                ->orderByDesc('total_amount')
                ->get();

            $total = (float) $items->sum('total_amount');

            $divisions = $items->map(function ($row) use ($total) {
                $amount = (float) $row->total_amount;
                $pct = $total > 0 ? round(($amount / $total) * 100, 1) : 0.0;

                return [
                    'id' => (int) ($row->division_id ?? 0),
                    'name' => $row->division_name ? (string) $row->division_name : 'Tanpa Divisi',
                    'amount' => $amount,
                    'percentage' => $pct,
                    'employees_count' => (int) $row->employees_count,
                ];
            })->values()->all();

            usort($divisions, fn ($a, $b) => $b['amount'] <=> $a['amount']);

            return [
                'total' => $total,
                'period_label' => $periodLabel,
                'divisions' => $divisions,
            ];
        }

        // When payroll is not yet fixed (locked / released), do not display dynamic numbers
        return [
            'total' => 0.0,
            'period_label' => $periodLabel,
            'divisions' => [],
        ];
    }

    /**
     * Compute reimbursement breakdown by category (Meals, Travels, Supplies, Others).
     * Only fixed reimbursements with status 'paid' ('dibayar') enter the chart.
     * Reimbursements are filtered according to company cutoff window.
     *
     * @return array{
     *     total: float,
     *     period_label: string,
     *     categories: list<array{name: string, amount: float, percentage: float, count: int}>
     * }
     */
    private function reimburseByCategoryData(int $ownerId, string|array $period): array
    {
        $periodInfo = is_array($period) ? $period : $this->resolvePeriodInfo($ownerId, (string) $period, null);

        $periodLabel = $periodInfo['period_label'];
        $startStr = $periodInfo['start_date']->copy()->startOfDay()->toDateTimeString();
        $endStr = $periodInfo['end_date']->copy()->endOfDay()->toDateTimeString();

        $items = ReimbursementRequest::query()
            ->where('reimbursement_requests.user_id', $ownerId)
            ->where('reimbursement_requests.status', 'paid')
            ->where(function ($q) use ($startStr, $endStr) {
                $q->whereRaw("COALESCE(reimbursement_requests.processed_at, reimbursement_requests.approved_at, reimbursement_requests.created_at) BETWEEN ? AND ?", [$startStr, $endStr]);
            })
            ->selectRaw("
                category,
                SUM(amount) as total_amount,
                COUNT(id) as count
            ")
            ->groupBy('category')
            ->get();

        $categoryMap = [];
        $total = 0.0;

        foreach ($items as $item) {
            $cat = trim((string) $item->category);
            $catName = $cat !== '' ? $cat : 'Others';
            $key = strtolower($catName);
            $amount = (float) $item->total_amount;
            $count = (int) $item->count;

            $total += $amount;

            if (! isset($categoryMap[$key])) {
                $categoryMap[$key] = [
                    'name' => $catName,
                    'total_amount' => 0.0,
                    'count' => 0,
                ];
            }
            $categoryMap[$key]['total_amount'] += $amount;
            $categoryMap[$key]['count'] += $count;
        }

        $defaultCategories = ['Meals', 'Travels', 'Supplies', 'Others'];
        $resultList = collect();
        $seen = [];

        foreach ($defaultCategories as $catName) {
            $key = strtolower($catName);
            $seen[$key] = true;
            $row = $categoryMap[$key] ?? null;
            $amount = $row ? (float) $row['total_amount'] : 0.0;
            $count = $row ? (int) $row['count'] : 0;
            $pct = $total > 0 ? round(($amount / $total) * 100, 1) : 0.0;

            $resultList->push([
                'name' => $catName,
                'amount' => $amount,
                'percentage' => $pct,
                'count' => $count,
            ]);
        }

        foreach ($categoryMap as $key => $row) {
            if (! isset($seen[$key])) {
                $amount = (float) $row['total_amount'];
                $pct = $total > 0 ? round(($amount / $total) * 100, 1) : 0.0;
                $resultList->push([
                    'name' => (string) $row['name'],
                    'amount' => $amount,
                    'percentage' => $pct,
                    'count' => (int) $row['count'],
                ]);
            }
        }

        $sortedCategories = $resultList->sortByDesc('amount')->values()->all();

        return [
            'total' => $total,
            'period_label' => $periodLabel,
            'categories' => $sortedCategories,
        ];
    }

    /**
     * @return array{
     *     total: float,
     *     period_label: string,
     *     divisions: list<array{id: int, name: string, amount: float, percentage: float, count: int}>
     * }
     */
    private function reimburseByDivisionData(int $ownerId, string|array $period): array
    {
        $periodInfo = is_array($period) ? $period : $this->resolvePeriodInfo($ownerId, (string) $period, null);

        $periodLabel = $periodInfo['period_label'];
        $startStr = $periodInfo['start_date']->copy()->startOfDay()->toDateTimeString();
        $endStr = $periodInfo['end_date']->copy()->endOfDay()->toDateTimeString();

        $items = ReimbursementRequest::query()
            ->where('reimbursement_requests.user_id', $ownerId)
            ->where('reimbursement_requests.status', 'paid')
            ->join('employees', 'reimbursement_requests.employee_id', '=', 'employees.id')
            ->leftJoin('divisions', 'employees.division_id', '=', 'divisions.id')
            ->where(function ($q) use ($startStr, $endStr) {
                $q->whereRaw("COALESCE(reimbursement_requests.processed_at, reimbursement_requests.approved_at, reimbursement_requests.created_at) BETWEEN ? AND ?", [$startStr, $endStr]);
            })
            ->selectRaw("
                divisions.id as division_id,
                divisions.name as division_name,
                SUM(reimbursement_requests.amount) as total_amount,
                COUNT(reimbursement_requests.id) as count
            ")
            ->groupBy('divisions.id', 'divisions.name')
            ->orderByDesc('total_amount')
            ->get();

        $total = (float) $items->sum('total_amount');

        $divisions = $items->map(function ($row) use ($total) {
            $amount = (float) $row->total_amount;
            $pct = $total > 0 ? round(($amount / $total) * 100, 1) : 0.0;

            return [
                'id' => (int) ($row->division_id ?? 0),
                'name' => $row->division_name ? (string) $row->division_name : 'Tanpa Divisi',
                'amount' => $amount,
                'percentage' => $pct,
                'count' => (int) $row->count,
            ];
        })->values()->all();

        return [
            'total' => $total,
            'period_label' => $periodLabel,
            'divisions' => $divisions,
        ];
    }

    /**
     * @return array{
     *     total: int,
     *     period_label: string,
     *     reasons: list<array{key: string, label: string, count: int, percentage: float}>
     * }
     */
    private function resignReasonsData(int $ownerId, Carbon|string|array $periodOrDate): array
    {
        if (is_array($periodOrDate)) {
            $periodInfo = $periodOrDate;
        } elseif ($periodOrDate instanceof Carbon) {
            $periodInfo = $this->resolvePeriodInfo($ownerId, $periodOrDate->format('Y-m'), 'month');
        } else {
            $periodInfo = $this->resolvePeriodInfo($ownerId, (string) $periodOrDate, null);
        }

        $periodLabel = $periodInfo['period_label'];
        $startStr = $periodInfo['start_date']->toDateString();
        $endStr = $periodInfo['end_date']->toDateString();

        $raw = Employee::query()
            ->where('user_id', $ownerId)
            ->where(function ($q) {
                $q->where('employment_status', 'resigned')
                    ->orWhereNotNull('offboarded_at')
                    ->orWhereNotNull('offboarding_reason');
            })
            ->where(function ($q) use ($startStr, $endStr) {
                $q->whereBetween('offboarded_at', [$startStr, $endStr])
                    ->orWhere(function ($sub) use ($startStr, $endStr) {
                        $sub->whereNull('offboarded_at')
                            ->whereBetween('updated_at', [$startStr . ' 00:00:00', $endStr . ' 23:59:59']);
                    });
            })
            ->selectRaw("offboarding_reason, COUNT(*) as count")
            ->groupBy('offboarding_reason')
            ->get();

        $labels = [
            'resigned' => 'Mengundurkan Diri',
            'contract_ended' => 'Kontrak Berakhir',
            'terminated' => 'Diberhentikan',
            'retired' => 'Pensiun',
            'other' => 'Lainnya',
        ];

        $countsByReason = [];
        $total = 0;

        foreach ($raw as $row) {
            $reasonRaw = trim((string) $row->offboarding_reason);
            $reasonKey = $reasonRaw !== '' ? $reasonRaw : 'resigned';
            $count = (int) $row->count;
            $countsByReason[$reasonKey] = ($countsByReason[$reasonKey] ?? 0) + $count;
            $total += $count;
        }

        $reasons = [];
        foreach ($countsByReason as $key => $count) {
            $label = $labels[$key] ?? (ucfirst(str_replace('_', ' ', $key)));
            $reasons[] = [
                'key' => $key,
                'label' => $label,
                'count' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0.0,
            ];
        }

        if (empty($reasons)) {
            $reasons = [
                ['key' => 'resigned', 'label' => 'Mengundurkan Diri', 'count' => 0, 'percentage' => 0.0],
                ['key' => 'contract_ended', 'label' => 'Kontrak Berakhir', 'count' => 0, 'percentage' => 0.0],
                ['key' => 'terminated', 'label' => 'Diberhentikan', 'count' => 0, 'percentage' => 0.0],
            ];
        }

        usort($reasons, fn ($a, $b) => $b['count'] <=> $a['count']);

        return [
            'total' => $total,
            'reasons' => $reasons,
        ];
    }
}
