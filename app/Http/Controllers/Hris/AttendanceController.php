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
use App\Services\MissingCheckoutLeaveSyncService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
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
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'sort_by' => ['nullable', 'in:employee,attendance_date,check_in_at,check_out_at'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $employees = Employee::query()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        $startDate = $validated['start_date'] ?? $validated['date'] ?? today()->toDateString();
        $endDate = $validated['end_date'] ?? $validated['date'] ?? $startDate;

        $filters = [
            'date' => $startDate,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'sort_by' => $validated['sort_by'] ?? 'employee',
            'sort_dir' => $validated['sort_dir'] ?? 'asc',
        ];

        $attendancesQuery = EmployeeAttendance::query()
            ->with(['employee:id,employee_code,first_name,last_name', 'backupForEmployee:id,employee_code,first_name,last_name', 'backupByEmployee:id,employee_code,first_name,last_name'])
            ->when(
                $filters['start_date'] === $filters['end_date'],
                fn ($query) => $query->whereDate('attendance_date', $filters['start_date']),
                fn ($query) => $query->whereBetween('attendance_date', [$filters['start_date'], $filters['end_date']]),
            )
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']));

        if ($filters['sort_by'] === 'attendance_date') {
            $attendancesQuery
                ->orderBy('attendance_date', $filters['sort_dir'])
                ->orderBy('employee_id', 'asc');
        } elseif ($filters['sort_by'] === 'check_in_at') {
            $attendancesQuery
                ->orderByRaw('check_in_at IS NULL')
                ->orderBy('check_in_at', $filters['sort_dir']);
        } elseif ($filters['sort_by'] === 'check_out_at') {
            $attendancesQuery
                ->orderByRaw('check_out_at IS NULL')
                ->orderBy('check_out_at', $filters['sort_dir']);
        } else {
            $attendancesQuery->orderBy('attendance_date', 'desc')->orderBy('employee_id', $filters['sort_dir']);
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
                ->whereBetween('work_date', [$filters['start_date'], $filters['end_date']])
                ->whereIn('employee_id', $employeeIds)
                ->get()
                ->groupBy(fn (EmployeeSchedule $s) => $s->employee_id.'_'.$s->work_date->toDateString());

        $attendances = $attendancesPaginator->through(function (EmployeeAttendance $attendance) use ($shiftByEmployee) {
            $dateStr = $attendance->attendance_date->format('Y-m-d');
            $shiftSchedule = $shiftByEmployee->get($attendance->employee_id.'_'.$dateStr)?->first();

            return [
                'id' => $attendance->id,
                'employee_id' => $attendance->employee_id,
                'employee_label' => $attendance->employee
                    ? $attendance->employee->employee_code.' - '.$attendance->employee->full_name
                    : '-',
                'attendance_date' => $dateStr,
                'timezone' => $attendance->timezone,
                'shift_name' => (string) ($shiftSchedule?->shift_code ?? 'OFF'),
                'status' => $attendance->status,
                'is_backup' => (bool) ($attendance->is_backup ?? false),
                'backup_for_employee' => $attendance->backupForEmployee ? [
                    'id' => $attendance->backupForEmployee->id,
                    'employee_code' => $attendance->backupForEmployee->employee_code,
                    'full_name' => $attendance->backupForEmployee->full_name,
                ] : null,
                'backup_by_employee' => $attendance->backupByEmployee ? [
                    'id' => $attendance->backupByEmployee->id,
                    'employee_code' => $attendance->backupByEmployee->employee_code,
                    'full_name' => $attendance->backupByEmployee->full_name,
                ] : null,
                'late_minutes' => $attendance->late_minutes,
                'late_duration_label' => $this->formatLateDuration($attendance->late_minutes),
                'late_level' => $attendance->late_level,
                'late_penalty' => (float) ($attendance->late_penalty ?? 0),
                'is_half_day' => (bool) ($attendance->is_half_day ?? false),
                'check_in_at' => $attendance->check_in_at?->toIso8601String(),
                'check_out_at' => $attendance->check_out_at?->toIso8601String(),
                'check_in_photo_url' => $attendance->check_in_photo_url,
                'check_out_photo_url' => $attendance->check_out_photo_url,
                'face_similarity_score' => $attendance->face_similarity_score !== null ? (float) $attendance->face_similarity_score : null,
                'has_photo' => ! empty($attendance->check_in_photo_url) || ! empty($attendance->check_out_photo_url),
                'notes' => $attendance->notes,
            ];
        });

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
     * Display a monthly attendance history for one employee.
     */
    public function showMonthly(Request $request, Employee $employee): Response
    {
        abort_unless($employee->user_id === $request->user()->accountOwnerId(), 404);

        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
        ]);

        $period = $validated['period'] ?? today()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m-d', $period.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $attendanceByDate = EmployeeAttendance::query()
            ->with(['shift:id,code,name,start_time,end_time,is_day_off', 'backupForEmployee:id,employee_code,first_name,last_name', 'backupByEmployee:id,employee_code,first_name,last_name'])
            ->where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('attendance_date')
            ->orderBy('id')
            ->get()
            ->keyBy(fn (EmployeeAttendance $attendance) => $attendance->attendance_date->toDateString());

        $scheduleByDate = EmployeeSchedule::query()
            ->where('employee_id', $employee->id)
            ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()])
            ->get(['work_date', 'shift_code'])
            ->keyBy(fn (EmployeeSchedule $schedule) => $schedule->work_date->toDateString());

        $rows = collect();
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dateKey = $date->toDateString();
            $attendance = $attendanceByDate->get($dateKey);

            $rows->push($attendance ? [
                'id' => $attendance->id,
                'attendance_date' => $dateKey,
                'timezone' => $attendance->timezone,
                'shift_name' => $attendance->shift?->name
                    ?? $attendance->shift?->code
                    ?? $scheduleByDate->get($dateKey)?->shift_code
                    ?? 'OFF',
                'status' => $attendance->status,
                'is_backup' => (bool) ($attendance->is_backup ?? false),
                'backup_for_employee' => $attendance->backupForEmployee ? [
                    'id' => $attendance->backupForEmployee->id,
                    'employee_code' => $attendance->backupForEmployee->employee_code,
                    'full_name' => $attendance->backupForEmployee->full_name,
                ] : null,
                'late_minutes' => $attendance->late_minutes,
                'late_duration_label' => $this->formatLateDuration($attendance->late_minutes),
                'late_level' => $attendance->late_level,
                'late_penalty' => (float) ($attendance->late_penalty ?? 0),
                'is_half_day' => (bool) ($attendance->is_half_day ?? false),
                'check_in_at' => $attendance->check_in_at?->toIso8601String(),
                'check_out_at' => $attendance->check_out_at?->toIso8601String(),
                'check_in_photo_url' => $attendance->check_in_photo_url,
                'check_out_photo_url' => $attendance->check_out_photo_url,
                'face_similarity_score' => $attendance->face_similarity_score !== null ? (float) $attendance->face_similarity_score : null,
                'has_photo' => ! empty($attendance->check_in_photo_url) || ! empty($attendance->check_out_photo_url),
                'notes' => $attendance->notes,
                'is_missing' => false,
            ] : [
                'id' => null,
                'attendance_date' => $dateKey,
                'timezone' => $employee->timezone,
                'shift_name' => $scheduleByDate->get($dateKey)?->shift_code ?? 'OFF',
                'status' => 'absent',
                'late_minutes' => null,
                'late_level' => null,
                'late_penalty' => 0.0,
                'is_half_day' => false,
                'check_in_at' => null,
                'check_out_at' => null,
                'check_in_photo_url' => null,
                'check_out_photo_url' => null,
                'face_similarity_score' => null,
                'has_photo' => false,
                'notes' => null,
                'is_missing' => true,
            ]);
        }

        $summary = $rows
            ->countBy('status');

        return Inertia::render('hris/attendances/monthly', [
            'employee' => [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ],
            'filters' => [
                'period' => $period,
            ],
            'period' => [
                'key' => $period,
                'label' => $start->translatedFormat('F Y'),
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ],
            'summary' => [
                'total' => $rows->count(),
                'present' => (int) ($summary['present'] ?? 0),
                'late' => (int) ($summary['late'] ?? 0),
                'on_leave' => (int) ($summary['on_leave'] ?? 0),
                'absent' => (int) ($summary['absent'] ?? 0),
            ],
            'attendances' => $rows,
        ]);
    }

    public function syncMissingCheckouts(Request $request, MissingCheckoutLeaveSyncService $syncService): RedirectResponse
    {
        $validated = $request->validate(['date' => ['required', 'date']]);
        $result = $syncService->sync($request->user()->accountOwnerId(), $validated['date']);

        return back()->with('success', "Sync selesai: {$result['clocked_out']} absensi ditutup, {$result['leave_deducted']} saldo cuti dipotong.");
    }

    public function syncLateness(Request $request, AttendanceStatusService $statusService): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'date' => ['nullable', 'date'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'all' => ['nullable', 'boolean'],
        ]);

        $startDate = $validated['start_date'] ?? $validated['date'] ?? null;
        $endDate = $validated['end_date'] ?? $validated['date'] ?? $startDate;

        if (! empty($validated['all'])) {
            $startDate = null;
            $endDate = null;
        }

        $employeeId = ! empty($validated['employee_id']) ? (int) $validated['employee_id'] : null;

        $result = $statusService->syncLateness($ownerId, $startDate, $endDate, $employeeId);

        $rangeInfo = $startDate && $endDate
            ? ($startDate === $endDate ? "tanggal {$startDate}" : "rentang {$startDate} s/d {$endDate}")
            : ($startDate ? "tanggal {$startDate}" : 'seluruh data presensi');

        $detailParts = ["{$result['total']} data diperiksa", "{$result['updated']} diperbarui", "{$result['late']} terlambat", "{$result['on_time']} tepat waktu"];
        if ($result['leave_deducted'] > 0) {
            $detailParts[] = "{$result['leave_deducted']} saldo cuti dipotong (setengah hari)";
        }

        return back()->with(
            'success',
            "Sinkronisasi keterlambatan selesai ({$rangeInfo}): ".implode(', ', $detailParts).'.'
        );
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
        $validated = array_merge($validated, $statusService->resolveStatusAttributes($validated, $ownerId, $timezone));

        $attendance = EmployeeAttendance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'attendance_date' => $validated['attendance_date'],
            ],
            [
                'status' => $validated['status'],
                'timezone' => $timezone,
                'late_minutes' => $validated['late_minutes'] ?? null,
                'late_level' => $validated['late_level'] ?? null,
                'late_penalty' => $validated['late_penalty'] ?? 0,
                'is_half_day' => (bool) ($validated['is_half_day'] ?? false),
                'check_in_at' => $validated['check_in_at'] ?? null,
                'check_out_at' => $validated['check_out_at'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        app(\App\Services\AutoOvertimeService::class)->syncFromAttendance($attendance, $ownerId, $timezone);

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
        $validated['timezone'] = $timezone;
        $validated = array_merge($validated, $statusService->resolveStatusAttributes($validated, $request->user()->accountOwnerId(), $timezone));

        $employeeAttendance->update($validated);

        app(\App\Services\AutoOvertimeService::class)->syncFromAttendance($employeeAttendance, $request->user()->accountOwnerId(), $timezone);

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
     * Export attendance records to XLS or PDF file.
     */
    public function export(Request $request): SymfonyResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'sort_by' => ['nullable', 'in:employee,attendance_date,check_in_at,check_out_at'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
            'format' => ['nullable', 'in:xls,pdf'],
        ]);

        $startDate = $validated['start_date'] ?? $validated['date'] ?? today()->toDateString();
        $endDate = $validated['end_date'] ?? $validated['date'] ?? $startDate;
        $format = $validated['format'] ?? 'xls';

        $filters = [
            'date' => $startDate,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'sort_by' => $validated['sort_by'] ?? 'employee',
            'sort_dir' => $validated['sort_dir'] ?? 'asc',
            'format' => $format,
        ];

        $query = EmployeeAttendance::query()
            ->with(['employee:id,employee_code,first_name,last_name', 'backupForEmployee:id,employee_code,first_name,last_name', 'backupByEmployee:id,employee_code,first_name,last_name'])
            ->when(
                $filters['start_date'] === $filters['end_date'],
                fn ($builder) => $builder->whereDate('attendance_date', $filters['start_date']),
                fn ($builder) => $builder->whereBetween('attendance_date', [$filters['start_date'], $filters['end_date']]),
            )
            ->when($filters['status'] !== '', fn ($builder) => $builder->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($builder) => $builder->where('employee_id', $filters['employee_id']));

        if ($filters['sort_by'] === 'attendance_date') {
            $query->orderBy('attendance_date', $filters['sort_dir'])->orderBy('employee_id', 'asc');
        } elseif ($filters['sort_by'] === 'check_in_at') {
            $query->orderByRaw('check_in_at IS NULL')->orderBy('check_in_at', $filters['sort_dir']);
        } elseif ($filters['sort_by'] === 'check_out_at') {
            $query->orderByRaw('check_out_at IS NULL')->orderBy('check_out_at', $filters['sort_dir']);
        } else {
            $query->orderBy('attendance_date', 'desc')->orderBy('employee_id', $filters['sort_dir']);
        }

        $rows = $query->get();
        $company = CompanySetting::query()
            ->where('user_id', $ownerId)
            ->first();
        $timezone = $this->deviceTimezone($request);
        $timezoneAbbr = $this->formatTimezoneAbbr($timezone);

        $statusLabels = [
            'present' => 'Hadir',
            'late' => 'Terlambat',
            'on_leave' => 'Cuti',
            'absent' => 'Absen',
        ];
        $dateRangeLabel = $filters['start_date'] === $filters['end_date']
            ? $filters['start_date']
            : "{$filters['start_date']} s/d {$filters['end_date']}";
        $companyName = $company?->name ?: 'Perusahaan';
        $companyDetails = $company?->details ?: '';
        $companyAddress = $company?->location_address ?: '';

        if ($format === 'pdf') {
            $companyLogoSrc = null;
            if ($company?->logo_path && Storage::disk('public')->exists($company->logo_path)) {
                $logoData = Storage::disk('public')->get($company->logo_path);
                $mime = Storage::disk('public')->mimeType($company->logo_path) ?: 'image/png';
                $companyLogoSrc = 'data:'.$mime.';base64,'.base64_encode($logoData);
            } elseif (file_exists(public_path('logo-color.png'))) {
                $logoData = file_get_contents(public_path('logo-color.png'));
                $companyLogoSrc = 'data:image/png;base64,'.base64_encode($logoData);
            }

            $mappedRows = $rows->map(function (EmployeeAttendance $row) use ($statusLabels, $timezone) {
                $rowTz = $this->validTimezone($row->timezone) ?? $timezone;
                $rowTzAbbr = $this->formatTimezoneAbbr($rowTz);

                $lateInfo = $row->late_minutes !== null && $row->late_minutes > 0
                    ? $this->formatLateDuration($row->late_minutes)
                    : '-';

                return [
                    'attendance_date' => $row->attendance_date?->format('Y-m-d') ?? '-',
                    'employee_code' => $row->employee?->employee_code ?? '-',
                    'full_name' => $row->employee?->full_name ?? '-',
                    'status' => $row->status,
                    'status_label' => $statusLabels[$row->status] ?? $row->status,
                    'late_info' => $lateInfo,
                    'check_in' => $this->localExportTime($row->check_in_at, $rowTz),
                    'check_out' => $this->localExportTime($row->check_out_at, $rowTz),
                    'timezone' => $rowTzAbbr,
                    'notes' => $row->notes,
                ];
            });

            $summary = [
                'total' => $rows->count(),
                'present' => $rows->where('status', 'present')->count(),
                'late' => $rows->where('status', 'late')->count(),
                'on_leave' => $rows->where('status', 'on_leave')->count(),
                'absent' => $rows->where('status', 'absent')->count(),
            ];

            $fileName = 'Laporan_Kehadiran_'.now()->format('Ymd_His').'.pdf';

            return Pdf::loadView('hris.attendances.export', [
                'documentTitle' => $fileName,
                'companyName' => $companyName,
                'companyDetails' => $companyDetails,
                'companyAddress' => $companyAddress,
                'companyLogoSrc' => $companyLogoSrc,
                'dateRangeLabel' => $dateRangeLabel,
                'statusFilterLabel' => $filters['status'] !== '' ? ($statusLabels[$filters['status']] ?? $filters['status']) : 'Semua',
                'timezoneAbbr' => $timezoneAbbr,
                'summary' => $summary,
                'rows' => $mappedRows,
                'generatedAt' => now()->setTimezone($timezone)->locale('id')->translatedFormat('d F Y H:i'),
            ])
                ->setPaper('a4', 'landscape')
                ->download($fileName);
        }

        $fileName = 'attendances_'.now()->format('Ymd_His').'.xls';

        return response()->streamDownload(function () use ($rows, $companyName, $companyDetails, $filters, $timezone, $timezoneAbbr, $statusLabels, $dateRangeLabel): void {
            $escape = fn (mixed $value): string => e((string) ($value ?? ''));
            $generatedAt = now()->setTimezone($timezone)->format('Y-m-d H:i:s');

            echo '<!DOCTYPE html><html><head><meta charset="UTF-8">';
            echo '<style>
                body { font-family: Arial, sans-serif; color: #111827; }
                .report { position: relative; }
                table { border-collapse: collapse; width: 100%; position: relative; z-index: 1; }
                th, td { border: 1px solid #9ca3af; padding: 7px; font-size: 12px; vertical-align: top; }
                th { background: #e5e7eb; font-weight: 700; text-align: left; }
                .header td { border: none; padding: 2px 0; }
                .company { font-size: 18px; font-weight: 700; }
                .title { font-size: 16px; font-weight: 700; padding-top: 10px; }
                .meta { color: #374151; font-size: 12px; }
            </style></head><body><div class="report">';
            echo '<table class="header">';
            echo '<tr><td class="company" colspan="7">'.$escape($companyName).'</td></tr>';
            echo '<tr><td colspan="7">'.nl2br($escape($companyDetails)).'</td></tr>';
            echo '<tr><td class="title" colspan="7">Laporan Kehadiran</td></tr>';
            echo '<tr><td class="meta" colspan="7">Tanggal laporan: '.$escape($dateRangeLabel).'</td></tr>';
            echo '<tr><td class="meta" colspan="7">Status: '.$escape($filters['status'] !== '' ? ($statusLabels[$filters['status']] ?? $filters['status']) : 'Semua').'</td></tr>';
            echo '<tr><td class="meta" colspan="7">Zona Waktu: '.$escape($timezoneAbbr).'</td></tr>';
            echo '<tr><td class="meta" colspan="7">Generated at: '.$escape($generatedAt).'</td></tr>';
            echo '<tr><td colspan="7">&nbsp;</td></tr>';
            echo '</table>';
            echo '<table>';
            echo '<thead><tr>';
            foreach (['Tanggal', 'Kode Pegawai', 'Nama Pegawai', 'Status', 'Keterlambatan', 'Check In', 'Check Out', 'Zona Waktu', 'Catatan'] as $heading) {
                echo '<th>'.$escape($heading).'</th>';
            }
            echo '</tr></thead><tbody>';

            if ($rows->isEmpty()) {
                echo '<tr><td colspan="9">Tidak ada data kehadiran.</td></tr>';
            }

            foreach ($rows as $row) {
                echo '<tr>';
                echo '<td>'.$escape($row->attendance_date?->format('Y-m-d')).'</td>';
                echo '<td>'.$escape($row->employee?->employee_code).'</td>';
                echo '<td>'.$escape($row->employee?->full_name).'</td>';
                echo '<td>'.$escape($statusLabels[$row->status] ?? $row->status).'</td>';
                echo '<td>'.$escape($row->late_minutes !== null && $row->late_minutes > 0 ? $this->formatLateDuration($row->late_minutes) : '-').'</td>';
                $rowTimezone = $this->validTimezone($row->timezone) ?? $timezone;
                echo '<td>'.$escape($this->localExportTime($row->check_in_at, $rowTimezone)).'</td>';
                echo '<td>'.$escape($this->localExportTime($row->check_out_at, $rowTimezone)).'</td>';
                echo '<td>'.$escape($this->formatTimezoneAbbr($rowTimezone)).'</td>';
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

    private function formatTimezoneAbbr(?string $timezone): string
    {
        $tz = trim((string) $timezone);

        return match ($tz) {
            'Asia/Jakarta', 'Asia/Pontianak', 'WIB' => 'WIB',
            'Asia/Makassar', 'Asia/Ujung_Pandang', 'WITA' => 'WITA',
            'Asia/Jayapura', 'WIT' => 'WIT',
            default => str_contains($tz, 'Makassar') || str_contains($tz, 'WITA')
                ? 'WITA'
                : (str_contains($tz, 'Jayapura') || str_contains($tz, 'WIT') ? 'WIT' : 'WIB'),
        };
    }

    private function localExportTime(mixed $value, string $timezone): ?string
    {
        if (blank($value)) {
            return null;
        }

        return Carbon::parse($value, config('app.timezone'))->setTimezone($timezone)->format('H:i');
    }

    private function lateLevelLabel(?string $level): string
    {
        return match ($level) {
            'level_1' => 'Level 1',
            'level_2' => 'Level 2',
            'level_3' => 'Level 3',
            default => '-',
        };
    }

    public function formatLateDuration(?int $minutes): string
    {
        if ($minutes === null || $minutes <= 0) {
            return '-';
        }

        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;

        return "{$hours} jam {$mins} menit";
    }

    private function deviceTimezone(Request $request): string
    {
        $timezone = (string) $request->input('timezone', $request->header('X-Timezone', config('app.timezone')));

        return in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : config('app.timezone');
    }

    private function validTimezone(mixed $timezone): ?string
    {
        return is_string($timezone) && in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : null;
    }

    /**
     * @param  array<string, mixed>  $validated
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
