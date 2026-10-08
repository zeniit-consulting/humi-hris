<?php

namespace Tests\Feature\Hris;

use App\Models\Division;
use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollReleaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_generated_payroll_starts_as_draft(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        $this->assertTrue($run->isDraft());
        $this->assertFalse($run->isReleased());
        $this->assertNull($run->released_at);
        $this->assertNull($run->released_by);
    }

    public function test_draft_payroll_can_be_locked_and_unlocked(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        // Lock draft payroll
        $response = $this->actingAs($user)
            ->post(route('hris.payrolls.lock', $run));

        $response->assertRedirect();
        $run->refresh();
        $this->assertTrue((bool) $run->is_locked);
        $this->assertTrue($run->isDraft());

        // Unlock draft payroll using phone PIN
        $response = $this->actingAs($user)
            ->post(route('hris.payrolls.lock', $run), [
                'pin' => '081234567890',
            ]);

        $response->assertRedirect();
        $run->refresh();
        $this->assertFalse((bool) $run->is_locked);
        $this->assertTrue($run->isDraft());
    }

    public function test_unlocked_draft_payroll_cannot_be_released(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('hris.payrolls.release', $run));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Kunci (lock) draft payroll terlebih dahulu sebelum melakukan release.');

        $run->refresh();
        $this->assertTrue($run->isDraft());
    }

    public function test_locked_draft_payroll_can_be_released(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => true,
            'locked_by' => $user->id,
            'locked_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->post(route('hris.payrolls.release', $run));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $run->refresh();
        $this->assertTrue($run->isReleased());
        $this->assertFalse($run->isDraft());
        $this->assertEquals('released', $run->status);
        $this->assertTrue((bool) $run->is_saved);
        $this->assertNotNull($run->released_at);
        $this->assertEquals($user->id, $run->released_by);
    }

    public function test_already_released_payroll_cannot_be_released_again(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
            'released_at' => now(),
            'released_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->post(route('hris.payrolls.release', $run));

        $response->assertRedirect();
        $response->assertSessionHas('info', 'Payroll periode ini sudah dirilis sebelumnya.');
    }

    public function test_released_payroll_cannot_be_unlocked(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
            'released_at' => now(),
            'released_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->post(route('hris.payrolls.lock', $run), [
                'pin' => '081234567890',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Payroll yang sudah dirilis tidak memerlukan lock/unlock.');

        $run->refresh();
        $this->assertTrue((bool) $run->is_locked);
    }

    public function test_released_payroll_item_cannot_be_modified(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
            'released_at' => now(),
            'released_by' => $user->id,
        ]);

        $item = PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 5_000_000,
            'allowances_total' => 0,
            'deductions_total' => 0,
            'net_salary' => 5_000_000,
        ]);

        $response = $this->actingAs($user)
            ->put(route('hris.payrolls.items.update', [$run, $item]), [
                'base_salary' => '6.000.000',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Payroll yang sudah disimpan tidak bisa diedit.');

        $item->refresh();
        $this->assertEquals(5_000_000.00, (float) $item->base_salary);
    }

    public function test_employee_cannot_preview_draft_payslip_in_portal(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'employee@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
        ]);

        $division = Division::factory()->create(['user_id' => $user->accountOwnerId()]);
        $position = Position::factory()->create(['user_id' => $user->accountOwnerId(), 'division_id' => $division->id]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => '2026-05',
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6_000_000,
            'allowances_total' => 500_000,
            'deductions_total' => 0,
            'net_salary' => 6_500_000,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/portal/api/payrolls/preview-secure', [
                'period' => '2026-05',
                'current_password' => 'password123',
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Slip gaji periode ini masih berstatus draft dan belum dirilis oleh admin.',
        ]);
    }

    public function test_employee_can_preview_released_payslip_in_portal(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'employee@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
        ]);

        $division = Division::factory()->create(['user_id' => $user->accountOwnerId()]);
        $position = Position::factory()->create(['user_id' => $user->accountOwnerId(), 'division_id' => $division->id]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => '2026-05',
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
            'released_at' => now(),
            'released_by' => $user->accountOwnerId(),
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6_000_000,
            'allowances_total' => 500_000,
            'deductions_total' => 0,
            'net_salary' => 6_500_000,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/portal/api/payrolls/preview-secure', [
                'period' => '2026-05',
                'current_password' => 'password123',
            ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.items.0.net_salary', '6500000.00');
    }

    public function test_employee_cannot_export_draft_payslip_pdf(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'employee@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
        ]);

        $division = Division::factory()->create(['user_id' => $user->accountOwnerId()]);
        $position = Position::factory()->create(['user_id' => $user->accountOwnerId(), 'division_id' => $division->id]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => '2026-05',
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6_000_000,
            'allowances_total' => 500_000,
            'deductions_total' => 0,
            'net_salary' => 6_500_000,
        ]);

        $response = $this->actingAs($user)
            ->post(route('portal.payroll.export'), [
                'period' => '2026-05',
                'current_password' => 'password123',
            ]);

        $response->assertNotFound();
    }

    public function test_employee_can_export_released_payslip_pdf(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'employee@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
        ]);

        $division = Division::factory()->create(['user_id' => $user->accountOwnerId()]);
        $position = Position::factory()->create(['user_id' => $user->accountOwnerId(), 'division_id' => $division->id]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'birth_date' => '1995-05-12',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => '2026-05',
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
            'released_at' => now(),
            'released_by' => $user->accountOwnerId(),
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6_000_000,
            'allowances_total' => 500_000,
            'deductions_total' => 0,
            'net_salary' => 6_500_000,
        ]);

        $response = $this->actingAs($user)
            ->post(route('portal.payroll.export'), [
                'period' => '2026-05',
                'current_password' => 'password123',
            ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_mobile_api_employee_cannot_preview_draft_payroll(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'mobile-staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => 'mobile-staff@example.com',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $owner->id,
            'period' => '2026-06',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        PayrollItem::query()->create([
            'user_id' => $owner->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 5_000_000,
            'allowances_total' => 0,
            'deductions_total' => 0,
            'net_salary' => 5_000_000,
        ]);

        \Laravel\Sanctum\Sanctum::actingAs($subUser, ['mobile']);

        $response = $this->getJson('/api/mobile/v1/payrolls/preview?period=2026-06');
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(0, 'data.items');
    }

    public function test_mobile_api_history_only_returns_released_payrolls(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'mobile-history@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => 'mobile-history@example.com',
        ]);

        // Released run
        $releasedRun = PayrollRun::factory()->create([
            'user_id' => $owner->id,
            'type' => 'regular',
            'period' => '2026-05',
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'status' => 'released',
            'is_saved' => true,
            'is_locked' => true,
        ]);

        PayrollItem::query()->create([
            'user_id' => $owner->id,
            'payroll_run_id' => $releasedRun->id,
            'employee_id' => $employee->id,
            'base_salary' => 5_000_000,
            'net_salary' => 5_000_000,
        ]);

        // Draft run
        $draftRun = PayrollRun::factory()->create([
            'user_id' => $owner->id,
            'type' => 'regular',
            'period' => '2026-06',
            'period_start' => '2026-06-01',
            'period_end' => '2026-06-30',
            'status' => 'draft',
            'is_saved' => false,
            'is_locked' => false,
        ]);

        PayrollItem::query()->create([
            'user_id' => $owner->id,
            'payroll_run_id' => $draftRun->id,
            'employee_id' => $employee->id,
            'base_salary' => 5_000_000,
            'net_salary' => 5_000_000,
        ]);

        \Laravel\Sanctum\Sanctum::actingAs($subUser, ['mobile']);

        $response = $this->getJson('/api/mobile/v1/payrolls/history?year=2026');
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'data.items');
        $response->assertJsonPath('data.items.0.period', '2026-05');
    }
}
