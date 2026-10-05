<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\SubCompanyAttendanceLocation;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\AttendanceStatusService;
use App\Services\AutoOvertimeService;
use App\Support\AttendancePhoto;
use App\Support\R2Storage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class BackupAttendanceController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    /**
     * Get list of eligible colleagues for backup attendance (same company / sub-company).
     */
    public function colleagues(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        if (! CompanySetting::backupAttendanceEnabledFor($user)) {
            return $this->error('Fitur backup absensi sedang dinonaktifkan.', 403);
        }

        $ownerId = $user->accountOwnerId();
        $query = Employee::query()
            ->where('user_id', $ownerId)
            ->where('id', '!=', $employee->id)
            ->where('employment_status', '!=', 'resigned')
            ->when(
                $employee->sub_company_id !== null,
                fn ($q) => $q->where('sub_company_id', $employee->sub_company_id),
                fn ($q) => $q->whereNull('sub_company_id')
            )
            ->with(['position:id,name', 'subCompany:id,name,code']);

        $today = today();
        $colleagues = $query->orderBy('first_name')->get();

        $todayAttendances = EmployeeAttendance::query()
            ->whereIn('employee_id', $colleagues->pluck('id'))
            ->whereDate('attendance_date', $today)
            ->get();

        $todayBackups = EmployeeAttendance::query()
            ->where('is_backup', true)
            ->whereIn('backup_for_employee_id', $colleagues->pluck('id'))
            ->whereDate('attendance_date', $today)
            ->get();

        $todaySchedules = EmployeeSchedule::query()
            ->whereIn('employee_id', $colleagues->pluck('id'))
            ->whereDate('work_date', $today)
            ->get()
            ->keyBy('employee_id');

        $colleaguePayload = $colleagues->map(function (Employee $colleague) use ($todayAttendances, $todayBackups, $todaySchedules) {
            $hasAtt = $todayAttendances->firstWhere('employee_id', $colleague->id);
            $hasBackup = $todayBackups->firstWhere('backup_for_employee_id', $colleague->id);
            $schedule = $todaySchedules->get($colleague->id);

            $hasActiveAttendance = ($hasAtt && in_array($hasAtt->status, ['present', 'late'])) || $hasBackup !== null;

            return [
                'id' => $colleague->id,
                'employee_code' => $colleague->employee_code,
                'first_name' => $colleague->first_name,
                'last_name' => $colleague->last_name,
                'full_name' => $colleague->full_name,
                'position_name' => $colleague->position?->name ?? 'Staf',
                'sub_company_name' => $colleague->subCompany?->name,
                'is_wfa' => (bool) $colleague->is_wfa,
                'has_attendance_today' => $hasActiveAttendance,
                'attendance_status' => $hasAtt?->status ?? ($hasBackup ? 'backed_up' : 'none'),
                'today_shift' => $schedule ? [
                    'code' => $schedule->shift_code,
                    'name' => $schedule->shift_name ?? $schedule->shift_code,
                    'is_day_off' => (bool) $schedule->is_day_off,
                ] : null,
            ];
        });

        return $this->success([
            'colleagues' => $colleaguePayload,
        ], 'Daftar rekan kerja berhasil diambil.');
    }

    /**
     * Get backup status for the current employee (active backup, today backups, recent history).
     */
    public function status(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $isEnabled = CompanySetting::backupAttendanceEnabledFor($user);
        $timezone = $this->deviceTimezone($request, $employee->timezone);

        $activeBackup = EmployeeAttendance::query()
            ->with(['backupForEmployee:id,employee_code,first_name,last_name', 'shift:id,code,name,start_time,end_time'])
            ->where('employee_id', $employee->id)
            ->where('is_backup', true)
            ->whereNull('check_out_at')
            ->orderByDesc('id')
            ->first();

        $todayBackups = EmployeeAttendance::query()
            ->with(['backupForEmployee:id,employee_code,first_name,last_name', 'shift:id,code,name,start_time,end_time'])
            ->where('employee_id', $employee->id)
            ->where('is_backup', true)
            ->whereDate('attendance_date', today())
            ->orderByDesc('id')
            ->get();

        $recentHistory = EmployeeAttendance::query()
            ->with(['backupForEmployee:id,employee_code,first_name,last_name', 'shift:id,code,name,start_time,end_time'])
            ->where('employee_id', $employee->id)
            ->where('is_backup', true)
            ->orderByDesc('attendance_date')
            ->orderByDesc('id')
            ->limit(15)
            ->get();

        $formatAttendance = function (?EmployeeAttendance $att) use ($timezone) {
            if (! $att) {
                return null;
            }

            return [
                'id' => $att->id,
                'attendance_date' => $att->attendance_date?->format('Y-m-d'),
                'status' => $att->status,
                'is_backup' => true,
                'backup_for_employee' => $att->backupForEmployee ? [
                    'id' => $att->backupForEmployee->id,
                    'employee_code' => $att->backupForEmployee->employee_code,
                    'full_name' => $att->backupForEmployee->full_name,
                ] : null,
                'shift' => $att->shift ? [
                    'id' => $att->shift->id,
                    'code' => $att->shift->code,
                    'name' => $att->shift->name,
                    'start_time' => $att->shift->start_time,
                    'end_time' => $att->shift->end_time,
                ] : null,
                'check_in_at' => $att->check_in_at ? Carbon::parse($att->check_in_at)->setTimezone($timezone)->format('Y-m-d H:i:s') : null,
                'check_out_at' => $att->check_out_at ? Carbon::parse($att->check_out_at)->setTimezone($timezone)->format('Y-m-d H:i:s') : null,
                'check_in_photo_url' => $att->check_in_photo_url,
                'check_out_photo_url' => $att->check_out_photo_url,
                'notes' => $att->notes,
            ];
        };

        return $this->success([
            'is_enabled' => $isEnabled,
            'active_backup' => $formatAttendance($activeBackup),
            'today_backups' => $todayBackups->map($formatAttendance)->values(),
            'recent_history' => $recentHistory->map($formatAttendance)->values(),
        ], 'Status backup kehadiran berhasil diambil.');
    }

    /**
     * Clock in as backup attendance for colleague X.
     */
    public function checkIn(Request $request, AttendanceStatusService $statusService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        if (! CompanySetting::backupAttendanceEnabledFor($user)) {
            return $this->error('Fitur backup absensi sedang dinonaktifkan.', 403);
        }

        $validated = $request->validate([
            'backup_for_employee_id' => ['required', 'integer'],
            'check_in_latitude' => ['nullable', 'numeric'],
            'check_in_longitude' => ['nullable', 'numeric'],
            'check_in_photo' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $ownerId = $user->accountOwnerId();
        $timezone = $this->deviceTimezone($request, $employee->timezone);

        $lockKey = "backup_att_store_{$employee->id}_{$validated['backup_for_employee_id']}";

        return Cache::lock($lockKey, 10)->block(5, function () use ($validated, $user, $employee, $ownerId, $timezone, $statusService): JsonResponse {
            // Check if current employee already has an unclosed backup attendance
            $openBackup = EmployeeAttendance::query()
                ->where('employee_id', $employee->id)
                ->where('is_backup', true)
                ->whereNull('check_out_at')
                ->first();

            if ($openBackup) {
                return $this->error('Masih ada absensi backup yang belum clock out.', 422);
            }

            // Verify colleague X exists and is in the same company / sub-company
            $targetEmployee = Employee::query()
                ->where('user_id', $ownerId)
                ->where('id', $validated['backup_for_employee_id'])
                ->where('id', '!=', $employee->id)
                ->where('employment_status', '!=', 'resigned')
                ->when(
                    $employee->sub_company_id !== null,
                    fn ($q) => $q->where('sub_company_id', $employee->sub_company_id),
                    fn ($q) => $q->whereNull('sub_company_id')
                )
                ->first();

            if (! $targetEmployee) {
                return $this->error('Karyawan yang dipilih tidak terdaftar dalam company atau sub-company yang sama.', 422);
            }

            // Check if colleague X already attended work today
            $targetAttendance = EmployeeAttendance::query()
                ->where('employee_id', $targetEmployee->id)
                ->whereDate('attendance_date', today())
                ->whereIn('status', ['present', 'late'])
                ->first();

            if ($targetAttendance) {
                return $this->error('Karyawan yang dipilih sudah melakukan absensi kehadiran hari ini.', 422);
            }

            // Check if colleague X was already backed up today
            $existingBackup = EmployeeAttendance::query()
                ->where('is_backup', true)
                ->where('backup_for_employee_id', $targetEmployee->id)
                ->whereDate('attendance_date', today())
                ->whereNotNull('check_in_at')
                ->first();

            if ($existingBackup) {
                return $this->error('Karyawan yang dipilih sudah dibackup hari ini.', 422);
            }

            // Check location radius if onsite
            $this->ensureWithinAttendanceRadius(
                $user,
                $employee,
                $validated['check_in_latitude'] ?? null,
                $validated['check_in_longitude'] ?? null
            );

            // Process photo if provided
            $checkInPhotoUrl = null;
            if (! empty($validated['check_in_photo'])) {
                $photoResult = AttendancePhoto::validate($validated['check_in_photo']);
                if (! $photoResult['valid']) {
                    return $this->error($photoResult['error'] ?? 'Foto presensi backup tidak valid atau blank.', 422);
                }
                $checkInPhotoUrl = AttendancePhoto::storePhoto(
                    $photoResult['binary'],
                    'backup_in',
                    (int) $employee->id,
                    $photoResult['ext'] ?? 'jpg'
                );
            }

            // Resolve shift: use User X's shift today if available, or default shift
            $todayDate = today()->toDateString();
            $targetSchedule = EmployeeSchedule::query()
                ->where('employee_id', $targetEmployee->id)
                ->whereDate('work_date', $todayDate)
                ->first();

            $shiftId = null;
            if ($targetSchedule && $targetSchedule->shift_code) {
                $shift = WorkShift::query()
                    ->where('user_id', $ownerId)
                    ->where('code', $targetSchedule->shift_code)
                    ->first();
                $shiftId = $shift?->id;
            }

            if (! $shiftId) {
                $defaultShift = WorkShift::query()
                    ->where('user_id', $ownerId)
                    ->where('is_day_off', false)
                    ->first();
                $shiftId = $defaultShift?->id;
            }

            $now = now()->setTimezone(config('app.timezone'));

            $notesText = 'Backup kehadiran untuk '.$targetEmployee->full_name.(! empty($validated['notes']) ? ' ('.$validated['notes'].')' : '');

            $payload = [
                'user_id' => $ownerId,
                'employee_id' => $employee->id,
                'shift_id' => $shiftId,
                'is_backup' => true,
                'backup_for_employee_id' => $targetEmployee->id,
                'backup_by_employee_id' => $employee->id,
                'attendance_date' => $todayDate,
                'timezone' => $timezone,
                'status' => 'present',
                'check_in_at' => $now,
                'check_in_latitude' => $validated['check_in_latitude'] ?? null,
                'check_in_longitude' => $validated['check_in_longitude'] ?? null,
                'check_in_photo_url' => $checkInPhotoUrl,
                'notes' => $notesText,
            ];

            $statusAttrs = $statusService->resolveStatusAttributes($payload, $ownerId, $timezone);
            $payload = array_merge($payload, $statusAttrs);

            $attendance = EmployeeAttendance::query()->create($payload);

            // Record User X as absent and backed up by User Y
            $userXRow = EmployeeAttendance::query()
                ->where('employee_id', $targetEmployee->id)
                ->whereDate('attendance_date', $todayDate)
                ->first();

            if ($userXRow) {
                $userXRow->update([
                    'notes' => 'Tidak hadir kerja - Dibackup oleh '.$employee->full_name,
                    'backup_by_employee_id' => $employee->id,
                ]);
            } else {
                EmployeeAttendance::query()->create([
                    'user_id' => $ownerId,
                    'employee_id' => $targetEmployee->id,
                    'shift_id' => $shiftId,
                    'is_backup' => true,
                    'backup_for_employee_id' => $targetEmployee->id,
                    'backup_by_employee_id' => $employee->id,
                    'attendance_date' => $todayDate,
                    'timezone' => $timezone,
                    'status' => 'absent',
                    'notes' => 'Tidak hadir kerja - Dibackup oleh '.$employee->full_name,
                ]);
            }

            $attendance->load([
                'backupForEmployee:id,employee_code,first_name,last_name',
                'shift:id,code,name,start_time,end_time',
            ]);

            return $this->success($attendance, 'Absensi backup berhasil dicatat.', 201);
        });
    }

    /**
     * Clock out active backup attendance for the current employee.
     */
    public function checkOut(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        if (! CompanySetting::backupAttendanceEnabledFor($user)) {
            return $this->error('Fitur backup absensi sedang dinonaktifkan.', 403);
        }

        $validated = $request->validate([
            'check_out_latitude' => ['nullable', 'numeric'],
            'check_out_longitude' => ['nullable', 'numeric'],
            'check_out_photo' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->where('is_backup', true)
            ->whereNull('check_out_at')
            ->orderByDesc('id')
            ->first();

        if (! $attendance) {
            return $this->error('Tidak ada absensi backup aktif yang perlu di-clock out.', 422);
        }

        // Check location radius if onsite
        $this->ensureWithinAttendanceRadius(
            $user,
            $employee,
            $validated['check_out_latitude'] ?? null,
            $validated['check_out_longitude'] ?? null
        );

        $checkOutPhotoUrl = null;
        if (! empty($validated['check_out_photo'])) {
            $photoResult = AttendancePhoto::validate($validated['check_out_photo']);
            if (! $photoResult['valid']) {
                return $this->error($photoResult['error'] ?? 'Foto presensi backup tidak valid atau blank.', 422);
            }
            $checkOutPhotoUrl = AttendancePhoto::storePhoto(
                $photoResult['binary'],
                'backup_out',
                (int) $employee->id,
                $photoResult['ext'] ?? 'jpg'
            );
        }

        $now = now()->setTimezone(config('app.timezone'));
        $updateData = [
            'check_out_at' => $now,
            'check_out_latitude' => $validated['check_out_latitude'] ?? null,
            'check_out_longitude' => $validated['check_out_longitude'] ?? null,
        ];

        if ($checkOutPhotoUrl) {
            $updateData['check_out_photo_url'] = $checkOutPhotoUrl;
        }

        if (! empty($validated['notes'])) {
            $updateData['notes'] = $attendance->notes ? $attendance->notes.' | '.$validated['notes'] : $validated['notes'];
        }

        $attendance->update($updateData);

        $timezone = $this->deviceTimezone($request, $employee->timezone);
        app(AutoOvertimeService::class)->syncFromAttendance($attendance, $user->accountOwnerId(), $timezone);

        $attendance->load([
            'backupForEmployee:id,employee_code,first_name,last_name',
            'shift:id,code,name,start_time,end_time',
        ]);

        return $this->success($attendance, 'Clock out backup berhasil dicatat.');
    }

    private function ensureWithinAttendanceRadius(User $user, Employee $employee, mixed $latitude, mixed $longitude): void
    {
        if ($employee->is_wfa) {
            return;
        }

        $locations = $this->attendanceLocationsForEmployee($user, $employee);

        if ($locations->isEmpty()) {
            return;
        }

        if ($latitude === null || $longitude === null) {
            abort(422, 'Koordinat lokasi wajib diaktifkan untuk absensi onsite.');
        }

        $isWithinAny = $locations->contains(function (array $location) use ($latitude, $longitude) {
            $distance = $this->calculateDistanceMeters(
                (float) $latitude,
                (float) $longitude,
                (float) $location['latitude'],
                (float) $location['longitude']
            );

            return $distance <= (float) $location['radius_meters'];
        });

        if (! $isWithinAny) {
            abort(422, 'Anda berada di luar radius lokasi absensi yang ditentukan.');
        }
    }

    /**
     * @return Collection<int, array{name: string, latitude: float, longitude: float, radius_meters: int}>
     */
    private function attendanceLocationsForEmployee(User $user, Employee $employee): Collection
    {
        if ($employee->sub_company_id !== null) {
            return SubCompanyAttendanceLocation::query()
                ->where('user_id', $user->accountOwnerId())
                ->where('sub_company_id', $employee->sub_company_id)
                ->where('is_active', true)
                ->get()
                ->map(fn (SubCompanyAttendanceLocation $loc) => [
                    'name' => $loc->name,
                    'latitude' => (float) $loc->latitude,
                    'longitude' => (float) $loc->longitude,
                    'radius_meters' => (int) $loc->radius_meters,
                ]);
        }

        $setting = CompanySetting::query()
            ->where('user_id', $user->accountOwnerId())
            ->first();

        $list = collect($setting?->attendance_locations ?? []);

        if ($setting?->location_latitude && $setting?->location_longitude) {
            $list->prepend([
                'name' => $setting->location_name ?: 'Kantor Utama',
                'latitude' => (float) $setting->location_latitude,
                'longitude' => (float) $setting->location_longitude,
                'radius_meters' => (int) ($setting->attendance_radius_meters ?? 100),
            ]);
        }

        return $list;
    }

    private function calculateDistanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    private function deviceTimezone(Request $request, ?string $fallback = null): string
    {
        $headerTimezone = (string) $request->header('X-Timezone', '');
        if ($this->validTimezone($headerTimezone)) {
            return $headerTimezone;
        }

        if ($fallback && $this->validTimezone($fallback)) {
            return $fallback;
        }

        return config('app.timezone', 'Asia/Jakarta');
    }

    private function validTimezone(mixed $timezone): bool
    {
        return is_string($timezone) && in_array($timezone, timezone_identifiers_list(), true);
    }
}
