<?php

namespace App\Services;

use App\Models\CompanyAssetAssignment;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\EmployeeLeaveBalance;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\PerformanceReview;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class MonthlyReportService
{
    /**
     * @return array<string, mixed>
     */
    public function build(int $ownerId, int $month, int $year): array
    {
        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth();
        $periodKey = $start->format('Y-m');

        $employees = Employee::query()
            ->where('user_id', $ownerId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get([
                'id',
                'employee_code',
                'first_name',
                'last_name',
                'hire_date',
                'offboarded_at',
                'employment_status',
                'is_active',
            ]);

        $attendanceRows = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])
            ->get(['employee_id', 'status']);

        $leaveRows = LeaveRequest::query()
            ->where('user_id', $ownerId)
            ->whereDate('start_date', '<=', $end->toDateString())
            ->whereDate('end_date', '>=', $start->toDateString())
            ->get(['employee_id', 'status', 'total_days']);

        $overtimeRows = OvertimeRequest::query()
            ->where('user_id', $ownerId)
            ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()])
            ->get(['employee_id', 'status', 'total_hours']);

        $payrollRuns = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where('period', $periodKey)
            ->get(['id', 'employees_count', 'total_base_salary', 'total_allowances', 'total_deductions', 'total_net_salary']);

        $payrollItems = $payrollRuns->isEmpty()
            ? collect()
            : PayrollItem::query()
                ->where('user_id', $ownerId)
                ->whereIn('payroll_run_id', $payrollRuns->pluck('id'))
                ->get([
                    'employee_id',
                    'base_salary',
                    'allowances_total',
                    'overtime_hours',
                    'overtime_pay',
                    'deductions_total',
                    'net_salary',
                ]);

        $leaveBalances = EmployeeLeaveBalance::query()
            ->where('user_id', $ownerId)
            ->where('year', $year)
            ->get(['employee_id', 'leave_type', 'accrued_days', 'used_days', 'adjusted_days']);

        $performanceDetails = $this->performanceDetails($ownerId, $start, $end);
        $recruitmentDetails = $this->recruitmentDetails($ownerId, $start, $end);

        $summary = [
            'active_employees' => $employees->where('is_active', true)->count(),
            'attendance' => $this->attendanceSummary($attendanceRows),
            'leave' => [
                'approved_days' => round((float) $leaveRows->where('status', 'approved')->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
                'pending_days' => round((float) $leaveRows->where('status', 'pending')->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
                'rejected_days' => round((float) $leaveRows->where('status', 'rejected')->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
            ],
            'overtime' => [
                'approved_hours' => round((float) $overtimeRows->where('status', 'approved')->sum(fn (OvertimeRequest $overtime) => (float) $overtime->total_hours), 2),
            ],
            'payroll' => [
                'runs_count' => $payrollRuns->count(),
                'employees_count' => (int) $payrollRuns->sum('employees_count'),
                'base_salary' => $this->money($payrollRuns->sum('total_base_salary')),
                'allowances' => $this->money($payrollRuns->sum('total_allowances')),
                'deductions' => $this->money($payrollRuns->sum('total_deductions')),
                'net_salary' => $this->money($payrollRuns->sum('total_net_salary')),
            ],
        ];

        return [
            'company' => $this->company($ownerId),
            'period' => [
                'key' => $periodKey,
                'month' => $month,
                'year' => $year,
                'label' => $start->locale('id')->translatedFormat('F Y'),
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'start_label' => $start->locale('id')->translatedFormat('j F Y'),
                'end_label' => $end->locale('id')->translatedFormat('j F Y'),
            ],
            'summary' => $summary,
            'employees' => $this->employeeRows($employees, $attendanceRows, $leaveRows->where('status', 'approved'), $overtimeRows->where('status', 'approved'), $payrollItems),
            'attendanceDetails' => $this->attendanceDetails($employees, $attendanceRows),
            'payrollDetails' => $this->payrollDetails($employees, $payrollItems),
            'leaveDetails' => $this->leaveDetails($employees, $leaveRows, $leaveBalances),
            'overtimeDetails' => $this->overtimeDetails($employees, $overtimeRows),
            'employeeMovementDetails' => $this->employeeMovementDetails($employees, $start, $end),
            'documentExpiryDetails' => $this->documentExpiryDetails($ownerId, $start, $end),
            'assetAssignmentDetails' => $this->assetAssignmentDetails($ownerId, $start, $end),
            'performanceDetails' => $performanceDetails,
            'recruitmentDetails' => $recruitmentDetails,
            'analytics' => $this->analytics($summary, $performanceDetails, $recruitmentDetails),
        ];
    }

    /**
     * @return array{name: string, details: string}
     */
    private function company(int $ownerId): array
    {
        $company = CompanySetting::query()
            ->where('user_id', $ownerId)
            ->first();

        return [
            'name' => $company?->name ?: 'Perusahaan',
            'details' => $company?->details ?: '-',
        ];
    }

    /**
     * @param  Collection<int, EmployeeAttendance>  $rows
     * @return array<string, int>
     */
    private function attendanceSummary(Collection $rows): array
    {
        $counts = $rows->countBy('status');

        return [
            'present' => (int) ($counts['present'] ?? 0),
            'late' => (int) ($counts['late'] ?? 0),
            'on_leave' => (int) ($counts['on_leave'] ?? 0),
            'absent' => (int) ($counts['absent'] ?? 0),
        ];
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @param  Collection<int, EmployeeAttendance>  $attendanceRows
     * @param  Collection<int, LeaveRequest>  $leaveRows
     * @param  Collection<int, OvertimeRequest>  $overtimeRows
     * @param  Collection<int, PayrollItem>  $payrollItems
     * @return array<int, array<string, mixed>>
     */
    private function employeeRows(Collection $employees, Collection $attendanceRows, Collection $leaveRows, Collection $overtimeRows, Collection $payrollItems): array
    {
        $attendancesByEmployee = $attendanceRows->groupBy('employee_id');
        $leavesByEmployee = $leaveRows->groupBy('employee_id');
        $overtimesByEmployee = $overtimeRows->groupBy('employee_id');
        $payrollByEmployee = $payrollItems->groupBy('employee_id');

        return $employees
            ->map(function (Employee $employee) use ($attendancesByEmployee, $leavesByEmployee, $overtimesByEmployee, $payrollByEmployee): array {
                $attendanceCounts = $this->attendanceSummary($attendancesByEmployee->get($employee->id, collect()));

                return [
                    'id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'employee_name' => $employee->full_name,
                    'is_active' => $employee->is_active,
                    'present_count' => $attendanceCounts['present'],
                    'late_count' => $attendanceCounts['late'],
                    'on_leave_count' => $attendanceCounts['on_leave'],
                    'absent_count' => $attendanceCounts['absent'],
                    'leave_days' => round((float) $leavesByEmployee->get($employee->id, collect())->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
                    'overtime_hours' => round((float) $overtimesByEmployee->get($employee->id, collect())->sum(fn (OvertimeRequest $overtime) => (float) $overtime->total_hours), 2),
                    'net_salary' => $this->money($payrollByEmployee->get($employee->id, collect())->sum('net_salary')),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @param  Collection<int, EmployeeAttendance>  $attendanceRows
     * @return array<int, array<string, mixed>>
     */
    private function attendanceDetails(Collection $employees, Collection $attendanceRows): array
    {
        $attendancesByEmployee = $attendanceRows->groupBy('employee_id');

        return $employees
            ->map(function (Employee $employee) use ($attendancesByEmployee): array {
                $rows = $attendancesByEmployee->get($employee->id, collect());
                $attendanceCounts = $this->attendanceSummary($rows);

                return [
                    'employee_id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'employee_name' => $employee->full_name,
                    'recorded_days' => $rows->count(),
                    'present_count' => $attendanceCounts['present'],
                    'late_count' => $attendanceCounts['late'],
                    'on_leave_count' => $attendanceCounts['on_leave'],
                    'absent_count' => $attendanceCounts['absent'],
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @param  Collection<int, PayrollItem>  $payrollItems
     * @return array<int, array<string, mixed>>
     */
    private function payrollDetails(Collection $employees, Collection $payrollItems): array
    {
        $employeesById = $employees->keyBy('id');

        return $payrollItems
            ->groupBy('employee_id')
            ->map(function (Collection $items, int $employeeId) use ($employeesById): ?array {
                $employee = $employeesById->get($employeeId);

                if (! $employee) {
                    return null;
                }

                return [
                    'employee_id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'employee_name' => $employee->full_name,
                    'base_salary' => $this->money($items->sum('base_salary')),
                    'allowances_total' => $this->money($items->sum('allowances_total')),
                    'overtime_hours' => round((float) $items->sum('overtime_hours'), 2),
                    'overtime_pay' => $this->money($items->sum('overtime_pay')),
                    'deductions_total' => $this->money($items->sum('deductions_total')),
                    'net_salary' => $this->money($items->sum('net_salary')),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @param  Collection<int, LeaveRequest>  $leaveRows
     * @param  Collection<int, EmployeeLeaveBalance>  $leaveBalances
     * @return array<int, array<string, mixed>>
     */
    private function leaveDetails(Collection $employees, Collection $leaveRows, Collection $leaveBalances): array
    {
        $leavesByEmployee = $leaveRows->groupBy('employee_id');
        $balancesByEmployee = $leaveBalances->groupBy('employee_id');

        return $employees
            ->map(function (Employee $employee) use ($leavesByEmployee, $balancesByEmployee): array {
                $leaves = $leavesByEmployee->get($employee->id, collect());
                $balances = $balancesByEmployee->get($employee->id, collect());

                return [
                    'employee_id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'employee_name' => $employee->full_name,
                    'approved_days' => round((float) $leaves->where('status', 'approved')->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
                    'pending_days' => round((float) $leaves->where('status', 'pending')->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
                    'rejected_days' => round((float) $leaves->where('status', 'rejected')->sum(fn (LeaveRequest $leave) => (float) $leave->total_days), 2),
                    'remaining_balance' => round((float) $balances->sum(fn (EmployeeLeaveBalance $balance) => $balance->remainingBalance()), 2),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @param  Collection<int, OvertimeRequest>  $overtimeRows
     * @return array<int, array<string, mixed>>
     */
    private function overtimeDetails(Collection $employees, Collection $overtimeRows): array
    {
        $overtimesByEmployee = $overtimeRows->groupBy('employee_id');

        return $employees
            ->map(function (Employee $employee) use ($overtimesByEmployee): array {
                $overtimes = $overtimesByEmployee->get($employee->id, collect());

                return [
                    'employee_id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'employee_name' => $employee->full_name,
                    'approved_requests' => $overtimes->where('status', 'approved')->count(),
                    'pending_requests' => $overtimes->where('status', 'pending')->count(),
                    'rejected_requests' => $overtimes->where('status', 'rejected')->count(),
                    'approved_hours' => round((float) $overtimes->where('status', 'approved')->sum(fn (OvertimeRequest $overtime) => (float) $overtime->total_hours), 2),
                    'pending_hours' => round((float) $overtimes->where('status', 'pending')->sum(fn (OvertimeRequest $overtime) => (float) $overtime->total_hours), 2),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @return array<string, mixed>
     */
    private function employeeMovementDetails(Collection $employees, Carbon $start, Carbon $end): array
    {
        $joiners = $employees
            ->filter(fn (Employee $employee): bool => $employee->hire_date?->betweenIncluded($start, $end) ?? false)
            ->map(fn (Employee $employee): array => $this->employeeMovementRow($employee, 'joiner'))
            ->values()
            ->all();

        $offboarded = $employees
            ->filter(fn (Employee $employee): bool => $employee->offboarded_at?->betweenIncluded($start, $end) ?? false)
            ->map(fn (Employee $employee): array => $this->employeeMovementRow($employee, 'offboarded'))
            ->values()
            ->all();

        return [
            'summary' => [
                'joiners' => count($joiners),
                'offboarded' => count($offboarded),
                'active_headcount' => $employees->where('is_active', true)->count(),
            ],
            'joiners' => $joiners,
            'offboarded' => $offboarded,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function employeeMovementRow(Employee $employee, string $movementType): array
    {
        return [
            'employee_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'employee_name' => $employee->full_name,
            'movement_type' => $movementType,
            'hire_date' => $employee->hire_date?->toDateString(),
            'offboarded_at' => $employee->offboarded_at?->toDateString(),
            'employment_status' => $employee->employment_status,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function documentExpiryDetails(int $ownerId, Carbon $start, Carbon $end): array
    {
        $warningEnd = $end->copy()->addDays(30);

        return EmployeeDocument::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '<=', $warningEnd->toDateString())
            ->orderBy('expires_at')
            ->get(['id', 'employee_id', 'document_type', 'document_number', 'expires_at'])
            ->map(fn (EmployeeDocument $document): array => [
                'id' => $document->id,
                'employee_id' => $document->employee_id,
                'employee_code' => $document->employee?->employee_code ?? '-',
                'employee_name' => $document->employee?->full_name ?? '-',
                'document_type' => $document->document_type,
                'document_number' => $document->document_number,
                'expires_at' => $document->expires_at?->toDateString(),
                'status' => $document->expires_at && $document->expires_at->lte($end) ? 'expired' : 'expiring',
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function assetAssignmentDetails(int $ownerId, Carbon $start, Carbon $end): array
    {
        return CompanyAssetAssignment::query()
            ->with([
                'asset:id,asset_code,name,category,condition,status',
                'employee:id,employee_code,first_name,last_name',
            ])
            ->where('user_id', $ownerId)
            ->whereDate('issued_at', '<=', $end->toDateString())
            ->where(fn ($query) => $query
                ->whereNull('returned_at')
                ->orWhereDate('returned_at', '>=', $start->toDateString()))
            ->orderByRaw('returned_at IS NOT NULL')
            ->orderBy('issued_at')
            ->get(['id', 'company_asset_id', 'employee_id', 'issued_at', 'returned_at', 'condition_out', 'condition_in'])
            ->map(fn (CompanyAssetAssignment $assignment): array => [
                'id' => $assignment->id,
                'asset_code' => $assignment->asset?->asset_code ?? '-',
                'asset_name' => $assignment->asset?->name ?? '-',
                'asset_category' => $assignment->asset?->category ?? '-',
                'employee_id' => $assignment->employee_id,
                'employee_code' => $assignment->employee?->employee_code ?? '-',
                'employee_name' => $assignment->employee?->full_name ?? '-',
                'issued_at' => $assignment->issued_at?->toDateString(),
                'returned_at' => $assignment->returned_at?->toDateString(),
                'condition_out' => $assignment->condition_out,
                'condition_in' => $assignment->condition_in,
                'assignment_status' => $assignment->returned_at ? 'returned' : 'assigned',
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function performanceDetails(int $ownerId, Carbon $start, Carbon $end): array
    {
        $reviews = PerformanceReview::query()
            ->with([
                'employee:id,employee_code,first_name,last_name',
                'period:id,name,starts_at,ends_at',
            ])
            ->where('user_id', $ownerId)
            ->whereHas('period', fn ($query) => $query
                ->whereDate('starts_at', '<=', $end->toDateString())
                ->whereDate('ends_at', '>=', $start->toDateString()))
            ->orderByDesc('final_score')
            ->get([
                'id',
                'performance_period_id',
                'employee_id',
                'status',
                'okr_score',
                'kpi_score',
                'manager_score',
                'final_score',
                'reviewed_at',
            ]);

        return [
            'summary' => [
                'reviews' => $reviews->count(),
                'completed_reviews' => $reviews->whereIn('status', ['completed', 'locked'])->count(),
                'average_final_score' => round((float) $reviews->avg('final_score'), 2),
                'at_risk' => $reviews
                    ->filter(fn (PerformanceReview $review): bool => (float) $review->final_score > 0 && (float) $review->final_score < 60)
                    ->count(),
            ],
            'rows' => $reviews
                ->map(fn (PerformanceReview $review): array => [
                    'id' => $review->id,
                    'employee_id' => $review->employee_id,
                    'employee_code' => $review->employee?->employee_code ?? '-',
                    'employee_name' => $review->employee?->full_name ?? '-',
                    'period_name' => $review->period?->name ?? '-',
                    'status' => $review->status,
                    'okr_score' => round((float) $review->okr_score, 2),
                    'kpi_score' => round((float) $review->kpi_score, 2),
                    'manager_score' => $review->manager_score === null ? null : round((float) $review->manager_score, 2),
                    'final_score' => round((float) $review->final_score, 2),
                    'grade' => $this->performanceGrade((float) $review->final_score),
                    'reviewed_at' => $review->reviewed_at?->toDateString(),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function recruitmentDetails(int $ownerId, Carbon $start, Carbon $end): array
    {
        $vacancies = JobVacancy::query()
            ->withCount([
                'applications as applications_count' => fn ($query) => $query
                    ->whereBetween('created_at', [$start, $end]),
                'applications as hired_count' => fn ($query) => $query
                    ->whereBetween('created_at', [$start, $end])
                    ->where('stage', 'hired'),
                'applications as rejected_count' => fn ($query) => $query
                    ->whereBetween('created_at', [$start, $end])
                    ->where('stage', 'rejected'),
            ])
            ->where('user_id', $ownerId)
            ->where(function ($query) use ($start, $end) {
                $query
                    ->whereBetween('published_at', [$start, $end])
                    ->orWhereBetween('closing_date', [$start->toDateString(), $end->toDateString()])
                    ->orWhere(fn ($activeQuery) => $activeQuery
                        ->whereDate('published_at', '<=', $end->toDateString())
                        ->where(fn ($closingQuery) => $closingQuery
                            ->whereNull('closing_date')
                            ->orWhereDate('closing_date', '>=', $start->toDateString())));
            })
            ->orderBy('title')
            ->get(['id', 'title', 'status', 'openings', 'published_at', 'closing_date']);

        $applications = JobApplication::query()
            ->where('user_id', $ownerId)
            ->whereBetween('created_at', [$start, $end])
            ->get(['stage']);

        $stageCounts = $applications->countBy('stage');

        return [
            'summary' => [
                'active_vacancies' => $vacancies->whereIn('status', ['published', 'open'])->count(),
                'applications' => $applications->count(),
                'hired' => (int) ($stageCounts['hired'] ?? 0),
                'rejected' => (int) ($stageCounts['rejected'] ?? 0),
            ],
            'stages' => [
                'applied' => (int) ($stageCounts['applied'] ?? 0),
                'screening' => (int) ($stageCounts['screening'] ?? 0),
                'interview_scheduled' => (int) ($stageCounts['interview_scheduled'] ?? 0),
                'interviewed' => (int) ($stageCounts['interviewed'] ?? 0),
                'offered' => (int) ($stageCounts['offered'] ?? 0),
                'hired' => (int) ($stageCounts['hired'] ?? 0),
                'rejected' => (int) ($stageCounts['rejected'] ?? 0),
            ],
            'vacancies' => $vacancies
                ->map(fn (JobVacancy $vacancy): array => [
                    'id' => $vacancy->id,
                    'title' => $vacancy->title,
                    'status' => $vacancy->status,
                    'openings' => $vacancy->openings,
                    'published_at' => $vacancy->published_at?->toDateString(),
                    'closing_date' => $vacancy->closing_date?->toDateString(),
                    'applications_count' => (int) $vacancy->applications_count,
                    'hired_count' => (int) $vacancy->hired_count,
                    'rejected_count' => (int) $vacancy->rejected_count,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $summary
     * @param  array<string, mixed>  $performanceDetails
     * @param  array<string, mixed>  $recruitmentDetails
     * @return array<string, mixed>
     */
    private function analytics(array $summary, array $performanceDetails, array $recruitmentDetails): array
    {
        return [
            'cards' => [
                [
                    'key' => 'headcount',
                    'label' => 'Headcount Aktif',
                    'value' => $summary['active_employees'],
                    'format' => 'integer',
                    'suffix' => 'orang',
                ],
                [
                    'key' => 'attendance_present',
                    'label' => 'Kehadiran',
                    'value' => $this->percentage(
                        (float) $summary['attendance']['present'],
                        (float) array_sum($summary['attendance']),
                    ),
                    'format' => 'percent',
                ],
                [
                    'key' => 'leave_days',
                    'label' => 'Cuti Disetujui',
                    'value' => $this->percentage(
                        (float) $summary['leave']['approved_days'],
                        (float) array_sum($summary['leave']),
                    ),
                    'format' => 'percent',
                ],
                [
                    'key' => 'payroll_net',
                    'label' => 'Net Payroll',
                    'value' => $summary['payroll']['net_salary'],
                    'format' => 'currency',
                ],
                [
                    'key' => 'performance_score',
                    'label' => 'Rata-rata KPI',
                    'value' => $performanceDetails['summary']['average_final_score'],
                    'suffix' => 'skor',
                ],
                [
                    'key' => 'recruitment_hires',
                    'label' => 'Kandidat Diterima',
                    'value' => $recruitmentDetails['summary']['hired'],
                    'format' => 'integer',
                    'suffix' => 'orang',
                ],
            ],
        ];
    }

    private function percentage(float $value, float $total): float
    {
        if ($total <= 0) {
            return 0.0;
        }

        return round(($value / $total) * 100, 2);
    }

    private function performanceGrade(float $score): string
    {
        return match (true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'E',
        };
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
