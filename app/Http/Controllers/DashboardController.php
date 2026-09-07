<?php

namespace App\Http\Controllers;

use App\Models\AttendanceCorrectionRequest;
use App\Models\ClientInvoice;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\ManpowerRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollRun;
use App\Models\Position;
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

        if ($user->role === 'user') {
            return redirect()->to(RoleRedirect::for($user));
        }

        $ownerId = $user->accountOwnerId();

        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
            'range' => ['nullable', 'in:today,this_week,this_month'],
            'outsourcing_period' => ['nullable', 'date_format:Y-m'],
            'outsourcing_sub_company_id' => ['nullable', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
        ]);

        $period = $validated['period'] ?? $validated['outsourcing_period'] ?? now()->format('Y-m');
        $activeRange = $validated['range'] ?? 'this_week';
        $outsourcingPeriod = $validated['outsourcing_period'] ?? $period;
        $outsourcingSubCompanyId = $validated['outsourcing_sub_company_id'] ?? null;
        $today = Carbon::today();
        $periodDate = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
        $isCurrentPeriod = $period === now()->format('Y-m');

        // Determine reference date for daily attendance and chart
        $referenceDate = $isCurrentPeriod ? $today->copy() : $periodDate->copy()->endOfMonth();

        $startDate = match ($activeRange) {
            'today' => $referenceDate->copy(),
            'this_month' => $periodDate->copy()->startOfMonth(),
            default => $isCurrentPeriod ? $today->copy()->startOfWeek() : $periodDate->copy()->startOfMonth(),
        };

        $chartEndDate = match ($activeRange) {
            'today' => $referenceDate->copy(),
            'this_month' => $periodDate->copy()->endOfMonth(),
            default => $isCurrentPeriod ? $today->copy() : $periodDate->copy()->endOfMonth(),
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
            ->where('period', $period)
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

        $genderStats = Employee::query()
            ->where('is_active', true)
            ->selectRaw("COALESCE(NULLIF(gender, ''), 'unknown') as gender, COUNT(*) as total")
            ->groupBy('gender')
            ->pluck('total', 'gender')
            ->map(fn ($total): int => (int) $total)
            ->all();

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
            $cursor->addDay();
        }

        $attendanceChart = $dates->map(function (Carbon $date) use ($dailyGrouped, $activeEmployees) {
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
                'range' => $activeRange,
                'outsourcing_period' => $outsourcingPeriod,
                'outsourcing_sub_company_id' => $outsourcingSubCompanyId ? (string) $outsourcingSubCompanyId : '',
            ],
            'availablePeriods' => $this->availablePeriods($ownerId),
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
            'actionQueue' => $this->actionQueue($ownerId, $today),
            'attendanceFocus' => $this->attendanceFocus($ownerId, $referenceDate, $period),
            'recentRequests' => $this->recentRequests($ownerId, $period),
            'contractReminders' => $this->contractReminders($ownerId, $periodDate),
            'outsourcing' => $this->outsourcingSummary(
                $ownerId,
                $outsourcingPeriod,
                $outsourcingSubCompanyId,
                $today,
            ),
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

    private function attendanceFocus(int $ownerId, Carbon $referenceDate, string $period): array
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

        if ($period === now()->format('Y-m')) {
            $lateAttendanceQuery->whereDate('attendance_date', $targetDate);
        } else {
            $lateAttendanceQuery->whereBetween('attendance_date', [
                Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString(),
                Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString(),
            ]);
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

    private function recentRequests(int $ownerId, string $period): array
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

    private function recentAttendanceRequests(int $ownerId, string $period): array
    {
        $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
        $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();

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

    private function recentLeaveRequests(int $ownerId, string $period): array
    {
        $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
        $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();

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

    private function recentOvertimeRequests(int $ownerId, string $period): array
    {
        $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
        $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();

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

    private function recentShiftChangeRequests(int $ownerId, string $period): array
    {
        $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth()->toDateString();
        $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth()->toDateString();

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

        $allPeriods = collect([now()->format('Y-m')])
            ->merge($attendancePeriods)
            ->merge($payrollPeriods)
            ->merge($leavePeriods)
            ->merge($overtimePeriods)
            ->filter(fn ($p) => is_string($p) && preg_match('/^\d{4}-\d{2}$/', $p))
            ->unique()
            ->sortDesc()
            ->values();

        return $allPeriods->map(fn (string $periodVal): array => [
            'value' => $periodVal,
            'label' => Carbon::createFromFormat('Y-m', $periodVal)->translatedFormat('F Y'),
        ])->all();
    }
}
