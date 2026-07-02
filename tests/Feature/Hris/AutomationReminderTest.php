<?php

namespace Tests\Feature\Hris;

use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\EmployeeBankAccount;
use App\Models\LeaveRequest;
use App\Models\NotificationAnnouncement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutomationReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_approval_reminder_command_publishes_one_daily_summary_per_owner(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'first_name' => 'Ayu',
            'last_name' => 'Lestari',
        ]);

        $attendanceRequest = AttendanceCorrectionRequest::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'attendance_date' => today()->subDay()->toDateString(),
            'reason' => 'Lupa checkout',
            'status' => 'pending',
        ]);
        $attendanceRequest->forceFill([
            'created_at' => now()->subHours(25),
            'updated_at' => now()->subHours(25),
        ])->save();

        LeaveRequest::factory()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'status' => 'pending',
            'created_at' => now()->subHours(26),
            'updated_at' => now()->subHours(26),
        ]);

        $this->artisan('approval:remind-pending --hours=24')
            ->expectsOutputToContain('Owner #'.$owner->id.': reminder approval pending dibuat')
            ->assertExitCode(0);

        $this->assertDatabaseHas('notification_announcements', [
            'user_id' => $owner->id,
            'title' => 'Reminder Approval Pending',
            'audience' => 'all',
            'channel' => 'portal',
            'status' => 'published',
        ]);

        $announcement = NotificationAnnouncement::query()->firstOrFail();

        $this->assertStringContainsString('2 approval menunggu lebih dari 24 jam', $announcement->message);
        $this->assertStringContainsString('Absensi: 1', $announcement->message);
        $this->assertStringContainsString('Cuti: 1', $announcement->message);

        $this->artisan('approval:remind-pending --hours=24')->assertExitCode(0);

        $this->assertSame(1, NotificationAnnouncement::query()->count());
    }

    public function test_incomplete_profile_reminder_command_publishes_one_daily_summary_per_owner(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        Employee::factory()->create([
            'user_id' => $owner->id,
            'first_name' => 'Ayu',
            'last_name' => 'Lestari',
            'is_active' => true,
            'address' => null,
            'ktp_number' => null,
            'bpjs_kesehatan_number' => null,
            'bpjs_ketenagakerjaan_number' => null,
            'emergency_contact_name' => null,
            'emergency_contact_phone' => null,
        ]);

        $completeEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'is_active' => true,
            'address' => 'Jl. Lengkap',
            'ktp_number' => '3174095708960001',
            'bpjs_kesehatan_number' => '0001234567890',
            'bpjs_ketenagakerjaan_number' => '19001234567',
            'emergency_contact_name' => 'Budi',
            'emergency_contact_phone' => '081298765432',
        ]);

        EmployeeBankAccount::factory()->create([
            'employee_id' => $completeEmployee->id,
            'is_primary' => true,
        ]);

        $this->artisan('employee:remind-incomplete-profile')
            ->expectsOutputToContain('Owner #'.$owner->id.': reminder kelengkapan profil dibuat')
            ->assertExitCode(0);

        $announcement = NotificationAnnouncement::query()
            ->where('title', 'Reminder Kelengkapan Profil Karyawan')
            ->firstOrFail();

        $this->assertSame($owner->id, $announcement->user_id);
        $this->assertStringContainsString('1 karyawan masih perlu melengkapi profil', $announcement->message);
        $this->assertStringContainsString('Ayu Lestari', $announcement->message);

        $this->artisan('employee:remind-incomplete-profile')->assertExitCode(0);

        $this->assertSame(1, NotificationAnnouncement::query()->count());
    }
}
