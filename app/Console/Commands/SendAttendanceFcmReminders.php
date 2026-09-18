<?php

namespace App\Console\Commands;

use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\FcmReminderLog;
use App\Models\User;
use App\Services\FcmNotificationService;
use App\Support\WhatsAppPhone;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendAttendanceFcmReminders extends Command
{
    protected $signature = 'attendance:send-fcm-reminders';
    protected $description = 'Kirim reminder FCM H-15 menit untuk clock in dan clock out.';

    public function handle(FcmNotificationService $fcm): int
    {
        $today = Carbon::today();

        EmployeeSchedule::query()
            ->with(['employee.user'])
            ->where('is_day_off', false)
            ->whereDate('work_date', '>=', $today->copy()->subDay())
            ->whereDate('work_date', '<=', $today->copy()->addDay())
            ->get()
            ->each(function (EmployeeSchedule $schedule) use ($fcm): void {
                $employee = $schedule->employee;
                if (! $employee || ! $employee->is_active || $employee->offboarded_at) {
                    return;
                }

                $timezone = $employee->timezone ?: config('app.timezone');
                $now = now($timezone);

                if (! $schedule->work_date || ! $schedule->work_date->isSameDay($now)) {
                    return;
                }

                $attendance = EmployeeAttendance::query()
                    ->where('employee_id', $employee->id)
                    ->whereDate('attendance_date', $schedule->work_date)
                    ->first();

                // Resolve target users: prioritize the employee's portal user accounts.
                // Fall back to direct user (e.g. owner self-employee) only if no portal user exists.
                $normalizedPhone = $employee->phone ? WhatsAppPhone::normalize($employee->phone) : null;
                $phones = array_values(array_filter(array_unique([$employee->phone, $normalizedPhone])));

                $portalUsers = User::query()
                    ->where('parent_user_id', $employee->user_id)
                    ->where(function ($query) use ($employee, $phones): void {
                        if ($employee->email) {
                            $query->where('email', $employee->email);
                        }
                        if (! empty($phones)) {
                            $employee->email
                                ? $query->orWhereIn('phone', $phones)
                                : $query->whereIn('phone', $phones);
                        }
                    })
                    ->get();

                $targetUsers = $portalUsers->isNotEmpty()
                    ? $portalUsers
                    : collect([$employee->user])->filter();

                if ($targetUsers->isEmpty()) {
                    return;
                }

                foreach (['check_in' => $schedule->start_time, 'check_out' => $schedule->end_time] as $type => $time) {
                    if (! $time) {
                        continue;
                    }

                    if ($type === 'check_in' && $attendance?->check_in_at) {
                        continue;
                    }

                    if ($type === 'check_out' && $attendance?->check_out_at) {
                        continue;
                    }

                    $scheduledTime = Carbon::parse($schedule->work_date->format('Y-m-d').' '.$time, $timezone);
                    $reminderAt = $scheduledTime->copy()->subMinutes(15);

                    // Window check: triggers between reminderAt (H-15m) and reminderAt + 5m
                    if ($now->lt($reminderAt) || $now->gte($reminderAt->copy()->addMinutes(5))) {
                        continue;
                    }

                    $workDateStr = $schedule->work_date->format('Y-m-d');
                    if (FcmReminderLog::query()
                        ->where('employee_id', $employee->id)
                        ->whereDate('attendance_date', $schedule->work_date)
                        ->where('type', $type)
                        ->exists()) {
                        continue;
                    }

                    $timeFormatted = Carbon::parse($time)->format('H:i');
                    $title = $type === 'check_in' ? 'Pengingat Absensi Masuk' : 'Pengingat Absensi Pulang';
                    $body = $type === 'check_in'
                        ? sprintf('Jadwal kerja Anda dimulai pukul %s (15 menit lagi). Jangan lupa lakukan clock in.', $timeFormatted)
                        : sprintf('Jadwal kerja Anda berakhir pukul %s (15 menit lagi). Jangan lupa lakukan clock out.', $timeFormatted);

                    $sentCount = 0;
                    foreach ($targetUsers as $targetUser) {
                        $sentCount += $fcm->sendToUser($targetUser, $title, $body, '/portal/attendance');
                    }

                    if ($sentCount > 0) {
                        FcmReminderLog::query()->create([
                            'employee_id' => $employee->id,
                            'attendance_date' => $workDateStr,
                            'type' => $type,
                            'sent_at' => now(),
                        ]);
                    }
                }
            });

        return self::SUCCESS;
    }
}

