<?php

namespace App\Services;

use App\Models\AttendanceCorrectionRequest;
use App\Models\CompanySetting;
use App\Models\EmployeeAttendance;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

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

    public function assertEligible(
        int $ownerId,
        int $employeeId,
        string $attendanceDate,
        string $timezone,
    ): EmployeeAttendance {
        $attendance = EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->where('employee_id', $employeeId)
            ->whereDate('attendance_date', $attendanceDate)
            ->first();

        if (! $attendance || $attendance->check_in_at === null) {
            throw ValidationException::withMessages([
                'attendance_date' => 'Absensi masuk untuk tanggal tersebut tidak ditemukan.',
            ]);
        }

        if ($attendance->check_out_at !== null) {
            throw ValidationException::withMessages([
                'attendance_date' => 'Absensi pada tanggal tersebut sudah memiliki jam pulang.',
            ]);
        }

        if (AttendanceCorrectionRequest::query()
            ->where('user_id', $ownerId)
            ->where('employee_id', $employeeId)
            ->whereDate('attendance_date', $attendanceDate)
            ->where('request_type', 'missing_clock_out')
            ->where('status', 'pending')
            ->exists()) {
            throw ValidationException::withMessages([
                'attendance_date' => 'Pengajuan lupa absen pulang untuk tanggal tersebut masih menunggu approval.',
            ]);
        }

        $setting = CompanySetting::query()->firstOrCreate(
            ['user_id' => $ownerId],
            ['name' => 'Perusahaan'],
        );
        $deadline = $this->deadlineFor(
            $setting,
            Carbon::parse($attendanceDate, $timezone),
        );

        if (now($timezone)->greaterThan($deadline)) {
            throw ValidationException::withMessages([
                'attendance_date' => 'Periode pengajuan lupa absen pulang untuk tanggal tersebut sudah ditutup.',
            ]);
        }

        return $attendance;
    }
}
