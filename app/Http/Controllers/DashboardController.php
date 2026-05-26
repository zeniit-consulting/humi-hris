<?php

namespace App\Http\Controllers;

use App\Models\AttendanceCorrectionRequest;
use App\Models\ClientInvoice;
use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeBankAccount;
use App\Models\EmployeeDocument;
use App\Models\EmployeeSchedule;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\ManpowerRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\ShiftChangeRequest;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
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
            'range' => ['nullable', 'in:today,this_week,this_month'],
            'outsourcing_period' => ['nullable', 'date_format:Y-m'],
            'outsourcing_sub_company_id' => ['nullable', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
        ]);

        $activeRange = $validated['range'] ?? 'this_week';
        $outsourcingPeriod = $validated['outsourcing_period'] ?? now()->format('Y-m');
        $outsourcingSubCompanyId = $validated['outsourcing_sub_company_id'] ?? null;
        $today = Carbon::today();
        $startDate = match ($activeRange) {
            'today' => $today->copy(),
            'this_month' => $today->copy()->startOfMonth(),
            default => $today->copy()->startOfWeek(),
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
            ->where('period', $today->format('Y-m'))
            ->latest('generated_at')
            ->value('total_net_salary') ?? 0);

        $resignedYtd = Employee::query()
            ->where('employment_status', 'resigned')
            ->whereYear('updated_at', $today->year)
            ->count();

        $attritionYtd = ($activeEmployees + $resignedYtd) > 0
            ? round(($resignedYtd / ($activeEmployees + $resignedYtd)) * 100, 1)
            : 0;

        $todayAttendance = EmployeeAttendance::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereDate('attendance_date', $today)
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

        $dailyRaw = EmployeeAttendance::query()
            ->selectRaw('attendance_date, status, COUNT(*) as total')
            ->whereBetween('attendance_date', [$startDate->toDateString(), $today->toDateString()])
            ->groupBy('attendance_date', 'status')
            ->orderBy('attendance_date')
            ->get();

        $dailyGrouped = $dailyRaw->groupBy(
            fn (EmployeeAttendance $attendance) => $attendance->attendance_date->toDateString()
        );

        $dates = collect();
        $cursor = $startDate->copy();

        while ($cursor->lte($today)) {
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
                'range' => $activeRange,
                'outsourcing_period' => $outsourcingPeriod,
                'outsourcing_sub_company_id' => $outsourcingSubCompanyId ? (string) $outsourcingSubCompanyId : '',
            ],
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
            ],
            'attendanceChart' => $attendanceChart,
            'actionQueue' => $this->actionQueue($ownerId, $today),
            'attendanceFocus' => $this->attendanceFocus($ownerId, $today),
            'recentRequests' => $this->recentRequests($ownerId),
            'payrollReadiness' => $this->payrollReadiness($ownerId, $today),
            'onboardingChecklist' => $this->onboardingChecklist($ownerId),
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

    private function attendanceFocus(int $ownerId, Carbon $today): array
    {
        $todayDate = $today->toDateString();

        $attendedEmployeeIds = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereDate('attendance_date', $todayDate)
            ->pluck('employee_id');

        $missingClockIns = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->whereNotIn('id', $attendedEmployeeIds)
            ->orderBy('first_name')
            ->limit(6)
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'sub_company_id'])
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
                'href' => route('hris.attendances.index', ['date' => $todayDate, 'employee_id' => $employee->id]),
            ]);

        $lateToday = EmployeeAttendance::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->whereDate('attendance_date', $todayDate)
            ->where('status', 'late')
            ->orderBy('check_in_at')
            ->limit(6)
            ->get()
            ->map(fn (EmployeeAttendance $attendance): array => [
                'id' => $attendance->id,
                'label' => $attendance->employee
                    ? $attendance->employee->employee_code.' - '.$attendance->employee->full_name
                    : 'Karyawan',
                'time' => $attendance->check_in_at?->format('H:i') ?? '-',
                'href' => route('hris.attendances.index', ['date' => $todayDate, 'employee_id' => $attendance->employee_id]),
            ]);

        return [
            'missing_clock_ins_count' => Employee::query()
                ->where('user_id', $ownerId)
                ->where('is_active', true)
                ->whereNotIn('id', $attendedEmployeeIds)
                ->count(),
            'late_today_count' => EmployeeAttendance::query()
                ->where('user_id', $ownerId)
                ->whereDate('attendance_date', $todayDate)
                ->where('status', 'late')
                ->count(),
            'missingClockIns' => $missingClockIns,
            'lateToday' => $lateToday,
        ];
    }

    private function recentRequests(int $ownerId): array
    {
        $items = collect()
            ->merge($this->recentAttendanceRequests($ownerId))
            ->merge($this->recentLeaveRequests($ownerId))
            ->merge($this->recentOvertimeRequests($ownerId))
            ->merge($this->recentShiftChangeRequests($ownerId))
            ->sortByDesc('created_at')
            ->take(8)
            ->values();

        return [
            'items' => $items->map(fn (array $item): array => [
                ...$item,
                'created_at' => $item['created_at']?->diffForHumans(),
            ]),
        ];
    }

    private function recentAttendanceRequests(int $ownerId): array
    {
        return AttendanceCorrectionRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->latest()
            ->limit(5)
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

    private function recentLeaveRequests(int $ownerId): array
    {
        return LeaveRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->latest()
            ->limit(5)
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

    private function recentOvertimeRequests(int $ownerId): array
    {
        return OvertimeRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->latest()
            ->limit(5)
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

    private function recentShiftChangeRequests(int $ownerId): array
    {
        return ShiftChangeRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->latest()
            ->limit(5)
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

    private function payrollReadiness(int $ownerId, Carbon $today): array
    {
        $period = $today->format('Y-m');
        $activeEmployees = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->count();
        $employeesWithBank = EmployeeBankAccount::query()
            ->where('user_id', $ownerId)
            ->where('is_primary', true)
            ->whereHas('employee', fn ($query) => $query->where('is_active', true))
            ->distinct('employee_id')
            ->count('employee_id');
        $missingBankAccounts = max($activeEmployees - $employeesWithBank, 0);
        $pendingApprovals = AttendanceCorrectionRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count()
            + LeaveRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count()
            + OvertimeRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count()
            + ShiftChangeRequest::query()->where('user_id', $ownerId)->where('status', 'pending')->count();
        $run = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->where('type', 'regular')
            ->latest('generated_at')
            ->first();

        $checks = [
            [
                'key' => 'employees',
                'label' => 'Karyawan aktif tersedia',
                'complete' => $activeEmployees > 0,
                'description' => $activeEmployees.' karyawan aktif',
                'href' => route('hris.employees.index'),
            ],
            [
                'key' => 'bank_accounts',
                'label' => 'Rekening utama lengkap',
                'complete' => $activeEmployees > 0 && $missingBankAccounts === 0,
                'description' => $missingBankAccounts === 0 ? 'Semua karyawan aktif punya rekening utama' : $missingBankAccounts.' karyawan belum punya rekening utama',
                'href' => route('hris.employees.index'),
            ],
            [
                'key' => 'approvals',
                'label' => 'Approval payroll bersih',
                'complete' => $pendingApprovals === 0,
                'description' => $pendingApprovals === 0 ? 'Tidak ada approval pending' : $pendingApprovals.' approval masih pending',
                'href' => route('hris.attendance-approvals.index'),
            ],
            [
                'key' => 'payroll_run',
                'label' => 'Payroll bulan ini',
                'complete' => (bool) $run?->is_saved,
                'description' => $run ? ($run->is_saved ? 'Payroll sudah disimpan' : 'Payroll sudah digenerate, belum disimpan') : 'Payroll belum digenerate',
                'href' => route('hris.payrolls.index'),
            ],
        ];

        $completed = collect($checks)->where('complete', true)->count();

        return [
            'period' => $period,
            'score' => (int) round(($completed / count($checks)) * 100),
            'status' => $run?->is_saved ? 'saved' : ($run ? 'generated' : 'not_generated'),
            'checks' => $checks,
        ];
    }

    private function onboardingChecklist(int $ownerId): array
    {
        $company = CompanySetting::query()->where('user_id', $ownerId)->first();

        $items = [
            [
                'key' => 'company_profile',
                'label' => 'Profil perusahaan',
                'complete' => (bool) ($company && $company->name && $company->name !== 'Perusahaan'),
                'href' => route('profile.edit'),
            ],
            [
                'key' => 'attendance_location',
                'label' => 'Lokasi absensi',
                'complete' => (bool) ($company?->location_latitude && $company?->location_longitude),
                'href' => route('profile.edit'),
            ],
            [
                'key' => 'divisions',
                'label' => 'Divisi',
                'complete' => Division::query()->where('user_id', $ownerId)->exists(),
                'href' => route('hris.employees.master-data'),
            ],
            [
                'key' => 'positions',
                'label' => 'Jabatan',
                'complete' => Position::query()->where('user_id', $ownerId)->exists(),
                'href' => route('hris.employees.master-data'),
            ],
            [
                'key' => 'employees',
                'label' => 'Karyawan',
                'complete' => Employee::query()->where('user_id', $ownerId)->exists(),
                'href' => route('hris.employees.index'),
            ],
            [
                'key' => 'work_shifts',
                'label' => 'Shift kerja',
                'complete' => WorkShift::query()->where('user_id', $ownerId)->exists(),
                'href' => route('hris.schedules.index'),
            ],
            [
                'key' => 'schedules',
                'label' => 'Jadwal kerja',
                'complete' => EmployeeSchedule::query()->where('user_id', $ownerId)->exists(),
                'href' => route('hris.schedules.index'),
            ],
        ];

        $completed = collect($items)->where('complete', true)->count();

        return [
            'completed' => $completed,
            'total' => count($items),
            'percent' => (int) round(($completed / count($items)) * 100),
            'items' => $items,
        ];
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
}
