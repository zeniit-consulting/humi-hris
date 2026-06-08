<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\StoreAttendanceRequest;
use App\Http\Requests\Hris\UpdateAttendanceRequest;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Services\AttendanceStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    /**
     * Display attendance page and monthly schedule panel.
     */
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'sort_by' => ['nullable', 'in:employee,check_in_at,check_out_at'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $employees = Employee::query()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        $activeDate = $validated['date'] ?? today()->toDateString();

        $filters = [
            'date' => $activeDate,
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'sort_by' => $validated['sort_by'] ?? 'employee',
            'sort_dir' => $validated['sort_dir'] ?? 'asc',
        ];

        $attendancesQuery = EmployeeAttendance::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->whereDate('attendance_date', $filters['date'])
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']));

        if ($filters['sort_by'] === 'check_in_at') {
            $attendancesQuery
                ->orderByRaw('check_in_at IS NULL')
                ->orderBy('check_in_at', $filters['sort_dir']);
        } elseif ($filters['sort_by'] === 'check_out_at') {
            $attendancesQuery
                ->orderByRaw('check_out_at IS NULL')
                ->orderBy('check_out_at', $filters['sort_dir']);
        } else {
            $attendancesQuery->orderBy('employee_id', $filters['sort_dir']);
        }

        $attendancesPaginator = $attendancesQuery
            ->paginate(12)
            ->withQueryString();

        $employeeIds = collect($attendancesPaginator->items())
            ->pluck('employee_id')
            ->unique()
            ->values();

        $shiftByEmployee = $employeeIds->isEmpty()
            ? collect()
            : EmployeeSchedule::query()
                ->whereDate('work_date', $filters['date'])
                ->whereIn('employee_id', $employeeIds)
                ->pluck('shift_code', 'employee_id');

        $attendances = $attendancesPaginator->through(fn (EmployeeAttendance $attendance) => [
            'id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'employee_label' => $attendance->employee
                ? $attendance->employee->employee_code.' - '.$attendance->employee->full_name
                : '-',
            'attendance_date' => $attendance->attendance_date->format('Y-m-d'),
            'shift_name' => (string) ($shiftByEmployee->get($attendance->employee_id) ?? 'OFF'),
            'status' => $attendance->status,
            'check_in_at' => $attendance->check_in_at?->toIso8601String(),
            'check_out_at' => $attendance->check_out_at?->toIso8601String(),
            'notes' => $attendance->notes,
        ]);

        $todaySummaryRows = EmployeeAttendance::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereDate('attendance_date', today())
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('hris/attendances/index', [
            'attendances' => $attendances,
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]),
            'filters' => $filters,
            'todaySummary' => [
                'present' => (int) ($todaySummaryRows['present'] ?? 0),
                'late' => (int) ($todaySummaryRows['late'] ?? 0),
                'on_leave' => (int) ($todaySummaryRows['on_leave'] ?? 0),
                'absent' => (int) ($todaySummaryRows['absent'] ?? 0),
            ],
            'statusOptions' => ['present', 'late', 'on_leave', 'absent'],
        ]);
    }

    /**
     * Store new attendance record.
     */
    public function store(StoreAttendanceRequest $request, AttendanceStatusService $statusService): RedirectResponse
    {
        $validated = $request->validated();
        $ownerId = $request->user()->accountOwnerId();
        $timezone = $this->deviceTimezone($request);
        $this->normalizeAttendanceTimestamps($validated, $timezone);
        $validated['status'] = $statusService->resolveStatus($validated, $ownerId, $timezone);

        EmployeeAttendance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'attendance_date' => $validated['attendance_date'],
            ],
            [
                'status' => $validated['status'],
                'check_in_at' => $validated['check_in_at'] ?? null,
                'check_out_at' => $validated['check_out_at'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return back();
    }

    /**
     * Update attendance record.
     */
    public function update(UpdateAttendanceRequest $request, EmployeeAttendance $employeeAttendance, AttendanceStatusService $statusService): RedirectResponse
    {
        $validated = $request->validated();
        $timezone = $this->deviceTimezone($request);
        $this->normalizeAttendanceTimestamps($validated, $timezone);
        $validated['status'] = $statusService->resolveStatus($validated, $request->user()->accountOwnerId(), $timezone);

        $employeeAttendance->update($validated);

        return back();
    }

    /**
     * Delete attendance record.
     */
    public function destroy(EmployeeAttendance $employeeAttendance): RedirectResponse
    {
        $employeeAttendance->delete();

        return back();
    }

    /**
     * Export attendance records to XLS-compatible file.
     */
    public function export(Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'sort_by' => ['nullable', 'in:employee,check_in_at,check_out_at'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $filters = [
            'date' => $validated['date'] ?? today()->toDateString(),
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'sort_by' => $validated['sort_by'] ?? 'employee',
            'sort_dir' => $validated['sort_dir'] ?? 'asc',
        ];

        $query = EmployeeAttendance::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->whereDate('attendance_date', $filters['date'])
            ->when($filters['status'] !== '', fn ($builder) => $builder->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($builder) => $builder->where('employee_id', $filters['employee_id']));

        if ($filters['sort_by'] === 'check_in_at') {
            $query->orderByRaw('check_in_at IS NULL')->orderBy('check_in_at', $filters['sort_dir']);
        } elseif ($filters['sort_by'] === 'check_out_at') {
            $query->orderByRaw('check_out_at IS NULL')->orderBy('check_out_at', $filters['sort_dir']);
        } else {
            $query->orderBy('employee_id', $filters['sort_dir']);
        }

        $rows = $query->get();
        $company = CompanySetting::query()
            ->where('user_id', $ownerId)
            ->first();
        $fileName = 'attendances_'.now()->format('Ymd_His').'.xls';

        return response()->streamDownload(function () use ($rows, $company, $filters): void {
            $escape = fn (mixed $value): string => e((string) ($value ?? ''));
            $companyName = $company?->name ?: 'Perusahaan';
            $companyDetails = $company?->details ?: '-';
            $generatedAt = now()->format('Y-m-d H:i:s');
            $statusLabels = [
                'present' => 'Hadir',
                'late' => 'Terlambat',
                'on_leave' => 'Cuti',
                'absent' => 'Absen',
            ];

            echo '<!DOCTYPE html><html><head><meta charset="UTF-8">';
            echo '<style>
                body { font-family: Arial, sans-serif; color: #111827; }
                .report { position: relative; }
                .watermark { position: absolute; top: 260px; left: 95px; color: #d1d5db; font-size: 54px; font-weight: 700; opacity: .38; transform: rotate(-28deg); z-index: 0; }
                table { border-collapse: collapse; width: 100%; position: relative; z-index: 1; }
                th, td { border: 1px solid #9ca3af; padding: 7px; font-size: 12px; vertical-align: top; }
                th { background: #e5e7eb; font-weight: 700; text-align: left; }
                .header td { border: none; padding: 2px 0; }
                .company { font-size: 18px; font-weight: 700; }
                .title { font-size: 16px; font-weight: 700; padding-top: 10px; }
                .meta { color: #374151; font-size: 12px; }
            </style></head><body><div class="report">';
            echo '<div class="watermark">Generated by Humi</div>';
            echo '<table class="header">';
            echo '<tr><td class="company" colspan="7">'.$escape($companyName).'</td></tr>';
            echo '<tr><td colspan="7">'.nl2br($escape($companyDetails)).'</td></tr>';
            echo '<tr><td class="title" colspan="7">Laporan Kehadiran</td></tr>';
            echo '<tr><td class="meta" colspan="7">Tanggal laporan: '.$escape($filters['date']).'</td></tr>';
            echo '<tr><td class="meta" colspan="7">Status: '.$escape($filters['status'] !== '' ? ($statusLabels[$filters['status']] ?? $filters['status']) : 'Semua').'</td></tr>';
            echo '<tr><td class="meta" colspan="7">Generated at: '.$escape($generatedAt).'</td></tr>';
            echo '<tr><td colspan="7">&nbsp;</td></tr>';
            echo '</table>';
            echo '<table>';
            echo '<thead><tr>';
            foreach (['Tanggal', 'Kode Pegawai', 'Nama Pegawai', 'Status', 'Check In', 'Check Out', 'Catatan'] as $heading) {
                echo '<th>'.$escape($heading).'</th>';
            }
            echo '</tr></thead><tbody>';

            if ($rows->isEmpty()) {
                echo '<tr><td colspan="7">Tidak ada data kehadiran.</td></tr>';
            }

            foreach ($rows as $row) {
                echo '<tr>';
                echo '<td>'.$escape($row->attendance_date?->format('Y-m-d')).'</td>';
                echo '<td>'.$escape($row->employee?->employee_code).'</td>';
                echo '<td>'.$escape($row->employee?->full_name).'</td>';
                echo '<td>'.$escape($statusLabels[$row->status] ?? $row->status).'</td>';
                echo '<td>'.$escape($row->check_in_at?->format('H:i')).'</td>';
                echo '<td>'.$escape($row->check_out_at?->format('H:i')).'</td>';
                echo '<td>'.$escape($row->notes).'</td>';
                echo '</tr>';
            }

            echo '</tbody></table>';
            echo '<p class="meta">Generated by Humi</p>';
            echo '</div></body></html>';
        }, $fileName, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    private function deviceTimezone(Request $request): string
    {
        $timezone = (string) $request->input('timezone', $request->header('X-Timezone', config('app.timezone')));

        return in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : config('app.timezone');
    }

    /**
     * @param array<string, mixed> $validated
     */
    private function normalizeAttendanceTimestamps(array &$validated, string $timezone): void
    {
        foreach (['check_in_at', 'check_out_at'] as $key) {
            if (blank($validated[$key] ?? null)) {
                $validated[$key] = null;
                continue;
            }

            $value = (string) $validated[$key];

            $validated[$key] = preg_match('/(?:Z|[+-]\d{2}:?\d{2})$/', $value) === 1
                ? Carbon::parse($value)->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s')
                : Carbon::parse($value, $timezone)->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s');
        }
    }
}
