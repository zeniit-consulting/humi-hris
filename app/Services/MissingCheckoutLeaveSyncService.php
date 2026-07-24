<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use Illuminate\Support\Carbon;

class MissingCheckoutLeaveSyncService
{
    /** @return array{clocked_out: int, leave_deducted: int, skipped: int} */
    public function sync(int $ownerId, string $date): array
    {
        $setting = CompanySetting::query()->withoutGlobalScopes()->where('user_id', $ownerId)->first();
        $deductLeave = (bool) ($setting?->auto_deduct_leave_for_missing_checkout ?? false);
        $result = ['clocked_out' => 0, 'leave_deducted' => 0, 'skipped' => 0];

        $attendances = EmployeeAttendance::query()->withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->whereDate('attendance_date', $date)
            ->whereNotNull('check_in_at')
            ->whereNull('check_out_at')
            ->get();

        foreach ($attendances as $attendance) {
            $schedule = EmployeeSchedule::query()->withoutGlobalScopes()
                ->where('employee_id', $attendance->employee_id)
                ->whereDate('work_date', $date)
                ->where('is_day_off', false)
                ->first();
            $endTime = $schedule?->end_time ?? '22:00:00';
            $endTime = is_string($endTime) && strlen($endTime) <= 5 ? $endTime.':00' : $endTime;

            try {
                $attendance->update([
                    'check_out_at' => Carbon::parse($date.' '.$endTime),
                    'notes' => trim(($attendance->notes ? $attendance->notes."\n" : '').'Lupa Absen Pulang (sync)'),
                ]);
                $result['clocked_out']++;
            } catch (\Throwable) {
                $result['skipped']++;

                continue;
            }

            if (! $deductLeave || $this->hasDeduction($attendance, $date)) {
                continue;
            }

            $leave = LeaveRequest::query()->withoutGlobalScopes()->create([
                'user_id' => $ownerId,
                'employee_id' => $attendance->employee_id,
                'leave_type' => 'annual',
                'start_date' => $date,
                'end_date' => $date,
                'total_days' => 1,
                'reason' => $this->deductionReason($attendance->id),
                'status' => 'approved',
                'approved_at' => now(),
            ]);

            if (app(LeaveBalanceService::class)->deductBalance($leave)) {
                $result['leave_deducted']++;
            } else {
                $leave->delete();
                $result['skipped']++;
            }
        }

        return $result;
    }

    private function hasDeduction(EmployeeAttendance $attendance, string $date): bool
    {
        return LeaveRequest::query()->withoutGlobalScopes()
            ->where('employee_id', $attendance->employee_id)
            ->where('leave_type', 'annual')
            ->whereDate('start_date', $date)
            ->where('reason', $this->deductionReason($attendance->id))
            ->exists();
    }

    private function deductionReason(int $attendanceId): string
    {
        return 'Potong saldo otomatis karena lupa absen pulang #'.$attendanceId;
    }
}
