<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\PerformanceCheckIn;
use App\Models\PerformanceKeyResult;
use App\Models\PerformanceKpiResult;
use App\Models\PerformanceObjective;
use App\Models\PerformanceReview;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PortalPerformanceController extends Controller
{
    use InteractsWithSelfService;

    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->abortIfPerformanceLocked($user);

        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $reviews = PerformanceReview::query()
            ->with([
                'period:id,name,starts_at,ends_at,status',
                'manager:id,employee_code,first_name,last_name',
                'objectives.keyResults',
                'kpiResults',
                'checkIns' => fn ($query) => $query->latest('check_in_date')->latest('id'),
            ])
            ->where('employee_id', $employee->id)
            ->whereNotIn('status', ['completed', 'locked'])
            ->whereHas('period', fn ($query) => $query->whereIn('status', ['draft', 'active']))
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Performance aktif berhasil dimuat.',
            'data' => [
                'items' => $reviews->map(fn (PerformanceReview $review) => $this->reviewPayload($review))->values(),
            ],
        ]);
    }

    public function storeCheckIn(Request $request, PerformanceReview $review): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->abortIfPerformanceLocked($user);

        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        abort_unless($review->employee_id === $employee->id, 404);
        abort_if($review->isLocked() || in_array($review->status, ['completed', 'locked'], true), 422, 'Performance review ini sudah tidak bisa menerima aktivitas baru.');

        $validated = $request->validate([
            'check_in_date' => ['required', 'date'],
            'summary' => ['required', 'string', 'max:5000'],
            'action_items' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(PerformanceCheckIn::STATUSES)],
        ]);

        $checkIn = $review->checkIns()->create([
            ...$validated,
            'user_id' => $user->accountOwnerId(),
        ]);

        if ($review->status === 'not_started') {
            $review->update(['status' => 'in_progress']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Aktivitas performance berhasil disimpan.',
            'data' => [
                'check_in' => $this->checkInPayload($checkIn),
            ],
        ], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function reviewPayload(PerformanceReview $review): array
    {
        return [
            'id' => $review->id,
            'status' => $review->status,
            'okr_score' => (float) $review->okr_score,
            'kpi_score' => (float) $review->kpi_score,
            'manager_score' => $review->manager_score !== null ? (float) $review->manager_score : null,
            'final_score' => (float) $review->final_score,
            'period' => $review->period ? [
                'id' => $review->period->id,
                'name' => $review->period->name,
                'starts_at' => $review->period->starts_at?->format('Y-m-d'),
                'ends_at' => $review->period->ends_at?->format('Y-m-d'),
                'status' => $review->period->status,
            ] : null,
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
                'score' => (float) $result->score,
            ])->values(),
            'check_ins' => $review->checkIns->map(fn (PerformanceCheckIn $checkIn) => $this->checkInPayload($checkIn))->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkInPayload(PerformanceCheckIn $checkIn): array
    {
        return [
            'id' => $checkIn->id,
            'check_in_date' => $checkIn->check_in_date?->format('Y-m-d'),
            'summary' => $checkIn->summary,
            'action_items' => $checkIn->action_items,
            'status' => $checkIn->status,
        ];
    }

    private function abortIfPerformanceLocked(User $user): void
    {
        $subscription = $this->subscriptionService->getActiveSubscription($user);

        abort_if(
            ! $subscription || $subscription->isFeatureLocked('performance'),
            403,
            'Modul Performance hanya tersedia pada paket Plus.'
        );
    }
}
