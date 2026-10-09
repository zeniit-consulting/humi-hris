<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\StoreAttendanceScheduleRequest;
use App\Http\Requests\Hris\StoreScheduleRosterRequest;
use App\Http\Requests\Hris\StoreWorkShiftRequest;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\PublicHoliday;
use App\Models\ShiftChangeRequest;
use App\Models\WorkShift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ScheduleController extends Controller
{
    /**
     * Display schedule page with monthly rows.
     */
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $shiftTemplates = $this->shiftTemplates($ownerId);

        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);

        $employees = Employee::query()
            ->where('user_id', $ownerId)
            ->active()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        $filters = [
            'month' => $validated['month'] ?? now()->format('Y-m'),
            'employee_id' => isset($validated['employee_id'])
                ? (string) $validated['employee_id']
                : (string) ($employees->first()?->id ?? ''),
        ];

        return Inertia::render('hris/schedules/index', [
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]),
            'filters' => $filters,
            'shifts' => $this->availableShifts($ownerId),
            'scheduleDays' => $this->buildScheduleDays($filters['month'], $filters['employee_id'], $shiftTemplates),
            'shiftTemplates' => $shiftTemplates,
            'holidays' => $this->holidaysForMonth($ownerId, $filters['month']),
            'monthlyMatrix' => $this->buildMonthlyMatrix($filters['month'], $employees, $ownerId),
        ]);
    }

    /**
     * Upsert schedule rows for one employee in one month.
     */
    public function store(StoreAttendanceScheduleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $ownerId = $request->user()->accountOwnerId();
        $shiftTemplates = $this->shiftTemplates($ownerId);

        $monthStart = Carbon::createFromFormat('Y-m-d', $validated['month'].'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $rows = collect($validated['entries'])
            ->filter(function (array $entry) use ($monthStart, $monthEnd): bool {
                $entryDate = Carbon::parse($entry['date']);

                return $entryDate->betweenIncluded($monthStart, $monthEnd);
            })
            ->map(function (array $entry) use ($validated, $ownerId, $shiftTemplates): array {
                $template = $shiftTemplates[$entry['shift_code']] ?? $shiftTemplates['OFF'];

                return [
                    'user_id' => $ownerId,
                    'employee_id' => $validated['employee_id'],
                    'work_date' => $entry['date'],
                    'shift_code' => $entry['shift_code'],
                    'start_time' => $template['start_time'],
                    'end_time' => $template['end_time'],
                    'is_day_off' => $template['is_day_off'],
                    'notes' => $entry['notes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })
            ->values()
            ->all();

        if (! empty($rows)) {
            EmployeeSchedule::query()->upsert(
                $rows,
                ['employee_id', 'work_date'],
                ['shift_code', 'start_time', 'end_time', 'is_day_off', 'notes', 'updated_at']
            );
        }

        return back();
    }

    /**
     * Generate roster shifts for a date range.
     */
    public function roster(StoreScheduleRosterRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $ownerId = $request->user()->accountOwnerId();
        $templates = $this->shiftTemplates($ownerId);
        $pattern = array_values($validated['pattern']);
        $employeeIds = $this->rosterEmployeeIds($validated, $ownerId);

        if (empty($employeeIds)) {
            return back()->with('error', 'Tidak ada karyawan yang dipilih untuk penerapan roster.');
        }

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end = Carbon::parse($validated['end_date'])->startOfDay();

        $rows = [];

        foreach ($employeeIds as $employeeId) {
            $cursor = $start->copy();
            $index = 0;

            while ($cursor->lte($end)) {
                $shiftCode = $pattern[$index % count($pattern)];
                $template = $templates[$shiftCode] ?? ($templates['OFF'] ?? [
                    'start_time' => null,
                    'end_time' => null,
                    'is_day_off' => true,
                ]);

                $rows[] = [
                    'user_id' => $ownerId,
                    'employee_id' => $employeeId,
                    'work_date' => $cursor->toDateString(),
                    'shift_code' => $shiftCode,
                    'start_time' => $template['start_time'],
                    'end_time' => $template['end_time'],
                    'is_day_off' => $template['is_day_off'],
                    'notes' => 'Auto roster',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $index++;
                $cursor = $cursor->addDay();
            }
        }

        if (! empty($rows)) {
            foreach (array_chunk($rows, 500) as $chunk) {
                EmployeeSchedule::query()->upsert(
                    $chunk,
                    ['employee_id', 'work_date'],
                    ['user_id', 'shift_code', 'start_time', 'end_time', 'is_day_off', 'notes', 'updated_at']
                );
            }
        }

        return back()->with('success', 'Jadwal roster berhasil diterapkan.');
    }

    /**
     * Resolve which employees should receive an auto-generated roster.
     *
     * @param  array<string, mixed>  $validated
     * @return array<int, int>
     */
    private function rosterEmployeeIds(array $validated, int $ownerId): array
    {
        $scope = $validated['apply_scope'] ?? 'single';

        if ($scope === 'all') {
            return Employee::query()
                ->where('user_id', $ownerId)
                ->active()
                ->orderBy('id')
                ->pluck('id')
                ->map(fn (int $id): int => (int) $id)
                ->all();
        }

        if ($scope === 'selected') {
            $ids = collect($validated['target_employee_ids'] ?? [])
                ->map(fn (mixed $id): int => (int) $id)
                ->unique()
                ->values()
                ->all();

            if (empty($ids)) {
                return [];
            }

            return Employee::query()
                ->where('user_id', $ownerId)
                ->whereIn('id', $ids)
                ->active()
                ->pluck('id')
                ->map(fn (int $id): int => (int) $id)
                ->all();
        }

        return ! empty($validated['employee_id']) ? [(int) $validated['employee_id']] : [];
    }

    /**
     * Store a new shift master.
     */
    public function storeShift(StoreWorkShiftRequest $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validated();
        $code = $this->generateShiftCode($validated['start_time'], $validated['end_time'], false);

        $exists = WorkShift::query()
            ->where('user_id', $ownerId)
            ->where('code', $code)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'start_time' => 'Shift dengan kode '.$code.' sudah tersedia.',
            ]);
        }

        WorkShift::query()->create([
            'user_id' => $ownerId,
            'code' => $code,
            'name' => ($validated['name'] ?? '') !== '' ? $validated['name'] : $code,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_day_off' => false,
            'late_tolerance_minutes' => $validated['late_tolerance_minutes'] ?? 15,
        ]);

        return back();
    }

    public function updateShift(StoreWorkShiftRequest $request, WorkShift $workShift): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $workShift->user_id === $ownerId, 404);

        if ($workShift->is_day_off) {
            return back()->with('error', 'Shift day off bawaan tidak bisa diubah.');
        }

        $validated = $request->validated();

        $workShift->update([
            'name' => ($validated['name'] ?? '') !== '' ? $validated['name'] : $workShift->code,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_day_off' => false,
            'late_tolerance_minutes' => $validated['late_tolerance_minutes'] ?? 15,
        ]);

        return back()->with('success', 'Data shift berhasil diperbarui.');
    }

    public function destroyShift(Request $request, WorkShift $workShift): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $workShift->user_id === $ownerId, 404);

        if ($workShift->is_day_off) {
            return back()->with('error', 'Shift day off bawaan tidak bisa dihapus.');
        }

        if ($this->shiftHasRelatedData($workShift, $ownerId)) {
            return back()->with('error', 'Shift tidak bisa dihapus karena sudah dipakai pada jadwal, absensi, atau request perubahan jadwal.');
        }

        $workShift->delete();

        return back()->with('success', 'Shift berhasil dihapus.');
    }

    public function destroySchedule(Request $request, EmployeeSchedule $employeeSchedule): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $employeeSchedule->user_id === $ownerId, 404);

        $employeeSchedule->delete();

        return back()->with('success', 'Data jam kerja berhasil dihapus.');
    }

    public function syncHolidays(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);

        $response = Http::timeout(15)->get('https://libur.deno.dev/api');

        if (! $response->successful() || ! is_array($response->json())) {
            return back()->with('error', 'Sinkronisasi hari libur gagal. API hari libur tidak bisa diakses.');
        }

        $now = now();
        $holidayRows = collect($response->json())
            ->filter(fn (mixed $holiday): bool => is_array($holiday)
                && isset($holiday['date'], $holiday['name'], $holiday['is_national_holiday'])
                && Carbon::hasFormat((string) $holiday['date'], 'Y-m-d'))
            ->map(fn (array $holiday): array => [
                'user_id' => $ownerId,
                'date' => $holiday['date'],
                'name' => (string) $holiday['name'],
                'holiday_type' => ((bool) $holiday['is_national_holiday']) ? 'national' : 'joint_leave',
                'is_national_holiday' => (bool) $holiday['is_national_holiday'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values();

        if ($holidayRows->isNotEmpty()) {
            PublicHoliday::query()->upsert(
                $holidayRows->all(),
                ['user_id', 'date', 'name'],
                ['is_national_holiday', 'holiday_type', 'updated_at'],
            );
        }

        $monthStart = Carbon::createFromFormat('Y-m-d', $validated['month'].'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $offShift = WorkShift::query()->firstOrCreate(
            [
                'user_id' => $ownerId,
                'code' => 'OFF',
            ],
            [
                'name' => 'Day Off',
                'start_time' => null,
                'end_time' => null,
                'is_day_off' => true,
                'late_tolerance_minutes' => 0,
            ],
        );

        $monthlyHolidays = PublicHoliday::query()
            ->where('user_id', $ownerId)
            ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->orderBy('date')
            ->get();

        $scheduleRows = $monthlyHolidays
            ->map(fn (PublicHoliday $holiday): array => [
                'user_id' => $ownerId,
                'employee_id' => $validated['employee_id'],
                'work_date' => $holiday->date->toDateString(),
                'shift_code' => $offShift->code,
                'start_time' => null,
                'end_time' => null,
                'is_day_off' => true,
                'notes' => $holiday->name,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values();

        if ($scheduleRows->isNotEmpty()) {
            EmployeeSchedule::query()->upsert(
                $scheduleRows->all(),
                ['employee_id', 'work_date'],
                ['shift_code', 'start_time', 'end_time', 'is_day_off', 'notes', 'updated_at'],
            );
        }

        return back()->with('success', sprintf(
            '%d hari libur tersimpan, %d jadwal bulan %s diset OFF.',
            $holidayRows->count(),
            $scheduleRows->count(),
            $validated['month'],
        ));
    }

    /**
     * Store or update a work calendar holiday.
     */
    public function storeHoliday(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'name' => ['required', 'string', 'max:255'],
            'holiday_type' => ['required', 'string', 'in:national,joint_leave,company,other'],
            'apply_to_schedule' => ['nullable', 'boolean'],
        ]);

        $holiday = PublicHoliday::updateOrCreate(
            [
                'user_id' => $ownerId,
                'date' => $validated['date'],
                'name' => $validated['name'],
            ],
            [
                'holiday_type' => $validated['holiday_type'],
                'is_national_holiday' => $validated['holiday_type'] === 'national',
            ]
        );

        $appliedCount = 0;
        if (! empty($validated['apply_to_schedule'])) {
            $employeeIds = Employee::query()
                ->where('user_id', $ownerId)
                ->active()
                ->pluck('id');

            $offShift = WorkShift::query()->firstOrCreate(
                [
                    'user_id' => $ownerId,
                    'code' => 'OFF',
                ],
                [
                    'name' => 'Day Off',
                    'start_time' => null,
                    'end_time' => null,
                    'is_day_off' => true,
                    'late_tolerance_minutes' => 0,
                ]
            );

            $now = now();
            $scheduleRows = $employeeIds->map(fn ($empId) => [
                'user_id' => $ownerId,
                'employee_id' => $empId,
                'work_date' => $holiday->date->toDateString(),
                'shift_code' => $offShift->code,
                'start_time' => null,
                'end_time' => null,
                'is_day_off' => true,
                'notes' => $holiday->name,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if (! empty($scheduleRows)) {
                EmployeeSchedule::query()->upsert(
                    $scheduleRows,
                    ['employee_id', 'work_date'],
                    ['user_id', 'shift_code', 'start_time', 'end_time', 'is_day_off', 'notes', 'updated_at']
                );
                $appliedCount = count($scheduleRows);
            }
        }

        $message = 'Hari libur berhasil disimpan.';
        if ($appliedCount > 0) {
            $message .= " Diterapkan ke jadwal $appliedCount karyawan.";
        }

        return back()->with('success', $message);
    }

    /**
     * Delete a work calendar holiday.
     */
    public function destroyHoliday(Request $request, PublicHoliday $publicHoliday): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $publicHoliday->user_id === $ownerId, 404);

        $publicHoliday->delete();

        return back()->with('success', 'Hari libur berhasil dihapus.');
    }

    /**
     * Build month-day rows with existing schedule values.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildScheduleDays(string $month, string $employeeId, array $shiftTemplates): array
    {
        if ($month === '' || $employeeId === '') {
            return [];
        }

        $start = Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $existing = EmployeeSchedule::query()
            ->where('employee_id', $employeeId)
            ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn (EmployeeSchedule $schedule) => $schedule->work_date->toDateString());

        $days = [];
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();
            $saved = $existing->get($date);

            $days[] = [
                'date' => $date,
                'id' => $saved?->id,
                'label' => $cursor->translatedFormat('d M (D)'),
                'shift_code' => $saved?->shift_code ?? 'OFF',
                'start_time' => $this->normalizeTime($saved?->start_time),
                'end_time' => $this->normalizeTime($saved?->end_time),
                'is_day_off' => $saved?->is_day_off ?? true,
                'notes' => $saved?->notes ?? null,
            ];

            $cursor = $cursor->addDay();
        }

        return $days;
    }

    /**
     * Build horizontal monthly matrix for all active employees.
     *
     * @param \Illuminate\Support\Collection<int, Employee> $employees
     * @return array{days: array<int, array<string, mixed>>, rows: array<int, array<string, mixed>>}
     */
    private function buildMonthlyMatrix(string $month, $employees, int $ownerId): array
    {
        if ($month === '') {
            return ['days' => [], 'rows' => []];
        }

        $start = Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $holidays = PublicHoliday::query()
            ->where('user_id', $ownerId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn (PublicHoliday $h) => $h->date->toDateString());

        $days = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $dateStr = $cursor->toDateString();
            $holiday = $holidays->get($dateStr);

            $days[] = [
                'date' => $dateStr,
                'day' => (int) $cursor->day,
                'day_name' => $cursor->locale('id')->isoFormat('ddd'),
                'is_monday' => $cursor->isMonday(),
                'is_sunday' => $cursor->isSunday(),
                'is_saturday' => $cursor->isSaturday(),
                'is_holiday' => $holiday !== null,
                'holiday_name' => $holiday?->name,
            ];

            $cursor = $cursor->addDay();
        }

        $employeeIds = $employees->pluck('id')->all();

        $schedules = EmployeeSchedule::query()
            ->where('user_id', $ownerId)
            ->whereIn('employee_id', $employeeIds)
            ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()])
            ->get(['id', 'employee_id', 'work_date', 'shift_code', 'start_time', 'end_time', 'is_day_off', 'notes'])
            ->groupBy('employee_id');

        $rows = [];
        foreach ($employees as $employee) {
            $empSchedules = $schedules->get($employee->id, collect())->keyBy(function ($item) {
                return Carbon::parse($item->work_date)->toDateString();
            });

            $scheduleMap = [];
            $totalWork = 0;
            $totalOff = 0;

            foreach ($days as $day) {
                $dateStr = $day['date'];
                $sched = $empSchedules->get($dateStr);

                if ($sched) {
                    $isOff = (bool) $sched->is_day_off || $sched->shift_code === 'OFF';
                    $scheduleMap[$dateStr] = [
                        'id' => $sched->id,
                        'shift_code' => $sched->shift_code,
                        'start_time' => $this->normalizeTime($sched->start_time),
                        'end_time' => $this->normalizeTime($sched->end_time),
                        'is_day_off' => $isOff,
                        'notes' => $sched->notes,
                    ];

                    if ($isOff) {
                        $totalOff++;
                    } else {
                        $totalWork++;
                    }
                } else {
                    $scheduleMap[$dateStr] = [
                        'id' => null,
                        'shift_code' => 'OFF',
                        'start_time' => null,
                        'end_time' => null,
                        'is_day_off' => true,
                        'notes' => null,
                    ];
                    $totalOff++;
                }
            }

            $rows[] = [
                'employee_id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'employee_name' => $employee->full_name,
                'employee_label' => $employee->employee_code.' - '.$employee->full_name,
                'schedules' => $scheduleMap,
                'total_work_days' => $totalWork,
                'total_off_days' => $totalOff,
            ];
        }

        return [
            'days' => $days,
            'rows' => $rows,
        ];
    }

    /**
     * Download Excel template for importing schedules.
     */
    public function importTemplate(Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $month = $request->query('month', now()->format('Y-m'));
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $daysInMonth = $end->day;

        $companySetting = \App\Models\CompanySetting::query()->where('user_id', $ownerId)->first();
        $internalCompanyName = ($companySetting?->name ?: 'Internal') . ' (Internal)';

        $employees = Employee::query()
            ->with('subCompany:id,name,code')
            ->where('user_id', $ownerId)
            ->active()
            ->get()
            ->sort(function (Employee $a, Employee $b): int {
                // Internal first
                $aIsInternal = empty($a->sub_company_id);
                $bIsInternal = empty($b->sub_company_id);

                if ($aIsInternal !== $bIsInternal) {
                    return $aIsInternal ? -1 : 1;
                }

                // If both are sub-companies, sort alphabetically by sub-company name
                if (! $aIsInternal && ! $bIsInternal) {
                    $aComp = strtolower(trim((string) ($a->subCompany?->name ?? '')));
                    $bComp = strtolower(trim((string) ($b->subCompany?->name ?? '')));
                    $cmp = strcmp($aComp, $bComp);
                    if ($cmp !== 0) {
                        return $cmp;
                    }
                }

                // Then sort by employee ID ascending
                return $a->id <=> $b->id;
            })
            ->values();

        $shifts = WorkShift::query()
            ->where('user_id', $ownerId)
            ->orderBy('code')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Jadwal');

        // Header info
        $sheet->setCellValue('A1', 'Employee ID');
        $sheet->setCellValue('B1', 'Employee Name');
        $sheet->setCellValue('C1', 'Bulan');
        $sheet->setCellValueExplicit('D1', $month, DataType::TYPE_STRING);
        $sheet->getStyle('A1:D1')->getFont()->setBold(true);

        // Header Table
        $sheet->setCellValue('A2', 'ID');
        $sheet->setCellValue('B2', 'Nama');
        $sheet->setCellValue('C2', 'Perusahaan');

        $col = 4;
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $sheet->setCellValue([$col, 2], $day);
            $col++;
        }
        $lastColIndex = 3 + $daysInMonth;
        $lastColLetter = Coordinate::stringFromColumnIndex($lastColIndex);

        // Header Table Styling
        $headerRange = 'A2:'.$lastColLetter.'2';
        $sheet->getStyle($headerRange)->getFont()->setBold(true);
        $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE2EFDA');

        $sampleShiftCode = $shifts->firstWhere('is_day_off', false)?->code ?? '0817';

        // Row 3: Example / Sample Row
        $sheet->setCellValue('A3', 'CONTOH');
        $sheet->setCellValue('B3', 'Contoh Format Pengisian (Abaikan / Hapus)');
        $sheet->setCellValue('C3', $internalCompanyName);
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dayOfWeek = $start->copy()->addDays($day - 1)->dayOfWeek;
            $code = in_array($dayOfWeek, [0, 6], true) ? 'OFF' : $sampleShiftCode;
            $sheet->setCellValue([3 + $day, 3], $code);
        }

        $sheet->getStyle('A3:'.$lastColLetter.'3')->getFont()->setItalic(true)->getColor()->setARGB('FF7F7F7F');
        $sheet->getStyle('A3:'.$lastColLetter.'3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2F2F2');
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Employee Data Rows starting from row 4
        $row = 4;
        foreach ($employees as $employee) {
            $companyName = $employee->sub_company_id && $employee->subCompany
                ? $employee->subCompany->name
                : $internalCompanyName;

            $sheet->setCellValue([1, $row], $employee->id);
            $sheet->setCellValue([2, $row], $employee->full_name);
            $sheet->setCellValue([3, $row], $companyName);
            $row++;
        }

        $lastDataRow = max(3, $row - 1);

        // Border styling for the data table
        $dataRange = 'A2:'.$lastColLetter.$lastDataRow;
        $sheet->getStyle($dataRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFD9D9D9');
        $sheet->getStyle($dataRange)->getBorders()->getOutline()->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setARGB('FF808080');

        // Alignments
        $sheet->getStyle('A2:A'.$lastDataRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('D2:'.$lastColLetter.$lastDataRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Table Keterangan Kode Jam Kerja
        $legendStartRow = $lastDataRow + 3;

        $sheet->setCellValue('A'.$legendStartRow, '=== TABEL KETERANGAN KODE JAM KERJA (HANYA REFERENSI - JANGAN UBAH TEKS INI) ===');
        $sheet->getStyle('A'.$legendStartRow)->getFont()->setBold(true)->getColor()->setARGB('FF1F4E78');

        $legendHeaderRow = $legendStartRow + 1;
        $sheet->setCellValue('A'.$legendHeaderRow, 'Kode Shift');
        $sheet->setCellValue('B'.$legendHeaderRow, 'Nama Shift');
        $sheet->setCellValue('C'.$legendHeaderRow, 'Jam Masuk');
        $sheet->setCellValue('D'.$legendHeaderRow, 'Jam Pulang');
        $sheet->setCellValue('E'.$legendHeaderRow, 'Tipe');

        $legendHeaderRange = 'A'.$legendHeaderRow.':E'.$legendHeaderRow;
        $sheet->getStyle($legendHeaderRange)->getFont()->setBold(true);
        $sheet->getStyle($legendHeaderRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFDDEBF7');
        $sheet->getStyle($legendHeaderRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $lRow = $legendHeaderRow + 1;
        foreach ($shifts as $shift) {
            $sheet->setCellValue('A'.$lRow, $shift->code);
            $sheet->setCellValue('B'.$lRow, $shift->name);
            $sheet->setCellValue('C'.$lRow, $shift->start_time ? Carbon::parse($shift->start_time)->format('H:i') : '-');
            $sheet->setCellValue('D'.$lRow, $shift->end_time ? Carbon::parse($shift->end_time)->format('H:i') : '-');
            $sheet->setCellValue('E'.$lRow, $shift->is_day_off ? 'Day Off (Libur)' : 'Hari Kerja');

            $sheet->getStyle('A'.$lRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('C'.$lRow.':E'.$lRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $lRow++;
        }

        $legendLastRow = max($legendHeaderRow + 1, $lRow - 1);
        $legendRange = 'A'.$legendHeaderRow.':E'.$legendLastRow;
        $sheet->getStyle($legendRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFD9D9D9');

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(10);
        $sheet->getColumnDimension('B')->setWidth(28);
        $sheet->getColumnDimension('C')->setWidth(24);
        for ($colIdx = 4; $colIdx <= $lastColIndex; $colIdx++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($colIdx))->setWidth(6);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Jadwal_'.$month.'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }

    /**
     * Import schedules from Excel.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
            'month' => ['nullable', 'string', 'max:20'],
        ]);

        $ownerId = $request->user()->accountOwnerId();

        $shifts = WorkShift::query()->where('user_id', $ownerId)->get();
        $shiftByCode = [];
        $shiftByName = [];
        foreach ($shifts as $shift) {
            $data = [
                'code' => $shift->code,
                'start_time' => $this->normalizeTime($shift->start_time),
                'end_time' => $this->normalizeTime($shift->end_time),
                'is_day_off' => (bool) $shift->is_day_off,
            ];
            $codeLower = strtolower(trim((string) $shift->code));
            $nameLower = strtolower(trim((string) $shift->name));

            $shiftByCode[$codeLower] = $data;
            $shiftByName[$nameLower] = $data;

            // Handle numeric shift codes with leading zero stripped by spreadsheet (e.g. "0817" -> "817", "0008" -> "8")
            $unpadded = ltrim($codeLower, '0');
            if ($unpadded !== '' && $unpadded !== $codeLower) {
                $shiftByCode[$unpadded] = $data;
            }

            // Also map 4-digit zero padded (e.g. if code was "817" and user typed "0817")
            if (is_numeric($codeLower) && strlen($codeLower) < 4) {
                $shiftByCode[str_pad($codeLower, 4, '0', STR_PAD_LEFT)] = $data;
            }
        }

        // Built-in OFF / Libur aliases
        $offData = [
            'code' => 'OFF',
            'start_time' => null,
            'end_time' => null,
            'is_day_off' => true,
        ];
        foreach (['off', 'libur', 'day off', 'dayoff', 'lbr', '-', 'holiday'] as $offAlias) {
            if (! isset($shiftByCode[$offAlias])) {
                $shiftByCode[$offAlias] = $offData;
            }
            if (! isset($shiftByName[$offAlias])) {
                $shiftByName[$offAlias] = $offData;
            }
        }

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();

        $month = $this->parseImportMonth($sheet, $request->input('month'));
        if (! $month || ! preg_match('/^\d{4}-\d{2}$/', $month)) {
            return back()->withErrors(['file' => 'Format bulan tidak valid. Pastikan kolom bulan terisi format YYYY-MM (misal: 2026-09).']);
        }

        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $daysInMonth = $start->copy()->endOfMonth()->day;

        $highestRow = $sheet->getHighestDataRow();
        $highestCol = $sheet->getHighestDataColumn();
        $highestColIndex = Coordinate::columnIndexFromString($highestCol);

        // Detect columns from Row 2
        $idColIndex = 1;
        $nameColIndex = 2;
        $dayColumns = []; // [dayNumber => columnIndex]

        for ($col = 1; $col <= $highestColIndex; $col++) {
            $headerVal = trim((string) $sheet->getCell([$col, 2])->getValue());
            if ($headerVal === '') {
                continue;
            }

            if (is_numeric($headerVal) && (int) $headerVal >= 1 && (int) $headerVal <= 31) {
                $dayColumns[(int) $headerVal] = $col;
            } elseif (in_array(strtolower($headerVal), ['id', 'employee id', 'nik', 'kode', 'kode pegawai'], true)) {
                $idColIndex = $col;
            } elseif (in_array(strtolower($headerVal), ['nama', 'name', 'nama pegawai', 'nama karyawan'], true)) {
                $nameColIndex = $col;
            }
        }

        // Fallback for dayColumns if row 2 didn't contain explicit day numbers
        if (empty($dayColumns)) {
            $hasCompanyCol = strtolower(trim((string) $sheet->getCell([3, 2])->getValue())) === 'perusahaan';
            $dayStartCol = $hasCompanyCol ? 4 : 3;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dayColumns[$d] = $dayStartCol + $d - 1;
            }
        }

        // Load employees of current owner for matching (supports ID, code, or name)
        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->get();

        $employeeById = $employees->keyBy('id');
        $employeeByCode = $employees->keyBy(fn ($e) => strtolower(trim((string) $e->employee_code)));
        $employeeByName = $employees->keyBy(fn ($e) => strtolower(trim((string) $e->full_name)));

        $rows = [];
        $errors = [];
        $now = now();

        for ($row = 3; $row <= $highestRow; $row++) {
            $rawId = $sheet->getCell([$idColIndex, $row])->getValue();
            $rawName = $sheet->getCell([$nameColIndex, $row])->getValue();

            $idStr = trim((string) $rawId);
            $nameStr = strtolower(trim((string) $rawName));

            // Stop if reached legend table at bottom
            if (str_starts_with($idStr, '===') || str_contains($idStr, 'TABEL KETERANGAN') || strtolower($idStr) === 'kode shift') {
                break;
            }

            // Skip example / sample row
            if (strtoupper($idStr) === 'CONTOH' || strtoupper($nameStr) === 'CONTOH' || str_contains($nameStr, 'contoh format')) {
                continue;
            }

            // Skip empty rows
            if ($idStr === '' && $nameStr === '') {
                continue;
            }

            // Match employee by ID, employee_code, or full_name
            $employee = null;
            if ($idStr !== '' && is_numeric($idStr) && $employeeById->has((int) $idStr)) {
                $employee = $employeeById->get((int) $idStr);
            } elseif ($idStr !== '' && $employeeByCode->has(strtolower($idStr))) {
                $employee = $employeeByCode->get(strtolower($idStr));
            } elseif ($nameStr !== '' && $employeeByName->has($nameStr)) {
                $employee = $employeeByName->get($nameStr);
            }

            if (! $employee) {
                // Check if this row actually has shift data before reporting error
                $hasAnyData = false;
                foreach ($dayColumns as $dayCol) {
                    if (! empty($sheet->getCell([$dayCol, $row])->getValue())) {
                        $hasAnyData = true;
                        break;
                    }
                }
                if ($hasAnyData) {
                    $errors[] = "Baris {$row}: Karyawan '{$rawId}' - '{$rawName}' tidak ditemukan.";
                }
                continue;
            }

            for ($day = 1; $day <= $daysInMonth; $day++) {
                if (! isset($dayColumns[$day])) {
                    continue;
                }

                $col = $dayColumns[$day];
                $shiftInput = $sheet->getCell([$col, $row])->getValue();

                if ($shiftInput === null || trim((string) $shiftInput) === '') {
                    continue;
                }

                $shiftInputStr = strtolower(trim((string) $shiftInput));
                $template = null;

                if (isset($shiftByCode[$shiftInputStr])) {
                    $template = $shiftByCode[$shiftInputStr];
                } elseif (isset($shiftByName[$shiftInputStr])) {
                    $template = $shiftByName[$shiftInputStr];
                } elseif (is_numeric($shiftInputStr)) {
                    $padded = str_pad($shiftInputStr, 4, '0', STR_PAD_LEFT);
                    if (isset($shiftByCode[$padded])) {
                        $template = $shiftByCode[$padded];
                    }
                }

                if (! $template) {
                    $errors[] = "Baris {$row}, Tanggal {$day}: Kode shift '{$shiftInput}' tidak valid.";
                    continue;
                }

                $rows[] = [
                    'user_id' => $ownerId,
                    'employee_id' => $employee->id,
                    'work_date' => $start->copy()->addDays($day - 1)->toDateString(),
                    'shift_code' => $template['code'],
                    'start_time' => $template['start_time'],
                    'end_time' => $template['end_time'],
                    'is_day_off' => $template['is_day_off'],
                    'notes' => 'Imported via Excel',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (! empty($errors)) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 5)) . (count($errors) > 5 ? ' ...dan ' . (count($errors) - 5) . ' kesalahan lainnya.' : '')]);
        }

        if (empty($rows)) {
            return back()->withErrors(['file' => 'Tidak ada data jadwal yang berhasil diimpor. Pastikan baris karyawan dan kode shift sudah terisi.']);
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            EmployeeSchedule::query()->upsert(
                $chunk,
                ['employee_id', 'work_date'],
                ['shift_code', 'start_time', 'end_time', 'is_day_off', 'notes', 'updated_at']
            );
        }

        return back()->with('success', sprintf('Berhasil mengimpor %d jadwal karyawan untuk bulan %s.', count($rows), $month));
    }

    /**
     * Safely resolve import month from sheet header or request.
     */
    private function parseImportMonth($sheet, ?string $requestMonth): ?string
    {
        // Try cells D1, B1, C1, E1, A1 in row 1
        foreach (['D1', 'B1', 'C1', 'E1', 'A1'] as $cellCoordinate) {
            $cell = $sheet->getCell($cellCoordinate);
            $val = $cell->getValue();

            if ($val !== null && $val !== '') {
                // If it is an Excel date serial number
                if (is_numeric($val) && (float) $val > 30000 && (float) $val < 60000) {
                    try {
                        return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $val)->format('Y-m');
                    } catch (\Throwable) {
                    }
                }

                if ($val instanceof \DateTimeInterface) {
                    return $val->format('Y-m');
                }

                $valStr = trim((string) $val);

                if (preg_match('/^(\d{4})[-_\/.](\d{1,2})$/', $valStr, $matches)) {
                    return sprintf('%04d-%02d', (int) $matches[1], (int) $matches[2]);
                }

                if (preg_match('/^(\d{1,2})[-_\/.](\d{4})$/', $valStr, $matches)) {
                    return sprintf('%04d-%02d', (int) $matches[2], (int) $matches[1]);
                }

                try {
                    $parsed = Carbon::parse($valStr);
                    if ($parsed->year >= 2000 && $parsed->year <= 2100) {
                        return $parsed->format('Y-m');
                    }
                } catch (\Throwable) {
                }
            }

            // Also test formatted value
            try {
                $formatted = trim((string) $cell->getFormattedValue());
                if (preg_match('/^(\d{4})[-_\/.](\d{1,2})$/', $formatted, $matches)) {
                    return sprintf('%04d-%02d', (int) $matches[1], (int) $matches[2]);
                }
                $parsed = Carbon::parse($formatted);
                if ($parsed->year >= 2000 && $parsed->year <= 2100) {
                    return $parsed->format('Y-m');
                }
            } catch (\Throwable) {
            }
        }

        // Fallback to request parameter
        if ($requestMonth && preg_match('/^\d{4}-\d{2}$/', $requestMonth)) {
            return $requestMonth;
        }

        return null;
    }

    /**
     * Normalize DB time string to HH:mm format.
     */
    private function normalizeTime(?string $time): ?string
    {
        if ($time === null || $time === '') {
            return null;
        }

        return Carbon::parse($time)->format('H:i');
    }

    /**
     * Built-in shift templates used by roster generation.
     *
     * @return array<string, array{start_time: null|string, end_time: null|string, is_day_off: bool}>
     */
    private function shiftTemplates(int $ownerId): array
    {
        return WorkShift::query()
            ->where('user_id', $ownerId)
            ->orderByRaw('CASE WHEN is_day_off = 1 THEN 0 ELSE 1 END')
            ->orderBy('code')
            ->get()
            ->mapWithKeys(fn (WorkShift $shift) => [
                $shift->code => [
                    'start_time' => $this->normalizeTime($shift->start_time),
                    'end_time' => $this->normalizeTime($shift->end_time),
                    'is_day_off' => $shift->is_day_off,
                ],
            ])
            ->all();
    }

    /**
     * List available shift masters.
     *
     * @return array<int, array<string, mixed>>
     */
    private function availableShifts(int $ownerId): array
    {
        return WorkShift::query()
            ->where('user_id', $ownerId)
            ->orderByRaw('CASE WHEN is_day_off = 1 THEN 0 ELSE 1 END')
            ->orderBy('code')
            ->get()
            ->map(fn (WorkShift $shift) => [
                'id' => $shift->id,
                'code' => $shift->code,
                'name' => $shift->name,
                'start_time' => $this->normalizeTime($shift->start_time),
                'end_time' => $this->normalizeTime($shift->end_time),
                'is_day_off' => $shift->is_day_off,
                'late_tolerance_minutes' => $shift->late_tolerance_minutes,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function holidaysForMonth(int $ownerId, string $month): array
    {
        $start = Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        return PublicHoliday::query()
            ->where('user_id', $ownerId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date')
            ->orderBy('name')
            ->get()
            ->map(fn (PublicHoliday $holiday): array => [
                'id' => $holiday->id,
                'date' => $holiday->date->toDateString(),
                'name' => $holiday->name,
                'holiday_type' => $holiday->holiday_type ?? ($holiday->is_national_holiday ? 'national' : 'joint_leave'),
                'is_national_holiday' => (bool) $holiday->is_national_holiday,
            ])
            ->all();
    }

    private function shiftHasRelatedData(WorkShift $shift, int $ownerId): bool
    {
        return EmployeeSchedule::query()
            ->where('user_id', $ownerId)
            ->where('shift_code', $shift->code)
            ->exists()
            || EmployeeAttendance::query()
                ->where('user_id', $ownerId)
                ->where('shift_id', $shift->id)
                ->exists()
            || ShiftChangeRequest::query()
                ->where('user_id', $ownerId)
                ->where(function ($query) use ($shift): void {
                    $query
                        ->where('current_shift_id', $shift->id)
                        ->orWhere('requested_shift_id', $shift->id);
                })
                ->exists();
    }

    /**
     * Generate shift code from start and end time using HHHH format.
     */
    private function generateShiftCode(?string $startTime, ?string $endTime, bool $isDayOff): string
    {
        if ($isDayOff || $startTime === null || $endTime === null || $startTime === '' || $endTime === '') {
            return 'OFF';
        }

        return Carbon::createFromFormat('H:i', $startTime)->format('H')
            .Carbon::createFromFormat('H:i', $endTime)->format('H');
    }
}
