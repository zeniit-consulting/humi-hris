<?php

namespace App\Services;

use App\Models\EmployeeAttendance;
use App\Models\PerformanceKpiResult;
use App\Models\PerformanceKpiTemplate;
use App\Models\PerformanceObjective;
use App\Models\PerformanceReview;
use Illuminate\Support\Collection;

class PerformanceScoringService
{
    public function __construct(
        private readonly AttendanceStatusService $attendanceStatusService,
    ) {}

    public function prefillKpisFromTemplates(PerformanceReview $review): void
    {
        $review->loadMissing('employee');
        $employee = $review->employee;

        if (! $employee) {
            return;
        }

        $templates = PerformanceKpiTemplate::query()
            ->with('metrics')
            ->where('is_active', true)
            ->where(function ($query) use ($employee): void {
                $query
                    ->where('position_id', $employee->position_id)
                    ->orWhere('division_id', $employee->division_id)
                    ->orWhere(function ($builder): void {
                        $builder->whereNull('position_id')->whereNull('division_id');
                    });
            })
            ->orderByRaw('case when position_id is not null then 0 when division_id is not null then 1 else 2 end')
            ->orderBy('name')
            ->get();

        foreach ($templates as $template) {
            foreach ($template->metrics as $metric) {
                PerformanceKpiResult::query()->firstOrCreate(
                    [
                        'performance_review_id' => $review->id,
                        'performance_kpi_metric_id' => $metric->id,
                    ],
                    [
                        'user_id' => $review->user_id,
                        'name' => $metric->name,
                        'unit' => $metric->unit,
                        'target_value' => $metric->target_value,
                        'actual_value' => 0,
                        'weight' => $metric->weight,
                        'input_type' => $metric->input_type,
                        'attendance_metric' => $metric->attendance_metric,
                        'direction' => $metric->direction,
                        'score' => 0,
                    ],
                );
            }
        }
    }

    public function syncAttendanceKpis(PerformanceReview $review): void
    {
        $review->loadMissing('period', 'kpiResults');

        if (! $review->period) {
            return;
        }

        $attendanceResults = $review->kpiResults
            ->where('input_type', 'attendance')
            ->filter(fn (PerformanceKpiResult $result): bool => $result->attendance_metric !== null);

        if ($attendanceResults->isEmpty()) {
            return;
        }

        $attendances = EmployeeAttendance::query()
            ->where('employee_id', $review->employee_id)
            ->whereBetween('attendance_date', [
                $review->period->starts_at->toDateString(),
                $review->period->ends_at->toDateString(),
            ])
            ->get();

        $actuals = $this->attendanceActuals($attendances, $review->user_id);

        foreach ($attendanceResults as $result) {
            $result->actual_value = $actuals[$result->attendance_metric] ?? 0;
            $result->score = $this->scoreResult($result);
            $result->save();
        }
    }

    public function recalculateReview(PerformanceReview $review): PerformanceReview
    {
        $review->loadMissing('objectives.keyResults', 'kpiResults');

        foreach ($review->objectives as $objective) {
            $objective->score = $this->scoreObjective($objective);
            $objective->save();
        }

        foreach ($review->kpiResults as $result) {
            if ($result->input_type !== 'attendance') {
                $result->score = $this->scoreResult($result);
                $result->save();
            }
        }

        $okrScore = $this->weightedAverage($review->objectives, 'score');
        $kpiScore = $this->weightedAverage($review->kpiResults, 'score');
        $managerScore = $review->manager_score !== null ? min((float) $review->manager_score, 100) : 0;

        $review->forceFill([
            'okr_score' => min($okrScore, 100),
            'kpi_score' => min($kpiScore, 100),
            'final_score' => round((min($okrScore, 100) * 0.5) + (min($kpiScore, 100) * 0.4) + ($managerScore * 0.1), 2),
        ])->save();

        return $review->refresh();
    }

    /**
     * @param  Collection<int, EmployeeAttendance>  $attendances
     * @return array<string, float>
     */
    private function attendanceActuals(Collection $attendances, int $ownerId): array
    {
        $total = $attendances->count();
        $present = 0;
        $late = 0;
        $absent = 0;

        foreach ($attendances as $attendance) {
            $status = in_array($attendance->status, ['present', 'late'], true)
                ? $this->attendanceStatusService->resolveStatusForAttendance($attendance, $ownerId)
                : $attendance->status;

            if ($status === 'present') {
                $present++;
            } elseif ($status === 'late') {
                $late++;
            } elseif ($status === 'absent') {
                $absent++;
            }
        }

        $workingRows = max($total, 1);
        $checkInRows = max($present + $late, 1);

        return [
            'attendance_rate' => round((($present + $late) / $workingRows) * 100, 2),
            'on_time_rate' => round(($present / $checkInRows) * 100, 2),
            'late_count' => $late,
            'absent_count' => $absent,
        ];
    }

    private function scoreObjective(PerformanceObjective $objective): float
    {
        if ($objective->keyResults->isEmpty()) {
            return min((float) $objective->score, 120);
        }

        return round(min($objective->keyResults->avg(fn ($keyResult): float => min((float) $keyResult->score, 120)), 120), 2);
    }

    private function scoreResult(PerformanceKpiResult $result): float
    {
        $target = (float) $result->target_value;
        $actual = (float) $result->actual_value;

        if ($target <= 0) {
            $score = $actual <= 0 ? 100 : 0;
        } elseif ($result->direction === 'lower_is_better') {
            $score = $actual <= 0 ? 120 : ($target / $actual) * 100;
        } else {
            $score = ($actual / $target) * 100;
        }

        return round(max(0, min($score, 120)), 2);
    }

    /**
     * @param  iterable<object>  $items
     */
    private function weightedAverage(iterable $items, string $scoreAttribute): float
    {
        $weightedTotal = 0.0;
        $weightTotal = 0.0;

        foreach ($items as $item) {
            $weight = max((float) ($item->weight ?? 1), 0);

            if ($weight <= 0) {
                continue;
            }

            $weightedTotal += min((float) $item->{$scoreAttribute}, 120) * $weight;
            $weightTotal += $weight;
        }

        if ($weightTotal <= 0) {
            return 0;
        }

        return round($weightedTotal / $weightTotal, 2);
    }
}
