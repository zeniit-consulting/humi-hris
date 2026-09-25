<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\WorkShift;
use Illuminate\Support\Carbon;

class AttendanceStatusService
{
    public function resolveStatus(array $data, int $ownerId, ?string $timezone = null): string
    {
        return $this->resolveStatusAttributes($data, $ownerId, $timezone)['status'];
    }

    /**
     * @return array{status: string, late_minutes: int|null, late_level: string|null, late_penalty: float, is_half_day: bool}
     */
    public function resolveStatusAttributes(array $data, int $ownerId, ?string $timezone = null): array
    {
        $timezone ??= config('app.timezone');
        $status = (string) ($data['status'] ?? 'present');
        $result = [
            'status' => $status,
            'late_minutes' => null,
            'late_level' => null,
            'late_penalty' => 0.0,
            'is_half_day' => false,
        ];

        if (! in_array($status, ['present', 'late'], true) || empty($data['check_in_at'])) {
            return $result;
        }

        $shift = $this->resolveShift($data, $ownerId);

        if (! $shift || $shift->is_day_off || $shift->start_time === null) {
            return $result;
        }

        $setting = CompanySetting::query()->where('user_id', $ownerId)->first();

        $tolerance = $shift->late_tolerance_minutes !== null && (int) $shift->late_tolerance_minutes > 0
            ? (int) $shift->late_tolerance_minutes
            : (int) ($setting?->late_tolerance_minutes ?? 15);

        $attendanceDate = Carbon::parse($data['attendance_date'])->toDateString();
        $shiftStart = Carbon::parse($attendanceDate.' '.$shift->start_time, $timezone);
        $latestAllowed = $shiftStart->copy()->addMinutes($tolerance);
        $checkIn = Carbon::parse($data['check_in_at'], config('app.timezone'))->setTimezone($timezone);

        if (! $checkIn->gt($latestAllowed)) {
            $result['status'] = 'present';

            return $result;
        }

        $lateMinutes = (int) $shiftStart->diffInMinutes($checkIn);

        $isHalfDay = false;
        if ((bool) ($setting?->late_half_day_enabled ?? false)) {
            $cutoff = (int) ($setting?->late_half_day_cutoff_minutes ?? 60);
            if ($lateMinutes >= $cutoff) {
                $isHalfDay = true;
            }
        }

        $employee = ! empty($data['employee_id'])
            ? \App\Models\Employee::query()->with('allowances')->find($data['employee_id'])
            : null;

        $latePenalty = $this->calculateLatePenalty($lateMinutes, $isHalfDay, $setting, $employee);
        $lateLevel = $isHalfDay ? 'half_day' : $this->lateLevel($lateMinutes);

        // Auto deduct 0.5 days from annual leave if half-day rule is enabled and configured to deduct leave
        if ($isHalfDay && (bool) ($setting?->late_half_day_deduct_leave ?? false) && ! empty($data['employee_id'])) {
            $this->syncHalfDayLeaveDeduction($ownerId, (int) $data['employee_id'], $attendanceDate, $lateMinutes);
        }

        return [
            'status' => 'late',
            'late_minutes' => $lateMinutes,
            'late_level' => $lateLevel,
            'late_penalty' => round($latePenalty, 2),
            'is_half_day' => $isHalfDay,
        ];
    }

