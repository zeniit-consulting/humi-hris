<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Employee;
use App\Models\PerformanceCheckIn;
use App\Models\PerformanceKeyResult;
use App\Models\PerformanceKpiMetric;
use App\Models\PerformanceKpiResult;
use App\Models\PerformanceKpiTemplate;
use App\Models\PerformanceObjective;
use App\Models\PerformancePeriod;
use App\Models\PerformanceReview;
use App\Models\Position;
use App\Services\PerformanceScoringService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceController extends Controller
{
    public function __construct(
        private readonly PerformanceScoringService $scoringService,
    ) {}

    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $managerEmployeeId = $this->managerEmployeeId($request);
        $canManageAll = $this->canManageAll($request);

        $rawFilters = $request->validate([
            'period_id' => ['nullable', 'integer', Rule::exists('performance_periods', 'id')->where('user_id', $ownerId)],
            'status' => ['nullable', 'string', Rule::in(PerformanceReview::STATUSES)],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'manager_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $filters = [
            'period_id' => isset($rawFilters['period_id']) ? (string) $rawFilters['period_id'] : '',
            'status' => $rawFilters['status'] ?? '',
            'division_id' => isset($rawFilters['division_id']) ? (string) $rawFilters['division_id'] : '',
            'position_id' => isset($rawFilters['position_id']) ? (string) $rawFilters['position_id'] : '',
            'manager_id' => isset($rawFilters['manager_id']) ? (string) $rawFilters['manager_id'] : '',
            'search' => $rawFilters['search'] ?? '',
        ];

        $reviewsQuery = PerformanceReview::query()
            ->with([
                'period:id,name,starts_at,ends_at,status',
                'employee:id,employee_code,first_name,last_name,division_id,position_id',
                'employee.division:id,name',
                'employee.position:id,name',
                'manager:id,employee_code,first_name,last_name',
                'objectives.keyResults',
                'kpiResults',
                'checkIns' => fn ($query) => $query
                    ->with('kpiResult:id,performance_review_id,name,unit,target_value,actual_value,score')
                    ->latest('check_in_date')
                    ->latest(),
            ])
            ->when(! $canManageAll, fn ($query) => $query->where('manager_id', $managerEmployeeId ?: 0))
            ->when($filters['period_id'] !== '', fn ($query) => $query->where('performance_period_id', $filters['period_id']))
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['manager_id'] !== '', fn ($query) => $query->where('manager_id', $filters['manager_id']))
            ->when($filters['division_id'] !== '', fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('division_id', $filters['division_id'])))
            ->when($filters['position_id'] !== '', fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('position_id', $filters['position_id'])))
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $query->whereHas('employee', function ($employeeQuery) use ($filters): void {
                    $employeeQuery
                        ->where('employee_code', 'like', '%'.$filters['search'].'%')
                        ->orWhere('first_name', 'like', '%'.$filters['search'].'%')
                        ->orWhere('last_name', 'like', '%'.$filters['search'].'%');
                });
            });

        $statsSource = (clone $reviewsQuery)->get(['id', 'status', 'okr_score', 'kpi_score', 'final_score']);

        $reviews = $reviewsQuery
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (PerformanceReview $review) => $this->reviewPayload($review));

        $periods = PerformancePeriod::query()
            ->withCount('reviews')
            ->latest('starts_at')
            ->get()
            ->map(fn (PerformancePeriod $period) => $this->periodPayload($period));

        $templates = PerformanceKpiTemplate::query()
            ->with(['division:id,name', 'position:id,name', 'metrics'])
            ->withCount('metrics')
            ->orderBy('name')
            ->get()
            ->map(fn (PerformanceKpiTemplate $template) => $this->templatePayload($template));

        $employees = Employee::query()
            ->with(['division:id,name', 'position:id,name'])
            ->when(! $canManageAll, fn ($query) => $query->where('manager_id', $managerEmployeeId ?: 0))
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'division_id', 'position_id', 'manager_id'])
            ->map(fn (Employee $employee) => $this->employeeOption($employee));

        $allEmployees = Employee::query()
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name'])
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]);

        return Inertia::render('hris/performances/index', [
            'reviews' => $reviews,
            'periods' => $periods,
            'templates' => $templates,
            'employees' => $employees,
            'managerOptions' => $allEmployees,
            'divisions' => Division::query()->orderBy('name')->get(['id', 'name']),
            'positions' => Position::query()->orderBy('name')->get(['id', 'name', 'division_id']),
            'filters' => $filters,
            'statusOptions' => PerformanceReview::STATUSES,
            'periodStatusOptions' => PerformancePeriod::STATUSES,
            'objectiveStatusOptions' => PerformanceObjective::STATUSES,
            'checkInStatusOptions' => PerformanceCheckIn::STATUSES,
            'attendanceMetricOptions' => PerformanceKpiMetric::ATTENDANCE_METRICS,
            'stats' => [
                'average_final_score' => round((float) $statsSource->avg('final_score'), 2),
                'at_risk' => $statsSource->filter(fn (PerformanceReview $review): bool => $review->status !== 'not_started' && ((float) $review->final_score < 60 || (float) $review->okr_score < 60 || (float) $review->kpi_score < 60))->count(),
                'pending_reviews' => $statsSource->whereNotIn('status', ['completed', 'locked'])->count(),
                'completed_reviews' => $statsSource->whereIn('status', ['completed', 'locked'])->count(),
            ],
            'permissions' => [
                'can_manage_all' => $canManageAll,
                'manager_employee_id' => $managerEmployeeId,
            ],
        ]);
    }

    public function storePeriod(Request $request): RedirectResponse
    {
        $this->authorizeMasterData($request);

        PerformancePeriod::query()->create($this->periodPayloadFromRequest($request));

        return back();
    }

    public function updatePeriod(Request $request, PerformancePeriod $period): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $payload = $this->periodPayloadFromRequest($request, $period);

        DB::transaction(function () use ($period, $payload): void {
            $period->update($payload);

            if ($period->status === 'closed') {
                $period->reviews()->update([
                    'status' => 'locked',
                    'locked_at' => now(),
                ]);
            } elseif ($period->wasChanged('status')) {
                $period->reviews()
                    ->where('status', 'locked')
                    ->update([
                        'status' => 'completed',
                        'locked_at' => null,
                    ]);
            }
        });

        return back();
    }

    public function storeTemplate(Request $request): RedirectResponse
    {
        $this->authorizeMasterData($request);

        PerformanceKpiTemplate::query()->create($this->templatePayloadFromRequest($request));

        return back();
    }

    public function updateTemplate(Request $request, PerformanceKpiTemplate $template): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $template->update($this->templatePayloadFromRequest($request));

        return back();
    }

    public function destroyTemplate(Request $request, PerformanceKpiTemplate $template): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $template->delete();

        return back();
    }

    public function storeMetric(Request $request, PerformanceKpiTemplate $template): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $template->metrics()->create([
            ...$this->metricPayloadFromRequest($request),
            'user_id' => $request->user()->accountOwnerId(),
        ]);

        return back();
    }

    public function updateMetric(Request $request, PerformanceKpiMetric $metric): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $metric->update($this->metricPayloadFromRequest($request));

        return back();
    }

    public function destroyMetric(Request $request, PerformanceKpiMetric $metric): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $metric->delete();

        return back();
    }

    public function storeAttendanceDefaults(Request $request, PerformanceKpiTemplate $template): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $defaults = [
            ['name' => 'Attendance Rate', 'unit' => '%', 'target_value' => 95, 'weight' => 1, 'attendance_metric' => 'attendance_rate', 'direction' => 'higher_is_better'],
            ['name' => 'On-time Rate', 'unit' => '%', 'target_value' => 90, 'weight' => 1, 'attendance_metric' => 'on_time_rate', 'direction' => 'higher_is_better'],
            ['name' => 'Late Count', 'unit' => 'hari', 'target_value' => 2, 'weight' => 1, 'attendance_metric' => 'late_count', 'direction' => 'lower_is_better'],
            ['name' => 'Absent Count', 'unit' => 'hari', 'target_value' => 0, 'weight' => 1, 'attendance_metric' => 'absent_count', 'direction' => 'lower_is_better'],
        ];

        foreach ($defaults as $default) {
            $template->metrics()->firstOrCreate(
                ['attendance_metric' => $default['attendance_metric']],
                [
                    ...$default,
                    'user_id' => $request->user()->accountOwnerId(),
                    'input_type' => 'attendance',
                ],
            );
        }

        return back();
    }

    public function storeReview(Request $request): RedirectResponse
    {
        $this->authorizeMasterData($request);

        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'performance_period_id' => ['required', 'integer', Rule::exists('performance_periods', 'id')->where('user_id', $ownerId)],
            'employee_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
                Rule::unique('performance_reviews', 'employee_id')->where('performance_period_id', $request->integer('performance_period_id')),
            ],
            'manager_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);

        $period = PerformancePeriod::query()->findOrFail($validated['performance_period_id']);

        if ($period->isClosed()) {
            throw ValidationException::withMessages(['performance_period_id' => 'Periode yang sudah closed tidak bisa menerima review baru.']);
        }

        $employee = Employee::query()->findOrFail($validated['employee_id']);

        $review = DB::transaction(function () use ($ownerId, $validated, $employee): PerformanceReview {
            $review = PerformanceReview::query()->create([
                'user_id' => $ownerId,
                'performance_period_id' => $validated['performance_period_id'],
                'employee_id' => $employee->id,
                'manager_id' => $validated['manager_id'] ?? $employee->manager_id,
                'status' => 'not_started',
            ]);

            $this->scoringService->prefillKpisFromTemplates($review);
            $this->scoringService->syncAttendanceKpis($review);

            return $this->scoringService->recalculateReview($review);
        });

        return back()->with('success', 'Review performance dibuat untuk '.$review->employee?->full_name.'.');
    }

    public function updateReview(Request $request, PerformanceReview $review): RedirectResponse
    {
        $this->authorizeReview($request, $review);
        $this->ensureEditable($review);

        $validated = $request->validate([
            'manager_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $request->user()->accountOwnerId())],
            'status' => ['required', Rule::in(PerformanceReview::STATUSES)],
            'manager_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'manager_notes' => ['nullable', 'string', 'max:5000'],
            'strengths' => ['nullable', 'string', 'max:5000'],
            'improvement_areas' => ['nullable', 'string', 'max:5000'],
            'next_action' => ['nullable', 'string', 'max:5000'],
        ]);

        if (! $this->canManageAll($request)) {
            unset($validated['manager_id']);
        }

        $review->update([
            ...$validated,
            'reviewed_at' => $validated['manager_score'] !== null ? now() : $review->reviewed_at,
        ]);

        $this->scoringService->syncAttendanceKpis($review);
        $this->scoringService->recalculateReview($review);

        return back();
    }

    public function storeObjective(Request $request, PerformanceReview $review): RedirectResponse
    {
        $this->authorizeReview($request, $review);
        $this->ensureEditable($review);

        $review->objectives()->create([
            ...$this->objectivePayloadFromRequest($request),
            'user_id' => $request->user()->accountOwnerId(),
        ]);

        $review->update(['status' => $review->status === 'not_started' ? 'in_progress' : $review->status]);
        $this->scoringService->recalculateReview($review);

        return back();
    }

    public function updateObjective(Request $request, PerformanceObjective $objective): RedirectResponse
    {
        $objective->loadMissing('review.period');
        $this->authorizeReview($request, $objective->review);
        $this->ensureEditable($objective->review);

        $objective->update($this->objectivePayloadFromRequest($request));
        $this->scoringService->recalculateReview($objective->review);

        return back();
    }

    public function destroyObjective(Request $request, PerformanceObjective $objective): RedirectResponse
    {
        $objective->loadMissing('review.period');
        $this->authorizeReview($request, $objective->review);
        $this->ensureEditable($objective->review);

        $review = $objective->review;
        $objective->delete();
        $this->scoringService->recalculateReview($review);

        return back();
    }

    public function storeKeyResult(Request $request, PerformanceObjective $objective): RedirectResponse
    {
        $objective->loadMissing('review.period');
        $this->authorizeReview($request, $objective->review);
        $this->ensureEditable($objective->review);

        $objective->keyResults()->create([
            ...$this->keyResultPayloadFromRequest($request),
            'user_id' => $request->user()->accountOwnerId(),
        ]);

        $this->scoringService->recalculateReview($objective->review);

        return back();
    }

    public function updateKeyResult(Request $request, PerformanceKeyResult $keyResult): RedirectResponse
    {
        $keyResult->loadMissing('objective.review.period');
        $this->authorizeReview($request, $keyResult->objective->review);
        $this->ensureEditable($keyResult->objective->review);

        $keyResult->update($this->keyResultPayloadFromRequest($request));
        $this->scoringService->recalculateReview($keyResult->objective->review);

        return back();
    }

    public function destroyKeyResult(Request $request, PerformanceKeyResult $keyResult): RedirectResponse
    {
        $keyResult->loadMissing('objective.review.period');
        $review = $keyResult->objective->review;
        $this->authorizeReview($request, $review);
        $this->ensureEditable($review);

        $keyResult->delete();
        $this->scoringService->recalculateReview($review);

        return back();
    }

    public function updateKpiResult(Request $request, PerformanceKpiResult $kpiResult): RedirectResponse
    {
        $kpiResult->loadMissing('review.period');
        $this->authorizeReview($request, $kpiResult->review);
        $this->ensureEditable($kpiResult->review);

        if ($kpiResult->input_type === 'attendance') {
            throw ValidationException::withMessages(['actual_value' => 'KPI attendance dihitung otomatis dari data absensi.']);
        }

        $validated = $request->validate([
            'actual_value' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ]);

        $kpiResult->update($validated);
        $this->scoringService->recalculateReview($kpiResult->review);

        return back();
    }

    public function syncAttendance(Request $request, PerformanceReview $review): RedirectResponse
    {
        $this->authorizeReview($request, $review);
        $this->ensureEditable($review);

        $this->scoringService->syncAttendanceKpis($review);
        $this->scoringService->recalculateReview($review);

        return back();
    }

    public function storeCheckIn(Request $request, PerformanceReview $review): RedirectResponse
    {
        $this->authorizeReview($request, $review);

        throw ValidationException::withMessages([
            'check_ins' => 'Aktivitas Performance hanya dapat ditambahkan oleh user melalui portal.',
        ]);
    }

    private function periodPayloadFromRequest(Request $request, ?PerformancePeriod $period = null): array
    {
        $ownerId = $request->user()->accountOwnerId();

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'starts_at' => [
                'required',
                'date',
                Rule::unique('performance_periods', 'starts_at')
                    ->where('user_id', $ownerId)
                    ->where('ends_at', $request->input('ends_at'))
                    ->ignore($period?->id),
            ],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'status' => ['required', Rule::in(PerformancePeriod::STATUSES)],
        ]);
    }

    private function templatePayloadFromRequest(Request $request): array
    {
        $ownerId = $request->user()->accountOwnerId();

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'is_active' => ['boolean'],
        ]);
    }

    private function metricPayloadFromRequest(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'unit' => ['nullable', 'string', 'max:40'],
            'target_value' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'weight' => ['required', 'numeric', 'min:0', 'max:1000'],
            'input_type' => ['required', Rule::in(PerformanceKpiMetric::INPUT_TYPES)],
            'attendance_metric' => ['nullable', Rule::in(PerformanceKpiMetric::ATTENDANCE_METRICS)],
            'direction' => ['required', Rule::in(PerformanceKpiMetric::DIRECTIONS)],
        ]);

        if ($validated['input_type'] === 'attendance' && ! $validated['attendance_metric']) {
            throw ValidationException::withMessages(['attendance_metric' => 'Pilih metric attendance untuk KPI otomatis.']);
        }

        if ($validated['input_type'] === 'manual') {
            $validated['attendance_metric'] = null;
        }

        return $validated;
    }

    private function objectivePayloadFromRequest(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'weight' => ['required', 'numeric', 'min:0', 'max:1000'],
            'status' => ['required', Rule::in(PerformanceObjective::STATUSES)],
        ]);
    }

    private function keyResultPayloadFromRequest(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'target_value' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'actual_value' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'unit' => ['nullable', 'string', 'max:40'],
            'status' => ['required', Rule::in(PerformanceKeyResult::STATUSES)],
        ]);

        $target = (float) $validated['target_value'];
        $actual = (float) $validated['actual_value'];
        $validated['score'] = $target <= 0
            ? ($actual <= 0 ? 100 : 0)
            : round(max(0, min(($actual / $target) * 100, 120)), 2);

        return $validated;
    }

    private function authorizeMasterData(Request $request): void
    {
        abort_unless($this->canManageAll($request), 403);
    }

    private function authorizeReview(Request $request, PerformanceReview $review): void
    {
        if ($this->canManageAll($request)) {
            return;
        }

        abort_unless($review->manager_id && $review->manager_id === $this->managerEmployeeId($request), 403);
    }

    private function ensureEditable(PerformanceReview $review): void
    {
        $review->loadMissing('period');

        if ($review->isLocked()) {
            throw ValidationException::withMessages(['review' => 'Review pada periode closed/locked tidak bisa diedit.']);
        }
    }

    private function canManageAll(Request $request): bool
    {
        $user = $request->user();

        return $user && ! $user->parent_user_id;
    }

    private function managerEmployeeId(Request $request): ?int
    {
        $user = $request->user();

        if (! $user || ! $user->parent_user_id) {
            return null;
        }

        return Employee::query()
            ->where(function ($query) use ($user): void {
                if ($user->email) {
                    $query->where('email', $user->email);
                }

                if ($user->phone) {
                    $user->email
                        ? $query->orWhere('phone', $user->phone)
                        : $query->where('phone', $user->phone);
                }
            })
            ->value('id');
    }

    private function periodPayload(PerformancePeriod $period): array
    {
        return [
            'id' => $period->id,
            'name' => $period->name,
            'starts_at' => $period->starts_at?->format('Y-m-d'),
            'ends_at' => $period->ends_at?->format('Y-m-d'),
            'status' => $period->status,
            'reviews_count' => $period->reviews_count ?? null,
        ];
    }

    private function templatePayload(PerformanceKpiTemplate $template): array
    {
        return [
            'id' => $template->id,
            'name' => $template->name,
            'description' => $template->description,
            'division_id' => $template->division_id,
            'position_id' => $template->position_id,
            'division' => $template->division ? ['id' => $template->division->id, 'name' => $template->division->name] : null,
            'position' => $template->position ? ['id' => $template->position->id, 'name' => $template->position->name] : null,
            'is_active' => $template->is_active,
            'metrics_count' => $template->metrics_count ?? $template->metrics->count(),
            'metrics' => $template->metrics->map(fn (PerformanceKpiMetric $metric) => [
                'id' => $metric->id,
                'name' => $metric->name,
                'description' => $metric->description,
                'unit' => $metric->unit,
                'target_value' => (float) $metric->target_value,
                'weight' => (float) $metric->weight,
                'input_type' => $metric->input_type,
                'attendance_metric' => $metric->attendance_metric,
                'direction' => $metric->direction,
            ])->values(),
        ];
    }

    private function reviewPayload(PerformanceReview $review): array
    {
        return [
            'id' => $review->id,
            'status' => $review->status,
            'okr_score' => (float) $review->okr_score,
            'kpi_score' => (float) $review->kpi_score,
            'manager_score' => $review->manager_score !== null ? (float) $review->manager_score : null,
            'final_score' => (float) $review->final_score,
            'manager_notes' => $review->manager_notes,
            'strengths' => $review->strengths,
            'improvement_areas' => $review->improvement_areas,
            'next_action' => $review->next_action,
            'reviewed_at' => $review->reviewed_at?->toIso8601String(),
            'locked_at' => $review->locked_at?->toIso8601String(),
            'period' => $review->period ? $this->periodPayload($review->period) : null,
            'employee' => $review->employee ? $this->employeeOption($review->employee) : null,
            'manager' => $review->manager ? [
                'id' => $review->manager->id,
                'label' => $review->manager->employee_code.' - '.$review->manager->full_name,
            ] : null,
            'objectives' => $review->objectives->map(fn (PerformanceObjective $objective) => [
                'id' => $objective->id,
                'title' => $objective->title,
                'description' => $objective->description,
                'weight' => (float) $objective->weight,
                'score' => (float) $objective->score,
                'status' => $objective->status,
                'key_results' => $objective->keyResults->map(fn (PerformanceKeyResult $keyResult) => [
                    'id' => $keyResult->id,
                    'title' => $keyResult->title,
                    'target_value' => (float) $keyResult->target_value,
                    'actual_value' => (float) $keyResult->actual_value,
                    'unit' => $keyResult->unit,
                    'score' => (float) $keyResult->score,
                    'status' => $keyResult->status,
                ])->values(),
            ])->values(),
            'kpi_results' => $review->kpiResults->map(fn (PerformanceKpiResult $result) => [
                'id' => $result->id,
                'name' => $result->name,
                'unit' => $result->unit,
                'target_value' => (float) $result->target_value,
                'actual_value' => (float) $result->actual_value,
                'weight' => (float) $result->weight,
                'input_type' => $result->input_type,
                'attendance_metric' => $result->attendance_metric,
                'direction' => $result->direction,
                'score' => (float) $result->score,
                'notes' => $result->notes,
            ])->values(),
            'check_ins' => $review->checkIns->map(fn (PerformanceCheckIn $checkIn) => [
                'id' => $checkIn->id,
                'check_in_date' => $checkIn->check_in_date?->format('Y-m-d'),
                'performance_kpi_result_id' => $checkIn->performance_kpi_result_id,
                'kpi_result' => $checkIn->kpiResult ? [
                    'id' => $checkIn->kpiResult->id,
                    'name' => $checkIn->kpiResult->name,
                    'unit' => $checkIn->kpiResult->unit,
                    'target_value' => (float) $checkIn->kpiResult->target_value,
                    'actual_value' => (float) $checkIn->kpiResult->actual_value,
                    'score' => (float) $checkIn->kpiResult->score,
                ] : null,
                'summary' => $checkIn->summary,
                'action_items' => $checkIn->action_items,
                'status' => $checkIn->status,
            ])->values(),
        ];
    }

    private function employeeOption(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'label' => $employee->employee_code.' - '.$employee->full_name,
            'employee_code' => $employee->employee_code,
            'full_name' => $employee->full_name,
            'division_id' => $employee->division_id,
            'position_id' => $employee->position_id,
            'manager_id' => $employee->manager_id,
            'division' => $employee->division ? ['id' => $employee->division->id, 'name' => $employee->division->name] : null,
            'position' => $employee->position ? ['id' => $employee->position->id, 'name' => $employee->position->name] : null,
        ];
    }
}
