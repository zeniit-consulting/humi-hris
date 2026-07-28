<?php

namespace App\Console\Commands;

use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\FcmReminderLog;
use App\Services\FcmNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendAttendanceFcmReminders extends Command
{
    protected $signature = 'attendance:send-fcm-reminders';
    protected $description = 'Kirim reminder FCM H-15 menit untuk clock in dan clock out.';

    public function handle(FcmNotificationService $fcm): int
    {
        EmployeeSchedule::query()->with('employee.user')->where('is_day_off', false)->get()->each(function (EmployeeSchedule $schedule) use ($fcm): void {
            $employee = $schedule->employee;
            if (! $employee?->user || ! $employee->is_active || $employee->offboarded_at) return;
            $timezone = $employee->timezone ?: config('app.timezone');
            $now = now($timezone);
            if (! $schedule->work_date?->isSameDay($now)) return;
            $attendance = EmployeeAttendance::query()->where('employee_id', $employee->id)->whereDate('attendance_date', $schedule->work_date)->first();
            foreach (['check_in' => $schedule->start_time, 'check_out' => $schedule->end_time] as $type => $time) {
                if (! $time || ($type === 'check_in' ? $attendance?->check_in_at : $attendance?->check_out_at)) continue;
                $reminderAt = Carbon::parse($schedule->work_date->format('Y-m-d').' '.$time, $timezone)->subMinutes(15);
                if ($now->diffInMinutes($reminderAt, false) < 0 || $now->diffInMinutes($reminderAt, false) > 1) continue;
                if (FcmReminderLog::query()->where(['employee_id' => $employee->id, 'attendance_date' => $schedule->work_date, 'type' => $type])->exists()) continue;
                if ($fcm->sendToUser($employee->user, 'Pengingat Absensi', $type === 'check_in' ? 'Waktunya melakukan clock in.' : 'Waktunya melakukan clock out.', '/portal/attendance') > 0) {
                    FcmReminderLog::query()->create(['employee_id' => $employee->id, 'attendance_date' => $schedule->work_date, 'type' => $type, 'sent_at' => now()]);
                }
            }
        });

        return self::SUCCESS;
    }
}
