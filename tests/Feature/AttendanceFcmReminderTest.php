<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\FcmReminderLog;
use App\Models\User;
use App\Services\FcmNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AttendanceFcmReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_fcm_reminder_sends_notification_15_minutes_before_shift_start(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $portalUser = User::factory()->create([
            'email' => 'portal.employee@example.com',
            'phone' => '081234567890',
            'parent_user_id' => $owner->id,
            'role' => 'user',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
            'phone' => '081234567890',
            'email' => 'portal.employee@example.com',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
        ]);

        $today = Carbon::parse('2026-09-17 07:45:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        EmployeeSchedule::query()->create([
            'employee_id' => $employee->id,
            'work_date' => $today->toDateString(),
            'shift_code' => 'PAGI',
            'shift_name' => 'Shift Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        $service = \Mockery::mock(FcmNotificationService::class);
        $service->shouldReceive('sendToUser')
            ->once()
            ->with(
                \Mockery::on(fn (User $user) => $user->id === $portalUser->id),
                'Pengingat Absensi Masuk',
                \Mockery::on(fn (string $body) => str_contains($body, '08:00') && str_contains($body, '15 menit lagi')),
                '/portal/attendance'
            )
            ->andReturn(1);

        $this->app->instance(FcmNotificationService::class, $service);

        $this->artisan('attendance:send-fcm-reminders')->assertSuccessful();

        $this->assertTrue(
            FcmReminderLog::query()
                ->where('employee_id', $employee->id)
                ->whereDate('attendance_date', $today)
                ->where('type', 'check_in')
                ->exists()
        );

        // Running again should not duplicate
        $this->artisan('attendance:send-fcm-reminders')->assertSuccessful();
        $this->assertSame(1, FcmReminderLog::query()->count());

        Carbon::setTestNow();
    }

    public function test_attendance_fcm_reminder_skips_when_employee_already_checked_in(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $portalUser = User::factory()->create([
            'email' => 'portal.employee2@example.com',
            'phone' => '081298765432',
            'parent_user_id' => $owner->id,
            'role' => 'user',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'first_name' => 'Siti',
            'last_name' => 'Aminah',
            'phone' => '081298765432',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
        ]);

        $today = Carbon::parse('2026-09-17 07:46:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        $schedule = EmployeeSchedule::query()->create([
            'employee_id' => $employee->id,
            'work_date' => $today->toDateString(),
            'shift_code' => 'PAGI',
            'shift_name' => 'Shift Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        EmployeeAttendance::query()->create([
            'employee_id' => $employee->id,
            'attendance_date' => $today->toDateString(),
            'check_in_at' => $today->copy()->subMinutes(10),
            'status' => 'present',
        ]);

        $service = \Mockery::mock(FcmNotificationService::class);
        $service->shouldNotReceive('sendToUser');
        $this->app->instance(FcmNotificationService::class, $service);

        $this->artisan('attendance:send-fcm-reminders')->assertSuccessful();

        $this->assertDatabaseMissing('fcm_reminder_logs', [
            'employee_id' => $employee->id,
            'type' => 'check_in',
        ]);

        Carbon::setTestNow();
    }

    public function test_attendance_fcm_reminder_sends_notification_15_minutes_before_shift_end(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $portalUser = User::factory()->create([
            'email' => 'portal.checkout@example.com',
            'phone' => '081211112222',
            'parent_user_id' => $owner->id,
            'role' => 'user',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'first_name' => 'Ahmad',
            'last_name' => 'Dahlan',
            'phone' => '081211112222',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
        ]);

        $today = Carbon::parse('2026-09-17 16:45:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        EmployeeSchedule::query()->create([
            'employee_id' => $employee->id,
            'work_date' => $today->toDateString(),
            'shift_code' => 'PAGI',
            'shift_name' => 'Shift Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        // Employee checked in earlier, but has not checked out
        EmployeeAttendance::query()->create([
            'employee_id' => $employee->id,
            'attendance_date' => $today->toDateString(),
            'check_in_at' => $today->copy()->subHours(8),
            'status' => 'present',
        ]);

        $service = \Mockery::mock(FcmNotificationService::class);
        $service->shouldReceive('sendToUser')
            ->once()
            ->with(
                \Mockery::on(fn (User $user) => $user->id === $portalUser->id),
                'Pengingat Absensi Pulang',
                \Mockery::on(fn (string $body) => str_contains($body, '17:00') && str_contains($body, '15 menit lagi')),
                '/portal/attendance'
            )
            ->andReturn(1);

        $this->app->instance(FcmNotificationService::class, $service);

        $this->artisan('attendance:send-fcm-reminders')->assertSuccessful();

        $this->assertTrue(
            FcmReminderLog::query()
                ->where('employee_id', $employee->id)
                ->whereDate('attendance_date', $today)
                ->where('type', 'check_out')
                ->exists()
        );

        Carbon::setTestNow();
    }

    public function test_attendance_fcm_reminder_skips_offboarded_or_inactive_employees(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $portalUser = User::factory()->create([
            'phone' => '081233334444',
            'parent_user_id' => $owner->id,
            'role' => 'user',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'phone' => '081233334444',
            'is_active' => false,
            'offboarded_at' => '2026-09-01',
        ]);

        $today = Carbon::parse('2026-09-17 07:45:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        EmployeeSchedule::query()->create([
            'employee_id' => $employee->id,
            'work_date' => $today->toDateString(),
            'shift_code' => 'PAGI',
            'shift_name' => 'Shift Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        $service = \Mockery::mock(FcmNotificationService::class);
        $service->shouldNotReceive('sendToUser');
        $this->app->instance(FcmNotificationService::class, $service);

        $this->artisan('attendance:send-fcm-reminders')->assertSuccessful();

        $this->assertSame(0, FcmReminderLog::query()->count());

        Carbon::setTestNow();
    }
}