    public function calculateLatePenalty(int $lateMinutes, bool $isHalfDay, ?CompanySetting $setting, ?\App\Models\Employee $employee = null): float
    {
        if (! $setting) {
            return 0.0;
        }

        $cutoff = (int) ($setting->late_half_day_cutoff_minutes ?? 60);
        $effectiveHalfDay = $isHalfDay || ((bool) ($setting->late_half_day_enabled ?? false) && $lateMinutes >= $cutoff);

        if ($effectiveHalfDay && (bool) ($setting->late_half_day_enabled ?? false)) {
            $penaltyType = $setting->late_half_day_penalty_type ?? 'prorate_half_day';

            if ($penaltyType === 'nominal' && (float) ($setting->late_half_day_penalty_amount ?? 0) > 0) {
                return (float) $setting->late_half_day_penalty_amount;
            }

            // Prorate half day: 50% of standard daily wage (base salary + active allowances / active working days)
            if ($employee) {
                $baseSalary = (float) ($employee->base_salary ?? 0);
                $allowances = (float) $employee->allowances->where('is_active', true)->sum('amount');
                $activeDays = max((int) ($setting->active_working_days ?? 22), 1);
                $dailyRate = $employee->employment_type === 'DW'
                    ? (float) ($employee->daily_wage ?? 0)
                    : (($baseSalary + $allowances) / $activeDays);

                return round(0.5 * $dailyRate, 2);
            }

            if ((float) ($setting->late_half_day_penalty_amount ?? 0) > 0) {
                return (float) $setting->late_half_day_penalty_amount;
            }
        }

        if (! (bool) $setting->late_penalty_enabled) {
            return 0.0;
        }

        $type = $setting->late_penalty_type ?? 'tiered';

        if ($type === 'progressive') {
            $baseMin = (int) ($setting->late_base_penalty_minutes ?? 15);
            $baseAmount = (float) ($setting->late_base_penalty_amount ?? 0);
            $incrementAmount = (float) ($setting->late_incremental_penalty_amount ?? 0);
            $unit = max(1, (int) ($setting->late_incremental_unit_minutes ?? 1));

            if ($lateMinutes <= $baseMin) {
                return $baseAmount > 0 ? $baseAmount : 0.0;
            }

            $extraMinutes = $lateMinutes - $baseMin;
            $increments = (int) floor($extraMinutes / $unit);

            return round($baseAmount + ($increments * $incrementAmount), 2);
        }

        // Tiered
        $tiers = (array) ($setting->late_penalty_tiers ?? []);
        if (empty($tiers)) {
            return 0.0;
        }

        usort($tiers, fn ($a, $b) => ((int) ($a['from_minute'] ?? 0)) <=> ((int) ($b['from_minute'] ?? 0)));

        $matchedPenalty = 0.0;
        $firstNonZeroPenalty = 0.0;
        $highestTierPenalty = 0.0;
        $maxTierMinute = 0;

        foreach ($tiers as $tier) {
            $amount = (float) ($tier['penalty_amount'] ?? 0);
            if ($firstNonZeroPenalty === 0.0 && $amount > 0) {
                $firstNonZeroPenalty = $amount;
            }

            $from = (int) ($tier['from_minute'] ?? 0);
            $to = isset($tier['to_minute']) && $tier['to_minute'] !== '' && $tier['to_minute'] !== null
                ? (int) $tier['to_minute']
                : null;

            if ($to !== null && $to > $maxTierMinute) {
                $maxTierMinute = $to;
                $highestTierPenalty = $amount;
            } elseif ($to === null) {
                $highestTierPenalty = $amount;
            }

            if ($lateMinutes >= $from && ($to === null || $lateMinutes <= $to)) {
                $matchedPenalty = $amount;
                break;
            }
        }

        // If lateMinutes > max tier minute and no tier matched, cap at highest tier
        if ($matchedPenalty === 0.0 && $lateMinutes > 0 && $highestTierPenalty > 0) {
            $matchedPenalty = $highestTierPenalty;
        }

        // If status was late but lateMinutes <= 0 (e.g. no exact time provided), fallback to first non-zero tier
        if ($matchedPenalty === 0.0 && $lateMinutes <= 0 && $firstNonZeroPenalty > 0) {
            $matchedPenalty = $firstNonZeroPenalty;
        }

        return $matchedPenalty;
    }

