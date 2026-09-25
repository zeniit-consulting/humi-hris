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

        if ($isHalfDay && (bool) ($setting->late_half_day_enabled ?? false)) {
            $penaltyType = $setting->late_half_day_penalty_type ?? 'prorate_half_day';

            if ($penaltyType === 'prorate_half_day') {
                if ($employee) {
                    $baseSalary = (float) ($employee->base_salary ?? 0);
                    $allowances = (float) $employee->allowances->where('is_active', true)->sum('amount');
                    $activeDays = max((int) ($setting->active_working_days ?? 22), 1);

                    return round(0.5 * (($baseSalary + $allowances) / $activeDays), 2);
                }
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
                return 0.0;
            }

            $extraMinutes = $lateMinutes - $baseMin;
            $increments = (int) floor($extraMinutes / $unit);

            return $baseAmount + ($increments * $incrementAmount);
        }

        // Tiered
        $tiers = (array) ($setting->late_penalty_tiers ?? []);
        if (empty($tiers)) {
            return 0.0;
        }

        usort($tiers, fn ($a, $b) => ((int) ($a['from_minute'] ?? 0)) <=> ((int) ($b['from_minute'] ?? 0)));

        $matchedPenalty = 0.0;
        foreach ($tiers as $tier) {
            $from = (int) ($tier['from_minute'] ?? 0);
            $to = isset($tier['to_minute']) && $tier['to_minute'] !== '' && $tier['to_minute'] !== null
                ? (int) $tier['to_minute']
                : null;
            $amount = (float) ($tier['penalty_amount'] ?? 0);

            if ($lateMinutes >= $from && ($to === null || $lateMinutes <= $to)) {
                $matchedPenalty = $amount;
                break;
            }
        }

        return $matchedPenalty;
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

    private function resolveShift(array $data, int $ownerId): ?WorkShift
    {
        if (! empty($data['shift_id'])) {
            return WorkShift::query()
                ->where('user_id', $ownerId)
                ->whereKey($data['shift_id'])
                ->first();
        }

        if (empty($data['employee_id']) || empty($data['attendance_date'])) {
            return null;
        }

        $schedule = EmployeeSchedule::query()
            ->where('user_id', $ownerId)
            ->where('employee_id', $data['employee_id'])
            ->whereDate('work_date', Carbon::parse($data['attendance_date'])->toDateString())
            ->first();

        if (! $schedule) {
            return null;
        }

        return WorkShift::query()
            ->where('user_id', $ownerId)
            ->where('code', $schedule->shift_code)
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

