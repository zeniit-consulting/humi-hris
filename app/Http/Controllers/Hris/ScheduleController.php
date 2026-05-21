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

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end = Carbon::parse($validated['end_date'])->startOfDay();
        $cursor = $start->copy();

        $rows = [];
        $index = 0;

        while ($cursor->lte($end)) {
            $shiftCode = $pattern[$index % count($pattern)];
            $template = $templates[$shiftCode] ?? $templates['OFF'];

            $rows[] = [
                'user_id' => $ownerId,
                'employee_id' => $validated['employee_id'],
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
            $cursor->addDay();
        }

        EmployeeSchedule::query()->upsert(
            $rows,
            ['employee_id', 'work_date'],
            ['shift_code', 'start_time', 'end_time', 'is_day_off', 'notes', 'updated_at']
        );

        return back();
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
                'is_national_holiday' => (bool) $holiday['is_national_holiday'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values();

        if ($holidayRows->isNotEmpty()) {
            PublicHoliday::query()->upsert(
                $holidayRows->all(),
                ['user_id', 'date', 'name'],
                ['is_national_holiday', 'updated_at'],
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

            $cursor->addDay();
        }

        return $days;
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
                'is_national_holiday' => $holiday->is_national_holiday,
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
