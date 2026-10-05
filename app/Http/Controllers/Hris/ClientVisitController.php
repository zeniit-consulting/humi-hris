<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeClientVisit;
use App\Models\Position;
use App\Models\SubCompanyAttendanceLocation;
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
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'status' => ['nullable', Rule::in(['completed', 'in_progress'])],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $startDate = $validated['start_date'] ?? $validated['date'] ?? Carbon::today($timezone)->toDateString();
        $endDate = $validated['end_date'] ?? $validated['date'] ?? $startDate;

        $filters = [
            'date' => $startDate,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'division_id' => isset($validated['division_id']) ? (string) $validated['division_id'] : '',
            'position_id' => isset($validated['position_id']) ? (string) $validated['position_id'] : '',
            'status' => $validated['status'] ?? '',
            'search' => $validated['search'] ?? '',
        ];

        $baseQuery = EmployeeClientVisit::query()
            ->with([
                'employee:id,employee_code,first_name,last_name,division_id,position_id',
                'employee.division:id,name',
                'employee.position:id,name',
            ])
            ->where('user_id', $ownerId)
            ->when($filters['start_date'] === $filters['end_date'], fn ($q) => $q->whereDate('visit_date', $filters['start_date']))
            ->when($filters['start_date'] !== $filters['end_date'], fn ($q) => $q->whereDate('visit_date', '>=', $filters['start_date'])->whereDate('visit_date', '<=', $filters['end_date']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->when($filters['division_id'] !== '', fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('division_id', $filters['division_id'])))
            ->when($filters['position_id'] !== '', fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('position_id', $filters['position_id'])))
            ->when($filters['status'] === 'completed', fn ($query) => $query->whereNotNull('clock_out_at'))
            ->when($filters['status'] === 'in_progress', fn ($query) => $query->whereNull('clock_out_at'))
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $terms = array_filter(explode(' ', trim($filters['search'])));
                $query->where(function ($sub) use ($terms) {
                    foreach ($terms as $term) {
                        $like = '%'.$term.'%';
                        $sub->where(function ($w) use ($like) {
                            $w->where('client_name', 'like', $like)
                                ->orWhere('work_description', 'like', $like)
                                ->orWhere('notes', 'like', $like)
                                ->orWhereHas('employee', function ($emp) use ($like) {
                                    $emp->where('first_name', 'like', $like)
                                        ->orWhere('last_name', 'like', $like)
                                        ->orWhere('employee_code', 'like', $like);
                                });
                        });
                    }
                });
            });

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

        $completedCount = $summaryVisits->filter(fn (EmployeeClientVisit $v) => $v->clock_out_at !== null)->count();
        $inProgressCount = $summaryVisits->filter(fn (EmployeeClientVisit $v) => $v->clock_out_at === null)->count();
        $totalSeconds = (int) $summaryVisits->sum(fn (EmployeeClientVisit $visit) => $this->durationSeconds($visit));

        $employeeSummaries = $summaryVisits
            ->groupBy('employee_id')
            ->map(fn ($empVisits) => $this->employeeSummaryPayload($empVisits, $timezone))
            ->values();

        $companySetting = CompanySetting::query()
            ->where('user_id', $ownerId)
            ->first();

        $officeLocations = collect();

        if ($companySetting && $companySetting->location_latitude !== null && $companySetting->location_longitude !== null) {
            $officeLocations->push([
                'id' => 'office-primary',
                'name' => $companySetting->location_name ?: ($companySetting->name ?: 'Kantor Pusat'),
                'address' => $companySetting->location_address,
                'latitude' => (float) $companySetting->location_latitude,
                'longitude' => (float) $companySetting->location_longitude,
                'radius_meters' => (int) ($companySetting->attendance_radius_meters ?? 100),
                'is_primary' => true,
            ]);
        }

        if ($companySetting && ! empty($companySetting->attendance_locations) && is_array($companySetting->attendance_locations)) {
            foreach ($companySetting->attendance_locations as $idx => $loc) {
                if (! empty($loc['latitude']) && ! empty($loc['longitude'])) {
                    $officeLocations->push([
                        'id' => 'office-setting-'.($loc['id'] ?? $idx),
                        'name' => $loc['name'] ?? 'Cabang / Lokasi Kantor',
                        'address' => $loc['address'] ?? null,
                        'latitude' => (float) $loc['latitude'],
                        'longitude' => (float) $loc['longitude'],
                        'radius_meters' => (int) ($loc['radius_meters'] ?? ($companySetting->attendance_radius_meters ?? 100)),
                        'is_primary' => false,
                    ]);
                }
            }
        }

        $subCompanyLocations = SubCompanyAttendanceLocation::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->get();

        foreach ($subCompanyLocations as $subLoc) {
            $officeLocations->push([
                'id' => 'office-sub-'.$subLoc->id,
                'name' => $subLoc->name,
                'address' => $subLoc->address,
                'latitude' => (float) $subLoc->latitude,
                'longitude' => (float) $subLoc->longitude,
                'radius_meters' => (int) ($subLoc->radius_meters ?? 100),
                'is_primary' => false,
            ]);
        }

        $uniqueOfficeLocations = $officeLocations
            ->unique(fn ($loc) => sprintf('%.5f,%.5f', $loc['latitude'], $loc['longitude']))
            ->values()
            ->all();

        return Inertia::render('hris/client-visits/index', [
            'visits' => $visits,
            'filters' => $filters,
            'employees' => $employees,
            'divisions' => Division::query()->orderBy('name')->get(['id', 'name']),
            'positions' => Position::query()->orderBy('name')->get(['id', 'name', 'division_id']),
            'office_locations' => $uniqueOfficeLocations,
            'summary' => [
                'total_visits' => $summaryVisits->count(),
                'completed_visits' => $completedCount,
                'in_progress_visits' => $inProgressCount,
                'total_duration_seconds' => $totalSeconds,
                'total_duration_label' => $this->durationLabel($totalSeconds),
                'total_employees' => $employeeSummaries->count(),
                'employees' => $employeeSummaries,
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
            'employee_code' => $first->employee?->employee_code,
            'employee_name' => $first->employee?->full_name,
            'division' => $first->employee?->division?->name,
            'position' => $first->employee?->position?->name,
            'total_visits' => $visits->count(),
            'completed_visits' => $visits->filter(fn (EmployeeClientVisit $v) => $v->clock_out_at !== null)->count(),
            'in_progress_visits' => $visits->filter(fn (EmployeeClientVisit $v) => $v->clock_out_at === null)->count(),
            'total_duration_seconds' => $totalSeconds,
            'total_duration_label' => $this->durationLabel($totalSeconds),
            'route_points' => $visits->map(fn (EmployeeClientVisit $visit) => [
                'id' => $visit->id,
                'client_name' => $visit->client_name,
                'work_description' => $visit->work_description,
                'visit_date' => $visit->visit_date?->format('Y-m-d'),
                'clock_in_at' => $this->localTimestamp($visit->clock_in_at, $timezone),
                'clock_in_latitude' => $visit->clock_in_latitude,
                'clock_in_longitude' => $visit->clock_in_longitude,
                'clock_out_at' => $this->localTimestamp($visit->clock_out_at, $timezone),
                'clock_out_latitude' => $visit->clock_out_latitude,
                'clock_out_longitude' => $visit->clock_out_longitude,
                'duration_label' => $this->durationLabel($this->durationSeconds($visit)),
                'status' => $visit->clock_out_at ? 'completed' : 'in_progress',
                'notes' => $visit->notes,
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
            'employee_code' => $visit->employee?->employee_code,
            'employee_name' => $visit->employee?->full_name,
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