    public function calculateLatePenaltyForAttendance(
        EmployeeAttendance $attendance,
        ?CompanySetting $setting,
        ?\App\Models\Employee $employee = null,
        ?WorkShift $shift = null,
        bool $syncAttendanceRecord = false
    ): float {
        $ownerId = (int) ($attendance->user_id ?: ($employee?->user_id ?? 0));
        $setting ??= CompanySetting::query()->where('user_id', $ownerId)->first();

        if (! $setting) {
            return (float) ($attendance->late_penalty ?? 0);
        }

        $existingPenalty = (float) ($attendance->late_penalty ?? 0);
        $lateMinutes = (int) ($attendance->late_minutes ?? 0);
        $isHalfDay = (bool) ($attendance->is_half_day ?? false);

        $shift ??= $this->resolveShift([
            'shift_id' => $attendance->shift_id,
            'employee_id' => $attendance->employee_id,
            'attendance_date' => $attendance->attendance_date?->toDateString(),
            'check_in_at' => $attendance->check_in_at,
        ], $ownerId);

        // If late_minutes is not set, but attendance has check_in_at and a valid shift with start_time
        if ($lateMinutes <= 0 && ! empty($attendance->check_in_at) && $shift && ! $shift->is_day_off && ! empty($shift->start_time)) {
            $tolerance = $shift->late_tolerance_minutes !== null && (int) $shift->late_tolerance_minutes > 0
                ? (int) $shift->late_tolerance_minutes
                : (int) ($setting->late_tolerance_minutes ?? 15);

            $timezone = $attendance->timezone ?: config('app.timezone');
            $attendanceDate = Carbon::parse($attendance->attendance_date)->toDateString();
            $shiftStart = Carbon::parse($attendanceDate.' '.$shift->start_time, $timezone);
            $checkIn = Carbon::parse($attendance->check_in_at, config('app.timezone'))->setTimezone($timezone);

            if ($checkIn->gt($shiftStart->copy()->addMinutes($tolerance))) {
                $lateMinutes = (int) $shiftStart->diffInMinutes($checkIn);
            }
        }

        $cutoff = (int) ($setting->late_half_day_cutoff_minutes ?? 60);
        if ((bool) ($setting->late_half_day_enabled ?? false) && $lateMinutes >= $cutoff) {
            $isHalfDay = true;
        }

        $isLate = $attendance->status === 'late' || $lateMinutes > 0 || $isHalfDay;

        if (! $isLate) {
            return 0.0;
        }

        $calculatedPenalty = $this->calculateLatePenalty($lateMinutes, $isHalfDay, $setting, $employee);
        $finalPenalty = $calculatedPenalty > 0 ? $calculatedPenalty : $existingPenalty;

        if ($syncAttendanceRecord && $attendance->exists) {
            $updateData = [];
            if ($finalPenalty > 0 && (float) ($attendance->late_penalty ?? 0) != $finalPenalty) {
                $updateData['late_penalty'] = $finalPenalty;
            }
            if ($lateMinutes > 0 && (int) ($attendance->late_minutes ?? 0) != $lateMinutes) {
                $updateData['late_minutes'] = $lateMinutes;
            }
            if ($isHalfDay && ! (bool) ($attendance->is_half_day ?? false)) {
                $updateData['is_half_day'] = true;
            }
            if ($attendance->status !== 'late') {
                $updateData['status'] = 'late';
            }
            if (! empty($updateData)) {
                $attendance->updateQuietly($updateData);
            }
        }

        return $finalPenalty;
    }

    public function resolveStatusForAttendance(EmployeeAttendance $attendance, int $ownerId): string
    {
        return $this->resolveStatus([
            'employee_id' => $attendance->employee_id,
            'shift_id' => $attendance->shift_id,
            'attendance_date' => $attendance->attendance_date?->toDateString(),
            'status' => $attendance->status,
            'check_in_at' => $attendance->check_in_at,
        ], $ownerId);
    }

