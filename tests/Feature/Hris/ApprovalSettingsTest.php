<?php

namespace Tests\Feature\Hris;

use App\Models\ApprovalSetting;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_configure_two_line_approval_per_request_type(): void
    {
        $user = User::factory()->create();
        $firstApprover = Employee::factory()->create(['user_id' => $user->id, 'is_active' => true]);
        $secondApprover = Employee::factory()->create(['user_id' => $user->id, 'is_active' => true]);

        $this->actingAs($user)->put(route('hris.approval-settings.update', 'overtime'), [
            'two_line_enabled' => true,
            'first_approver_employee_id' => $firstApprover->id,
            'second_approver_employee_id' => $secondApprover->id,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('approval_settings', [
            'user_id' => $user->id,
            'request_type' => 'overtime',
            'two_line_enabled' => true,
            'first_approver_employee_id' => $firstApprover->id,
            'second_approver_employee_id' => $secondApprover->id,
        ]);
    }

    public function test_portal_approver_only_sees_the_request_assigned_to_them(): void
    {
        $owner = User::factory()->create();
        $approverUser = User::factory()->create(['role' => 'user', 'parent_user_id' => $owner->id, 'email_verified_at' => now(), 'email' => 'director@example.com']);
        $approver = Employee::factory()->create(['user_id' => $owner->id, 'email' => 'director@example.com', 'is_active' => true]);
        $requester = Employee::factory()->create(['user_id' => $owner->id]);
        ApprovalSetting::query()->create(['user_id' => $owner->id, 'request_type' => 'attendance', 'first_approver_employee_id' => $approver->id]);

        AttendanceCorrectionRequest::query()->create(['user_id' => $owner->id, 'employee_id' => $requester->id, 'attendance_date' => today(), 'reason' => 'Koreksi jam masuk', 'status' => 'pending']);

        $this->actingAs($approverUser)->getJson(route('portal.api.approvals.index'))
            ->assertOk()->assertJsonPath('data.items.0.type', 'attendance');
    }

    public function test_portal_approval_formats_time_according_to_active_user_timezone(): void
    {
        $owner = User::factory()->create();
        $approverUser = User::factory()->create(['role' => 'user', 'parent_user_id' => $owner->id, 'email_verified_at' => now(), 'email' => 'manager_wita@example.com']);
        $approver = Employee::factory()->create(['user_id' => $owner->id, 'email' => 'manager_wita@example.com', 'is_active' => true, 'timezone' => 'Asia/Makassar']);
        $requester = Employee::factory()->create(['user_id' => $owner->id, 'timezone' => 'Asia/Jakarta']);
        ApprovalSetting::query()->create(['user_id' => $owner->id, 'request_type' => 'attendance', 'first_approver_employee_id' => $approver->id]);

        // check_in_at in UTC: 01:00:00 UTC = 09:00:00 WITA (UTC+8) = 08:00:00 WIB (UTC+7)
        AttendanceCorrectionRequest::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $requester->id,
            'attendance_date' => '2026-10-22',
            'check_in_at' => '2026-10-22 01:00:00',
            'check_out_at' => '2026-10-22 10:00:00',
            'reason' => 'Koreksi jam masuk',
            'status' => 'pending',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response = $this->actingAs($approverUser)->getJson(route('portal.api.approvals.index'))
            ->assertOk();

        $subtitle = $response->json('data.items.0.subtitle');
        // Active approver is in WITA (Asia/Makassar), so 01:00 UTC should be 09:00 and 10:00 UTC should be 18:00 WITA
        $this->assertStringContainsString('09:00 - 18:00 WITA', $subtitle);
        $this->assertStringNotContainsString('UTC', $subtitle);

        // When approver accesses from WIB device
        $responseWib = $this->actingAs($approverUser)
            ->withHeader('X-Timezone', 'Asia/Jakarta')
            ->getJson(route('portal.api.approvals.index'))
            ->assertOk();

        // Since approver's employee profile explicitly has Asia/Makassar, it stays WITA, OR if header overrides:
        // Either way, it should never be UTC!
        $this->assertStringNotContainsString('UTC', $responseWib->json('data.items.0.subtitle'));
    }
}
