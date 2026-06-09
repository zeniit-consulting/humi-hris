<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeClientVisit;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientVisitController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $timezone = $this->deviceTimezone($request);

        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
        ]);

        $filters = [
            'date' => $validated['date'] ?? Carbon::today($timezone)->toDateString(),
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'division_id' => isset($validated['division_id']) ? (string) $validated['division_id'] : '',
            'position_id' => isset($validated['position_id']) ? (string) $validated['position_id'] : '',
        ];

        $baseQuery = EmployeeClientVisit::query()
            ->with([
                'employee:id,employee_code,first_name,last_name,division_id,position_id',
                'employee.division:id,name',
                'employee.position:id,name',
            ])
            ->whereDate('visit_date', $filters['date'])
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->when($filters['division_id'] !== '', fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('division_id', $filters['division_id'])))
            ->when($filters['position_id'] !== '', fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('position_id', $filters['position_id'])));

        $summaryVisits = (clone $baseQuery)
            ->orderBy('employee_id')
            ->orderBy('clock_in_at')
            ->get();

        $visits = (clone $baseQuery)
            ->orderBy('clock_in_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (EmployeeClientVisit $visit) => $this->visitPayload($visit, $timezone));

        $employees = Employee::query()
            ->with(['division:id,name', 'position:id,name'])
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'division_id', 'position_id'])
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
                'division_id' => $employee->division_id,
                'position_id' => $employee->position_id,
            ]);

        return Inertia::render('hris/client-visits/index', [
            'visits' => $visits,
            'filters' => $filters,
            'employees' => $employees,
            'divisions' => Division::query()->orderBy('name')->get(['id', 'name']),
            'positions' => Position::query()->orderBy('name')->get(['id', 'name', 'division_id']),
            'summary' => [
                'total_visits' => $summaryVisits->count(),
                'total_duration_seconds' => $summaryVisits->sum(fn (EmployeeClientVisit $visit) => $this->durationSeconds($visit)),
                'total_duration_label' => $this->durationLabel((int) $summaryVisits->sum(fn (EmployeeClientVisit $visit) => $this->durationSeconds($visit))),
                'employees' => $summaryVisits
                    ->groupBy('employee_id')
                    ->map(fn ($visits) => $this->employeeSummaryPayload($visits, $timezone))
                    ->values(),
            ],
        ]);
    }

    private function employeeSummaryPayload($visits, string $timezone): array
    {
        /** @var EmployeeClientVisit $first */
        $first = $visits->first();
        $totalSeconds = (int) $visits->sum(fn (EmployeeClientVisit $visit) => $this->durationSeconds($visit));

        return [
            'employee_id' => $first->employee_id,
            'employee_label' => $this->employeeLabel($first),
            'total_visits' => $visits->count(),
            'total_duration_seconds' => $totalSeconds,
            'total_duration_label' => $this->durationLabel($totalSeconds),
            'route_points' => $visits->map(fn (EmployeeClientVisit $visit) => [
                'id' => $visit->id,
                'client_name' => $visit->client_name,
                'clock_in_at' => $this->localTimestamp($visit->clock_in_at, $timezone),
                'clock_in_latitude' => $visit->clock_in_latitude,
                'clock_in_longitude' => $visit->clock_in_longitude,
                'clock_out_at' => $this->localTimestamp($visit->clock_out_at, $timezone),
                'clock_out_latitude' => $visit->clock_out_latitude,
                'clock_out_longitude' => $visit->clock_out_longitude,
            ])->values(),
        ];
    }

    private function visitPayload(EmployeeClientVisit $visit, string $timezone): array
    {
        $durationSeconds = $this->durationSeconds($visit);

        return [
            'id' => $visit->id,
            'employee_id' => $visit->employee_id,
            'employee_label' => $this->employeeLabel($visit),
            'division' => $visit->employee?->division?->name,
            'position' => $visit->employee?->position?->name,
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

    private function employeeLabel(EmployeeClientVisit $visit): string
    {
        return $visit->employee
            ? $visit->employee->employee_code.' - '.$visit->employee->full_name
            : '-';
    }

    private function durationSeconds(EmployeeClientVisit $visit): int
    {
        $end = $visit->clock_out_at ?? now();

        return (int) max(0, $visit->clock_in_at->diffInSeconds($end));
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

    private function localTimestamp(mixed $value, string $timezone): ?string
    {
        if ($value === null) {
            return null;
        }

        return Carbon::parse($value, config('app.timezone'))->setTimezone($timezone)->toIso8601String();
    }
}
