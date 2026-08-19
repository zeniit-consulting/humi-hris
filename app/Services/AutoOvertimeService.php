<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\OvertimeRequest;
use App\Models\WorkShift;
use Illuminate\Support\Carbon;

class AutoOvertimeService
{
    public function syncFromAttendance(EmployeeAttendance $attendance, int $ownerId, ?string $timezone = null): ?OvertimeRequest
    {
        if (empty($attendance->check_out_at) || empty($attendance->employee_id) || empty($attendance->attendance_date)) {
            return null;
        }

        $setting = CompanySetting::query()
            ->where('user_id', $ownerId)
            ->first();

        if (! $setting || ! $setting->auto_overtime_from_attendance) {
            return null;
        }

        $timezone ??= $attendance->timezone ?: config('app.timezone');
        $shift = $this->resolveShift($attendance, $ownerId);

        if (! $shift || $shift->is_day_off || empty($shift->end_time)) {
            return null;
        }

        $attendanceDate = Carbon::parse($attendance->attendance_date)->toDateString();
        $shiftEnd = Carbon::parse($attendanceDate.' '.$shift->end_time, $timezone);

        if (! empty($shift->start_time) && $shift->end_time < $shift->start_time) {
            $shiftEnd->addDay();
        }

        $checkOut = Carbon::parse($attendance->check_out_at, config('app.timezone'))->setTimezone($timezone);

        if ($checkOut->lte($shiftEnd)) {
            return null;
        }

        $excessMinutes = (int) $shiftEnd->diffInMinutes($checkOut);
        $minMinutes = max((int) ($setting->auto_overtime_min_minutes ?? 30), 1);

        if ($excessMinutes < $minMinutes) {
            return null;
        }

        $totalHours = round($excessMinutes / 60, 2);
        $startTimeStr = $shiftEnd->format('H:i');
        $endTimeStr = $checkOut->format('H:i');

        // Check for existing overtime request on this date
        $existing = OvertimeRequest::query()
            ->where('user_id', $ownerId)
            ->where('employee_id', $attendance->employee_id)
            ->whereDate('work_date', $attendanceDate)
            ->where('is_event', false)
            ->first();

        if ($existing) {
            if ($existing->status === 'pending') {
                $existing->update([
                    'start_time' => $startTimeStr,
                    'end_time' => $endTimeStr,
                    'break_minutes' => 0,
                    'total_hours' => $totalHours,
                    'reason' => 'Otomatis dari kelebihan jam absensi pulang (Shift: '.($shift->name ?: $shift->code).')',
                ]);
            }

            return $existing;
        }

        return OvertimeRequest::create([
            'user_id' => $ownerId,
            'employee_id' => $attendance->employee_id,
            'work_date' => $attendanceDate,
            'start_time' => $startTimeStr,
            'end_time' => $endTimeStr,
            'break_minutes' => 0,
            'total_hours' => $totalHours,
            'reason' => 'Otomatis dari kelebihan jam absensi pulang (Shift: '.($shift->name ?: $shift->code).')',
            'status' => 'pending',
            'is_event' => false,
            'notes' => null,
        ]);
    }

    private function resolveShift(EmployeeAttendance $attendance, int $ownerId): ?WorkShift
    {
        if (! empty($attendance->shift_id)) {
            return WorkShift::query()
                ->where('user_id', $ownerId)
                ->whereKey($attendance->shift_id)
                ->first();
        }

        $schedule = EmployeeSchedule::query()
            ->where('user_id', $ownerId)
            ->where('employee_id', $attendance->employee_id)
            ->whereDate('work_date', Carbon::parse($attendance->attendance_date)->toDateString())
            ->first();

        if (! $schedule) {
            return null;
        }

        return WorkShift::query()
            ->where('user_id', $ownerId)
            ->where('code', $schedule->shift_code)
            ->first();
    }
}
