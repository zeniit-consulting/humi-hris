<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\StoreAttendanceRequest;
use App\Http\Requests\Hris\UpdateAttendanceRequest;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\SubCompanyAttendanceLocation;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\AttendanceStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $ownerId = $request->user()->accountOwnerId();
        $timezone = $this->deviceTimezone($request);

        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'period' => ['nullable', 'date_format:Y-m'],
            'status' => ['nullable', Rule::in(['present', 'late', 'on_leave', 'absent'])],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'sort_by' => ['nullable', 'in:employee,check_in_at,check_out_at,attendance_date'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = EmployeeAttendance::query()
            ->with(['employee:id,employee_code,first_name,last_name', 'shift:id,code,name,start_time,end_time,is_day_off,late_tolerance_minutes'])
            ->when(($validated['status'] ?? '') !== '', fn ($builder) => $builder->where('status', $validated['status']))
            ->when(isset($validated['employee_id']), fn ($builder) => $builder->where('employee_id', $validated['employee_id']));

        if ($this->isSelfServiceUser($user)) {
            $employee = $this->resolveRequiredSelfServiceEmployee($user);
            $query->where('employee_id', $employee->id);
        }

        if (isset($validated['date'])) {
            $query->whereDate('attendance_date', $validated['date']);
        } elseif (isset($validated['period'])) {
            $start = Carbon::createFromFormat('Y-m-d', $validated['period'].'-01')->startOfMonth();
            $end = $start->copy()->endOfMonth();
            $query->whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()]);
        } else {
            $query->whereDate('attendance_date', Carbon::today($timezone)->toDateString());
        }

        $summary = (clone $query)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $sortBy = $validated['sort_by'] ?? 'attendance_date';
        $sortDir = $validated['sort_dir'] ?? 'desc';

        if ($sortBy === 'check_in_at') {
            $query->orderByRaw('check_in_at IS NULL')->orderBy('check_in_at', $sortDir);
        } elseif ($sortBy === 'check_out_at') {
            $query->orderByRaw('check_out_at IS NULL')->orderBy('check_out_at', $sortDir);
        } elseif ($sortBy === 'employee') {
            $query->orderBy('employee_id', $sortDir);
        } else {
            $query->orderBy('attendance_date', $sortDir)->orderByDesc('id');
        }

        $paginator = $query
            ->paginate((int) ($validated['per_page'] ?? 20))
            ->withQueryString();

        return $this->success([
            'summary' => [
                'present' => (int) ($summary['present'] ?? 0),
                'late' => (int) ($summary['late'] ?? 0),
                'on_leave' => (int) ($summary['on_leave'] ?? 0),
                'absent' => (int) ($summary['absent'] ?? 0),
            ],
            'items' => collect($paginator->items())->map(fn (EmployeeAttendance $attendance) => $this->payload($attendance, $timezone))->values(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAttendanceRequest $request, AttendanceStatusService $statusService): JsonResponse
    {
        $validated = $request->validated();
        /** @var User $user */
        $user = $request->user();
        $timezone = $this->deviceTimezone($request);
        $this->normalizeAttendanceTimestamps($validated, $timezone);

        if ($this->isSelfServiceUser($user)) {
            $employee = $this->resolveRequiredSelfServiceEmployee($user);
            $validated['employee_id'] = $employee->id;
            $validated['status'] = 'present';
            $this->ensureWithinAttendanceRadius(
                $user,
                $employee,
                $validated['check_in_latitude'] ?? null,
                $validated['check_in_longitude'] ?? null,
            );
        }

        $openAttendance = EmployeeAttendance::query()
            ->with('shift:id,code,name,start_time,end_time,is_day_off')
            ->where('employee_id', $validated['employee_id'])
            ->whereNull('check_out_at')
            ->whereDate('attendance_date', '>=', Carbon::parse($validated['attendance_date'])->subDay()->toDateString())
            ->orderByDesc('attendance_date')
            ->orderByDesc('id')
            ->get()
            ->first(fn (EmployeeAttendance $attendance): bool => $this->isCurrentOpenAttendance(
                $attendance,
                $this->attendanceReferenceTime($validated, $timezone),
                $timezone,
            ));

        if ($openAttendance) {
            return $this->error('Masih ada absensi yang belum clock out.');
        }

        $existingAttendance = EmployeeAttendance::query()
            ->where('employee_id', $validated['employee_id'])
            ->whereDate('attendance_date', $validated['attendance_date'])
            ->first();

        if ($existingAttendance) {
            return $this->error('Absensi untuk tanggal ini sudah ada.');
        }

        $validated['shift_id'] ??= $this->resolveAttendanceShiftId(
            $validated['employee_id'],
            $validated['attendance_date'],
            $validated['check_in_at'] ?? null,
            $user->accountOwnerId(),
            $timezone,
        );

        $payload = [
            'employee_id' => $validated['employee_id'],
            'shift_id' => $validated['shift_id'] ?? null,
            'attendance_date' => $validated['attendance_date'],
            'status' => $validated['status'],
            'check_in_at' => $validated['check_in_at'] ?? null,
            'check_in_latitude' => $validated['check_in_latitude'] ?? null,
            'check_in_longitude' => $validated['check_in_longitude'] ?? null,
            'check_out_at' => $validated['check_out_at'] ?? null,
            'check_out_latitude' => $validated['check_out_latitude'] ?? null,
            'check_out_longitude' => $validated['check_out_longitude'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ];

        $payload['status'] = $statusService->resolveStatus($payload, $user->accountOwnerId(), $timezone);

        $attendance = EmployeeAttendance::query()->create($payload);

        $attendance->load(['employee:id,employee_code,first_name,last_name', 'shift:id,code,name,start_time,end_time,is_day_off,late_tolerance_minutes']);

        return $this->success($this->payload($attendance, $timezone), 'Absensi berhasil disimpan.', 201);
    }

    public function update(UpdateAttendanceRequest $request, EmployeeAttendance $employeeAttendance, AttendanceStatusService $statusService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->guardSelfServiceRecordOwnership($user, (int) $employeeAttendance->employee_id);

        $validated = $request->validated();
        $timezone = $this->deviceTimezone($request);
        $this->normalizeAttendanceTimestamps($validated, $timezone);

        if ($this->isSelfServiceUser($user)) {
            $employee = $this->resolveRequiredSelfServiceEmployee($user);
            $validated['employee_id'] = $employee->id;
            $validated['status'] = $employeeAttendance->status ?: 'present';

            if (($validated['check_out_at'] ?? null) !== null) {
                $this->ensureWithinAttendanceRadius(
                    $user,
                    $employee,
                    $validated['check_out_latitude'] ?? null,
                    $validated['check_out_longitude'] ?? null,
                );
            }
        }

        if (
            $employeeAttendance->check_out_at !== null
            && ! $request->boolean('force', false)
        ) {
            return $this->error('Absensi ini sudah clock out.');
        }

        if ($employeeAttendance->attendance_date->lt(Carbon::today($timezone)->subDays(3))) {
            return $this->error('Clock out hanya bisa dilakukan maksimal 3 hari dari tanggal absensi.');
        }

        $validated['status'] = $statusService->resolveStatus($validated, $user->accountOwnerId(), $timezone);

        $employeeAttendance->update($validated);
        $employeeAttendance->refresh()->load(['employee:id,employee_code,first_name,last_name', 'shift:id,code,name,start_time,end_time,is_day_off,late_tolerance_minutes']);

        return $this->success($this->payload($employeeAttendance, $timezone), 'Absensi berhasil diperbarui.');
    }

    public function destroy(Request $request, EmployeeAttendance $employeeAttendance): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->guardSelfServiceRecordOwnership($user, (int) $employeeAttendance->employee_id);

        $employeeAttendance->delete();

        return $this->success(null, 'Absensi berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(EmployeeAttendance $attendance, ?string $timezone = null): array
    {
        $timezone ??= config('app.timezone');

        return [
            'id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'employee_label' => $attendance->employee
                ? $attendance->employee->employee_code.' - '.$attendance->employee->full_name
                : '-',
            'attendance_date' => $attendance->attendance_date?->format('Y-m-d'),
            'status' => $attendance->status,
            'shift' => $attendance->shift ? [
                'id' => $attendance->shift->id,
                'code' => $attendance->shift->code,
                'name' => $attendance->shift->name,
                'start_time' => $attendance->shift->start_time,
                'end_time' => $attendance->shift->end_time,
                'is_day_off' => $attendance->shift->is_day_off,
                'late_tolerance_minutes' => $attendance->shift->late_tolerance_minutes,
            ] : null,
            'check_in_at' => $this->localTimestamp($attendance->check_in_at, $timezone),
            'check_in_latitude' => $attendance->check_in_latitude,
            'check_in_longitude' => $attendance->check_in_longitude,
            'check_out_at' => $this->localTimestamp($attendance->check_out_at, $timezone),
            'check_out_latitude' => $attendance->check_out_latitude,
            'check_out_longitude' => $attendance->check_out_longitude,
            'notes' => $attendance->notes,
        ];
    }

    private function deviceTimezone(Request $request): string
    {
        $timezone = (string) $request->header('X-Timezone', config('app.timezone'));

        return in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : config('app.timezone');
    }

    /**
     * Normalize incoming device-local attendance times to one persisted instant.
     *
     * @param  array<string, mixed>  $validated
     */
    private function normalizeAttendanceTimestamps(array &$validated, string $timezone): void
    {
        foreach (['check_in_at', 'check_out_at'] as $key) {
            if (! array_key_exists($key, $validated) || $validated[$key] === null || $validated[$key] === '') {
                continue;
            }

            $validated[$key] = $this->deviceLocalDateTime((string) $validated[$key], $timezone);
        }
    }

    private function resolveAttendanceShiftId(
        int $employeeId,
        string $attendanceDate,
        mixed $checkInAt,
        int $ownerId,
        string $timezone,
    ): ?int {
        $scheduledShiftCode = EmployeeSchedule::query()
            ->where('user_id', $ownerId)
            ->where('employee_id', $employeeId)
            ->whereDate('work_date', Carbon::parse($attendanceDate)->toDateString())
            ->value('shift_code');

        if ($scheduledShiftCode) {
            return WorkShift::query()
                ->where('user_id', $ownerId)
                ->where('code', $scheduledShiftCode)
                ->value('id');
        }

        if ($checkInAt === null || $checkInAt === '') {
            return null;
        }

        $checkIn = Carbon::parse((string) $checkInAt, config('app.timezone'))->setTimezone($timezone);
        $checkInMinute = ((int) $checkIn->format('H')) * 60 + (int) $checkIn->format('i');

        return WorkShift::query()
            ->where('user_id', $ownerId)
            ->where('is_day_off', false)
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->get(['id', 'start_time', 'end_time'])
            ->map(function (WorkShift $shift) use ($checkInMinute): array {
                $startMinute = $this->timeToMinute((string) $shift->start_time);
                $endMinute = $this->timeToMinute((string) $shift->end_time);
                $withinShift = $this->minuteFallsWithinShift($checkInMinute, $startMinute, $endMinute);

                return [
                    'id' => (int) $shift->id,
                    'within_shift' => $withinShift,
                    'distance' => $this->minuteDistance($checkInMinute, $startMinute),
                ];
            })
            ->sortBy([
                ['within_shift', 'desc'],
                ['distance', 'asc'],
                ['id', 'asc'],
            ])
            ->first()['id'] ?? null;
    }

    private function timeToMinute(string $time): int
    {
        [$hour, $minute] = array_map('intval', explode(':', substr($time, 0, 5)));

        return ($hour * 60) + $minute;
    }

    private function minuteFallsWithinShift(int $minute, int $startMinute, int $endMinute): bool
    {
        if ($startMinute === $endMinute) {
            return false;
        }

        if ($startMinute < $endMinute) {
            return $minute >= $startMinute && $minute <= $endMinute;
        }

        return $minute >= $startMinute || $minute <= $endMinute;
    }

    private function minuteDistance(int $left, int $right): int
    {
        $distance = abs($left - $right);

        return min($distance, 1440 - $distance);
    }

    private function deviceLocalDateTime(string $value, string $timezone): string
    {
        $hasTimezone = (bool) preg_match('/(?:Z|[+-]\d{2}:?\d{2})$/i', $value);
        $date = $hasTimezone
            ? Carbon::parse($value)
            : Carbon::parse($value, $timezone);

        return $date->utc()->format('Y-m-d H:i:s');
    }

    private function localTimestamp(mixed $value, string $timezone): ?string
    {
        if ($value === null) {
            return null;
        }

        return Carbon::parse($value, config('app.timezone'))->setTimezone($timezone)->toIso8601String();
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function attendanceReferenceTime(array $validated, string $timezone): Carbon
    {
        if (! empty($validated['check_in_at'])) {
            return Carbon::parse((string) $validated['check_in_at'], config('app.timezone'))->setTimezone($timezone);
        }

        return Carbon::now($timezone);
    }

    private function isCurrentOpenAttendance(EmployeeAttendance $attendance, Carbon $referenceTime, string $timezone): bool
    {
        $attendanceDate = $attendance->attendance_date?->copy()->setTimezone($timezone)->toDateString();
        $referenceDate = $referenceTime->copy()->setTimezone($timezone)->toDateString();

        if ($attendanceDate === null) {
            return false;
        }

        if ($attendanceDate === $referenceDate) {
            return true;
        }

        $shift = $attendance->shift;

        if (! $shift || $shift->is_day_off || $shift->start_time === null || $shift->end_time === null) {
            return false;
        }

        $start = Carbon::parse($attendanceDate.' '.$shift->start_time, $timezone);
        $end = Carbon::parse($attendanceDate.' '.$shift->end_time, $timezone);

        if ($end->greaterThan($start)) {
            return false;
        }

        return $referenceTime->copy()->setTimezone($timezone)->lte($end->addDay());
    }

    private function ensureWithinAttendanceRadius(User $user, Employee $employee, mixed $latitude, mixed $longitude): void
    {
        if ($latitude === null || $longitude === null) {
            return;
        }

        $locations = collect();

        if ($employee->sub_company_id !== null) {
            $locations = SubCompanyAttendanceLocation::query()
                ->where('user_id', $user->accountOwnerId())
                ->where('sub_company_id', $employee->sub_company_id)
                ->where('is_active', true)
                ->get()
                ->map(fn (SubCompanyAttendanceLocation $location) => [
                    'latitude' => (float) $location->latitude,
                    'longitude' => (float) $location->longitude,
                    'radius_meters' => $location->radius_meters,
                ]);

            if ($locations->isEmpty()) {
                abort(422, 'Lokasi absensi sub-company belum dikonfigurasi.');
            }
        }

        $setting = CompanySetting::query()
            ->where('user_id', $user->accountOwnerId())
            ->first();

        if (! $setting && $locations->isEmpty()) {
            return;
        }

        if ($locations->isEmpty() && $setting) {
            $locations = collect($setting->attendance_locations ?? [])
                ->map(fn (array $location) => [
                    'latitude' => $location['latitude'] ?? null,
                    'longitude' => $location['longitude'] ?? null,
                    'radius_meters' => (int) ($location['radius_meters'] ?? ($setting->attendance_radius_meters ?? 100)),
                ])
                ->filter(fn (array $location) => $location['latitude'] !== null && $location['longitude'] !== null)
                ->values();
        }

        if ($locations->isEmpty() && $setting?->location_latitude !== null && $setting?->location_longitude !== null) {
            $locations = collect([[
                'latitude' => (float) $setting->location_latitude,
                'longitude' => (float) $setting->location_longitude,
                'radius_meters' => (int) ($setting->attendance_radius_meters ?? 100),
            ]]);
        }

        if ($locations->isEmpty()) {
            return;
        }

        $isInsideAnyLocation = $locations->contains(function (array $location) use ($latitude, $longitude): bool {
            $distance = $this->calculateDistanceMeters(
                (float) $latitude,
                (float) $longitude,
                (float) $location['latitude'],
                (float) $location['longitude'],
            );

            return $distance <= (int) $location['radius_meters'];
        });

        if (! $isInsideAnyLocation) {
            abort(422, 'Lokasi Anda berada di luar radius absensi yang diizinkan.');
        }
    }

    private function calculateDistanceMeters(
        float $latitudeA,
        float $longitudeA,
        float $latitudeB,
        float $longitudeB,
    ): float {
        $earthRadius = 6371000;
        $latitudeDelta = deg2rad($latitudeB - $latitudeA);
        $longitudeDelta = deg2rad($longitudeB - $longitudeA);

        $a = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($latitudeA))
            * cos(deg2rad($latitudeB))
            * sin($longitudeDelta / 2) ** 2;

        return 2 * $earthRadius * asin(min(1, sqrt($a)));
    }
}
