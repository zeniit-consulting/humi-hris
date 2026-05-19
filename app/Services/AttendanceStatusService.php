<?php

namespace App\Services;

use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\WorkShift;
use Illuminate\Support\Carbon;

class AttendanceStatusService
{
    public function resolveStatus(array $data, int $ownerId): string
    {
        $status = (string) ($data['status'] ?? 'present');

        if (! in_array($status, ['present', 'late'], true) || empty($data['check_in_at'])) {
            return $status;
        }

        $shift = $this->resolveShift($data, $ownerId);

        if (! $shift || $shift->is_day_off || $shift->start_time === null) {
            return $status;
        }

        $attendanceDate = Carbon::parse($data['attendance_date'])->toDateString();
        $shiftStart = Carbon::parse($attendanceDate.' '.$shift->start_time);
        $latestAllowed = $shiftStart->copy()->addMinutes((int) $shift->late_tolerance_minutes);
        $checkIn = Carbon::parse($data['check_in_at']);

        return $checkIn->gt($latestAllowed) ? 'late' : 'present';
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
}
