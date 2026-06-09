<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\EmployeeClientVisit;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PortalClientVisitController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $timezone = $this->deviceTimezone($request);

        $validated = $request->validate([
            'date' => ['nullable', 'date'],
        ]);

        $date = $validated['date'] ?? Carbon::today($timezone)->toDateString();

        $visits = EmployeeClientVisit::query()
            ->where('employee_id', $employee->id)
            ->whereDate('visit_date', $date)
            ->orderByDesc('clock_in_at')
            ->get();

        return $this->success([
            'date' => $date,
            'items' => $visits->map(fn (EmployeeClientVisit $visit) => $this->payload($visit, $timezone))->values(),
        ], 'Kunjungan client berhasil dimuat.');
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $timezone = $this->deviceTimezone($request);

        $validated = $request->validate([
            'client_name' => ['required', 'string', 'max:255'],
            'work_description' => ['required', 'string', 'max:5000'],
            'clock_in_at' => ['required', 'date'],
            'clock_in_latitude' => ['required', 'numeric', 'between:-90,90'],
            'clock_in_longitude' => ['required', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $clockInAt = $this->deviceLocalDateTime((string) $validated['clock_in_at'], $timezone);
        $visitDate = Carbon::parse($clockInAt, config('app.timezone'))->setTimezone($timezone)->toDateString();

        $visit = EmployeeClientVisit::query()->create([
            'user_id' => $user->accountOwnerId(),
            'employee_id' => $employee->id,
            'client_name' => $validated['client_name'],
            'work_description' => $validated['work_description'],
            'visit_date' => $visitDate,
            'clock_in_at' => $clockInAt,
            'clock_in_latitude' => $validated['clock_in_latitude'],
            'clock_in_longitude' => $validated['clock_in_longitude'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return $this->success($this->payload($visit, $timezone), 'Kunjungan client dimulai.', 201);
    }

    public function clockOut(Request $request, EmployeeClientVisit $visit): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        abort_unless($visit->employee_id === $employee->id, 404);

        if ($visit->clock_out_at !== null) {
            return $this->error('Kunjungan ini sudah clock out.');
        }

        $timezone = $this->deviceTimezone($request);
        $validated = $request->validate([
            'clock_out_at' => ['required', 'date'],
            'clock_out_latitude' => ['required', 'numeric', 'between:-90,90'],
            'clock_out_longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $clockOutAt = $this->deviceLocalDateTime((string) $validated['clock_out_at'], $timezone);

        if (Carbon::parse($clockOutAt)->lt($visit->clock_in_at)) {
            return $this->error('Waktu clock out tidak boleh sebelum clock in.');
        }

        $visit->update([
            'clock_out_at' => $clockOutAt,
            'clock_out_latitude' => $validated['clock_out_latitude'],
            'clock_out_longitude' => $validated['clock_out_longitude'],
        ]);

        return $this->success($this->payload($visit->refresh(), $timezone), 'Kunjungan client selesai.');
    }

    private function payload(EmployeeClientVisit $visit, string $timezone): array
    {
        $durationSeconds = $this->durationSeconds($visit);

        return [
            'id' => $visit->id,
            'employee_id' => $visit->employee_id,
            'client_name' => $visit->client_name,
            'work_description' => $visit->work_description,
            'visit_date' => $visit->visit_date?->format('Y-m-d'),
            'clock_in_at' => $this->localTimestamp($visit->clock_in_at, $timezone),
            'clock_in_latitude' => $visit->clock_in_latitude,
            'clock_in_longitude' => $visit->clock_in_longitude,
            'clock_out_at' => $this->localTimestamp($visit->clock_out_at, $timezone),
            'clock_out_latitude' => $visit->clock_out_latitude,
            'clock_out_longitude' => $visit->clock_out_longitude,
            'duration_seconds' => $durationSeconds,
            'duration_label' => $this->durationLabel($durationSeconds),
            'status' => $visit->clock_out_at ? 'completed' : 'in_progress',
            'notes' => $visit->notes,
        ];
    }

    private function durationSeconds(EmployeeClientVisit $visit): int
    {
        $end = $visit->clock_out_at ?? now();

        return max(0, $visit->clock_in_at->diffInSeconds($end));
    }

    private function durationLabel(int $seconds): string
    {
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);

        return $hours > 0 ? "{$hours}j {$minutes}m" : "{$minutes}m";
    }

    private function deviceTimezone(Request $request): string
    {
        $timezone = (string) $request->header('X-Timezone', config('app.timezone'));

        return in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : config('app.timezone');
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