    public function resolveShift(array $data, int $ownerId, ?string $timezone = null): ?WorkShift
    {
        if (! empty($data['shift_id'])) {
            $shift = WorkShift::query()
                ->where('user_id', $ownerId)
                ->whereKey($data['shift_id'])
                ->first();
            if ($shift) {
                return $shift;
            }
        }

        $schedule = null;
        if (! empty($data['employee_id']) && ! empty($data['attendance_date'])) {
            $schedule = EmployeeSchedule::query()
                ->where('user_id', $ownerId)
                ->where('employee_id', $data['employee_id'])
                ->whereDate('work_date', Carbon::parse($data['attendance_date'])->toDateString())
                ->first();
        }

        if ($schedule) {
            if (! empty($schedule->shift_code)) {
                $shift = WorkShift::query()
                    ->where('user_id', $ownerId)
                    ->where('code', $schedule->shift_code)
                    ->first();
                if ($shift) {
                    return $shift;
                }

                $shiftByName = WorkShift::query()
                    ->where('user_id', $ownerId)
                    ->where('name', $schedule->shift_code)
                    ->first();
                if ($shiftByName) {
                    return $shiftByName;
                }
            }

            if (! empty($schedule->start_time) && ! (bool) $schedule->is_day_off) {
                $shiftByTime = WorkShift::query()
                    ->where('user_id', $ownerId)
                    ->where('is_day_off', false)
                    ->where('start_time', $schedule->start_time)
                    ->first();
                if ($shiftByTime) {
                    return $shiftByTime;
                }

                return new WorkShift([
                    'user_id' => $ownerId,
                    'name' => $schedule->shift_code ?: 'Jadwal Kerja',
                    'code' => $schedule->shift_code ?: 'CUSTOM',
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'is_day_off' => false,
                ]);
            }

            if ((bool) $schedule->is_day_off) {
                $offShift = WorkShift::query()
                    ->where('user_id', $ownerId)
                    ->where('is_day_off', true)
                    ->first();
                if ($offShift) {
                    return $offShift;
                }

                return new WorkShift([
                    'user_id' => $ownerId,
                    'name' => 'OFF',
                    'code' => 'OFF',
                    'is_day_off' => true,
                ]);
            }
        }

        // Fallback: match by check_in_at if available against active non-day-off shifts
        if (! empty($data['check_in_at'])) {
            $timezone ??= config('app.timezone');
            $checkIn = Carbon::parse($data['check_in_at'], config('app.timezone'))->setTimezone($timezone);
            $checkInMinute = ((int) $checkIn->format('H')) * 60 + (int) $checkIn->format('i');

            $shifts = WorkShift::query()
                ->where('user_id', $ownerId)
                ->where('is_day_off', false)
                ->whereNotNull('start_time')
                ->get();

            if ($shifts->isNotEmpty()) {
                $bestShift = $shifts->map(function (WorkShift $shift) use ($checkInMinute): array {
                    $startMinute = ((int) substr((string) $shift->start_time, 0, 2)) * 60 + (int) substr((string) $shift->start_time, 3, 2);
                    $dist = abs($checkInMinute - $startMinute);
                    $dist = min($dist, 1440 - $dist);

                    return ['shift' => $shift, 'distance' => $dist];
                })->sortBy('distance')->first();

                if ($bestShift && $bestShift['distance'] <= 240) {
                    return $bestShift['shift'];
                }
            }
        }

        return WorkShift::query()
            ->where('user_id', $ownerId)
            ->where('is_day_off', false)
            ->whereNotNull('start_time')
            ->orderBy('id')
            ->first();
    }

    private function syncHalfDayLeaveDeduction(int $ownerId, int $employeeId, string $date, int $lateMinutes): void
    {
        $existing = LeaveRequest::query()->withoutGlobalScopes()
            ->where('employee_id', $employeeId)
            ->where('leave_type', 'annual')
            ->whereDate('start_date', $date)
            ->where('reason', 'like', '%keterlambatan%')
            ->first();

        if ($existing) {
            return;
        }

        try {
            $leave = LeaveRequest::query()->withoutGlobalScopes()->create([
                'user_id' => $ownerId,
                'employee_id' => $employeeId,
                'leave_type' => 'annual',
                'start_date' => $date,
                'end_date' => $date,
                'total_days' => 0.5,
                'reason' => "Cuti setengah hari otomatis karena keterlambatan {$lateMinutes} menit (tanggal {$date})",
                'status' => 'approved',
                'approved_at' => now(),
            ]);

            app(LeaveBalanceService::class)->deductBalance($leave);
        } catch (\Throwable) {
            // Ignore if leave balance deduction fails or policy not found
        }
    }

    private function lateLevel(int $lateMinutes): string
    {
        if ($lateMinutes <= 30) {
            return 'level_1';
        }

        if ($lateMinutes <= 60) {
            return 'level_2';
        }

        return 'level_3';
    }
}

