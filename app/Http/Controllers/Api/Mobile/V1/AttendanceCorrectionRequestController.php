<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrectionRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class AttendanceCorrectionRequestController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $timezone = $this->deviceTimezone($request);

        $requests = AttendanceCorrectionRequest::query()
            ->with('shift:id,code,name,start_time,end_time,is_day_off')
            ->where('user_id', $user->accountOwnerId())
            ->where('employee_id', $employee->id)
            ->latest('attendance_date')
            ->latest('id')
            ->limit(15)
            ->get();

        return $this->success([
            'items' => $requests->map(fn (AttendanceCorrectionRequest $request) => $this->payload($request, $timezone))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $ownerId = $user->accountOwnerId();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $timezone = $this->deviceTimezone($request);

        $validated = $request->validate([
            'attendance_date' => ['required', 'date', 'before_or_equal:today'],
            'shift_id' => ['nullable', 'integer', Rule::exists('work_shifts', 'id')->where('user_id', $ownerId)],
            'check_in_at' => ['nullable', 'date'],
            'check_out_at' => ['nullable', 'date', 'after_or_equal:check_in_at'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        if (empty($validated['check_in_at']) && empty($validated['check_out_at'])) {
            return $this->error('Jam masuk atau jam pulang wajib diisi.');
        }

        $this->normalizeAttendanceTimestamps($validated, $timezone);

        $attendanceRequest = AttendanceCorrectionRequest::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employee->id,
            'attendance_date' => $validated['attendance_date'],
            'shift_id' => $validated['shift_id'] ?? null,
            'check_in_at' => $validated['check_in_at'] ?? null,
            'check_out_at' => $validated['check_out_at'] ?? null,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        $attendanceRequest->load('shift:id,code,name,start_time,end_time,is_day_off');

        return $this->success($this->payload($attendanceRequest, $timezone), 'Pengajuan absensi berhasil dikirim.', 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(AttendanceCorrectionRequest $request, ?string $timezone = null): array
    {
        $timezone ??= config('app.timezone');

        return [
            'id' => $request->id,
            'attendance_date' => $request->attendance_date?->format('Y-m-d'),
            'shift' => $request->shift ? [
                'id' => $request->shift->id,
                'code' => $request->shift->code,
                'name' => $request->shift->name,
                'start_time' => $request->shift->start_time,
                'end_time' => $request->shift->end_time,
                'is_day_off' => $request->shift->is_day_off,
            ] : null,
            'check_in_at' => $this->localTimestamp($request->check_in_at, $timezone),
            'check_out_at' => $this->localTimestamp($request->check_out_at, $timezone),
            'reason' => $request->reason,
            'status' => $request->status,
            'rejection_reason' => $request->rejection_reason,
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
}
