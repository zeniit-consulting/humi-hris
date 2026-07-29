<?php

namespace App\Services;

use App\Models\CompanySetting;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class MissingClockOutRequestPolicy
{
    public function deadlineFor(CompanySetting $setting, CarbonInterface $attendanceDate): CarbonInterface
    {
        $attendanceDate = Carbon::instance($attendanceDate)->startOfDay();
        $relativeDeadline = $attendanceDate->copy()
            ->addDays((int) ($setting->missing_clock_out_request_days ?? 2))
            ->endOfDay();

        $cutoffDay = $setting->attendance_revision_cutoff_day ?? 'end_of_month';
        $cutoffDeadline = $cutoffDay === 'end_of_month'
            ? $attendanceDate->copy()->endOfMonth()->endOfDay()
            : $attendanceDate->copy()->day((int) $cutoffDay)->endOfDay();

        return $relativeDeadline->lessThanOrEqualTo($cutoffDeadline)
            ? $relativeDeadline
            : $cutoffDeadline;
    }
}
