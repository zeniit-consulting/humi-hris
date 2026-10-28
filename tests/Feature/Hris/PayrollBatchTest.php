<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAllowance;
use App\Models\PayrollRun;
use App\Models\SubCompany;
use App\Models\User;
use App\Services\PayrollGenerationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollBatchTest extends TestCase
{
    use RefreshDatabase;

    private function employee(User $owner, array $attributes = []): Employee
    {
        return Employee::factory()->create(array_merge([
            'user_id' => $owner->id, 'hire_date' => '2025-01-01',
            'base_salary' => 2600000, 'pph21_method' => 'none', 'pph21_rate' => 0,
            'employment_type' => 'permanent', 'is_active' => true, 'employment_status' => 'active',
        ], $attributes));
    }

    public function test_generation_creates_independent_batches_and_selects_employees(): void
    {
        $owner = User::factory()->create();
        $a = $this->employee($owner);
        $b = $this->employee($owner);
        $service = app(PayrollGenerationService::class);
        $one = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$a->id]);
        $two = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$b->id]);
        $this->assertNotEquals($one->id, $two->id);
        $this->assertNotEmpty($one->code);
        $this->assertNotEquals($one->code, $two->code);
        $this->assertEquals([$a->id], $one->items->pluck('employee_id')->all());
        $this->assertEquals([$b->id], $two->items->pluck('employee_id')->all());
    }

    public function test_additional_batch_does_not_copy_salary_or_recurring_deductions(): void
    {
        $owner = User::factory()->create();
        $employee = $this->employee($owner, ['pph21_method' => 'gross', 'pph21_rate' => 50000]);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10',
            selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $item = $run->items->sole();
        foreach (['base_salary', 'allowances_total', 'kasbon_deduction', 'bpjs_total_employee', 'pph21_deduction', 'net_salary'] as $field) {
            $this->assertEquals(0, $item->$field, $field);
        }
        $this->assertFalse($item->tax_reviewed);
    }

    public function test_fixed_allowance_and_proration_changes_recalculate_from_basis_and_survive_regeneration(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        CompanySetting::query()->create(['user_id' => $owner->id, 'name' => 'Parent', 'active_working_days' => 26]);
        $employee = $this->employee($owner, ['hire_date' => '2026-10-15']);
        EmployeeAllowance::query()->create(['user_id' => $owner->id, 'employee_id' => $employee->id,
            'name' => 'Transport', 'amount' => 260000, 'is_active' => true]);
        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $item = $run->items->sole();
        $this->actingAs($owner)->put(route('hris.payrolls.items.update', [$run, $item]), [
            'proration_payable_days' => 13,
            'fixed_allowances' => [['name' => 'Transport', 'amount' => 520000]],
            'bonuses' => [['name' => 'Bonus', 'amount' => 100000]],
        ])->assertRedirect()->assertSessionHasNoErrors();
        $item->refresh();
        $this->assertEquals(1300000, $item->base_salary);
        $this->assertEquals(['Transport' => 260000], $item->allowance_breakdown);
        $this->assertEquals(1660000, $item->net_salary);
        $service->recalculateRun($run);
        $item = $run->fresh()->items->sole();
        $this->assertEquals(13, $item->proration_payable_days);
        $this->assertEquals(1660000, $item->net_salary);
        foreach ([0, 26, 13] as $days) {
            $this->actingAs($owner)->put(route('hris.payrolls.items.update', [$run, $item]), [
                'proration_payable_days' => $days,
            ])->assertRedirect()->assertSessionHasNoErrors();
            $this->assertEquals(round(2600000 * $days / 26, 2), $item->fresh()->base_salary);
        }
    }

    public function test_duplicate_regular_release_is_blocked_but_additional_is_allowed(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner);
        $service = app(PayrollGenerationService::class);
        $one = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $two = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $one->update(['is_locked' => true]);
        $two->update(['is_locked' => true]);
        $this->actingAs($owner)->post(route('hris.payrolls.release', $one))->assertRedirect()->assertSessionHasNoErrors();
        $this->post(route('hris.payrolls.release', $two))->assertSessionHasErrors('payroll');
        $this->assertFalse($two->fresh()->isReleased());
        $additional = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $additional->update(['is_locked' => true]);
        $this->post(route('hris.payrolls.release', $additional))->assertRedirect()->assertSessionHasNoErrors();
        $this->assertTrue($additional->fresh()->isReleased());
    }

    public function test_company_name_is_snapshotted_from_sub_company(): void
    {
        $owner = User::factory()->create();
        $sub = SubCompany::query()->create(['user_id' => $owner->id, 'code' => 'CHILD', 'name' => 'Child Company']);
        $employee = $this->employee($owner, ['sub_company_id' => $sub->id]);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $this->assertEquals('Child Company', $run->items->sole()->company_name);
        $sub->update(['name' => 'New Company']);
        $this->assertEquals('Child Company', $run->items->sole()->fresh()->company_name);
    }

    public function test_monthly_additional_tax_uses_period_total_and_requires_review_after_another_release(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner, ['base_salary' => 10000000, 'pph21_enabled' => true, 'pph21_method' => 'ter_bulanan', 'ptkp_category' => 'TK/0']);
        $service = app(PayrollGenerationService::class);
        $regular = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $regular->update(['is_locked' => true]);
        $this->actingAs($owner)->post(route('hris.payrolls.release', $regular))->assertRedirect()->assertSessionHasNoErrors();
        $additional = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $item = $additional->items->sole();
        $this->put(route('hris.payrolls.items.update', [$additional, $item]), [
            'bonuses' => [['name' => 'Extra', 'amount' => 2000000]],
        ])->assertRedirect()->assertSessionHasNoErrors();
        $expected = app(\App\Services\Pph21TerCalculatorService::class)->calculateMonthly('TK/0', 12000000, 'ter_bulanan');
        $this->assertEquals($expected['deduction'] - $regular->items->sole()->pph21_deduction, $item->fresh()->pph21_deduction);
        $another = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $another->update(['is_locked' => true]);
        $this->post(route('hris.payrolls.release', $another))->assertRedirect()->assertSessionHasNoErrors();
        $additional->update(['is_locked' => true]);
        $this->post(route('hris.payrolls.release', $additional))->assertSessionHasErrors('payroll');
        $this->assertFalse($additional->fresh()->isReleased());
    }

    public function test_unsupported_additional_tax_requires_explicit_review_even_when_zero(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner, ['pph21_method' => 'gross', 'pph21_rate' => 50000]);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $run->update(['is_locked' => true, 'locked_by' => $owner->id]);
        $this->actingAs($owner)->post(route('hris.payrolls.release', $run))->assertSessionHasErrors('payroll');
        $this->put(route('hris.payrolls.items.update', [$run, $run->items->sole()]), [
            'bonuses' => [['name' => 'Extra', 'amount' => 100000]], 'tax_reviewed' => true,
            'pph21_deduction' => 0,
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->post(route('hris.payrolls.release', $run))->assertRedirect()->assertSessionHasNoErrors();
        $this->assertEquals(100000, $run->fresh()->total_net_salary);
    }

    public function test_foreign_employee_selection_and_proration_overflow_are_rejected(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $other = User::factory()->create();
        $foreign = $this->employee($other);
        $this->actingAs($owner)->post(route('hris.payrolls.generate'), [
            'period' => '2026-10', 'selected_employee_ids' => [$foreign->id],
        ])->assertSessionHasErrors('selected_employee_ids.0');
        $employee = $this->employee($owner);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $item = $run->items->sole();
        $this->put(route('hris.payrolls.items.update', [$run, $item]), ['proration_payable_days' => 999])->assertSessionHasErrors('proration_payable_days');
        $run->update(['status' => 'released', 'is_saved' => true]);
        $this->post(route('hris.payrolls.generate'), ['period' => '2026-10', 'run_id' => $run->id])->assertSessionHasErrors('payroll');
        $this->assertTrue($run->fresh()->isReleased());
    }

    public function test_recalculation_can_explicitly_reset_overrides_to_generated_values(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $item = $run->items->sole();
        $this->actingAs($owner)->put(route('hris.payrolls.items.update', [$run, $item]), ['base_salary' => 123])->assertRedirect()->assertSessionHasNoErrors();
        $this->put(route('hris.payrolls.items.update', [$run, $item]), ['reset_overrides' => true])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertEquals(2600000, $item->fresh()->base_salary);
        $this->assertEmpty($item->fresh()->manual_overrides);
    }

    public function test_manual_salary_edit_becomes_a_stable_basis_for_later_proration(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        CompanySetting::query()->create(['user_id' => $owner->id, 'name' => 'Parent', 'active_working_days' => 26]);
        $employee = $this->employee($owner);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $item = $run->items->sole();
        $this->actingAs($owner)->put(route('hris.payrolls.items.update', [$run, $item]), ['base_salary' => 5200000])->assertRedirect()->assertSessionHasNoErrors();
        $this->put(route('hris.payrolls.items.update', [$run, $item]), ['proration_payable_days' => 13])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertEquals(2600000, $item->fresh()->base_salary);
        app(PayrollGenerationService::class)->recalculateRun($run);
        $this->assertEquals(2600000, $item->fresh()->base_salary);
    }

    public function test_additional_recurring_deduction_inputs_are_rejected_instead_of_silently_ignored(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10', batchPurpose: 'additional');
        $this->actingAs($owner)->put(route('hris.payrolls.items.update', [$run, $run->items->sole()]), ['kasbon_deduction' => 1000])->assertSessionHasErrors('kasbon_deduction');
    }

    public function test_additional_before_regular_does_not_block_scheduler_or_release(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner, ['pph21_enabled' => true, 'pph21_method' => 'ter_bulanan']);
        $additional = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10', batchPurpose: 'additional');
        $additional->update(['is_locked' => true]);
        $this->actingAs($owner)->post(route('hris.payrolls.release', $additional))->assertRedirect()->assertSessionHasNoErrors();
        $this->artisan('payroll:auto-generate', ['--owner' => $owner->id, '--period' => '2026-10'])->assertSuccessful();
        $regular = PayrollRun::query()->where('user_id', $owner->id)->where('batch_purpose', 'regular')->sole();
        $regular->update(['is_locked' => true]);
        $this->post(route('hris.payrolls.release', $regular))->assertRedirect()->assertSessionHasNoErrors();
        $this->artisan('payroll:auto-generate', ['--owner' => $owner->id, '--period' => '2026-10'])->assertSuccessful();
        $this->assertEquals(2, PayrollRun::query()->where('user_id', $owner->id)->count());
    }

    public function test_migration_preserves_legacy_draft_edits_and_selection_on_recalculation(): void
    {
        $owner = User::factory()->create();
        $selected = $this->employee($owner);
        $excluded = $this->employee($owner);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$selected->id]);
        $item = $run->items->sole();
        $migration = require database_path('migrations/2026_10_29_000001_add_payroll_batches_and_item_overrides.php');
        $migration->down();
        \Illuminate\Support\Facades\DB::table('payroll_items')->where('id', $item->id)->update([
            'base_salary' => 123456, 'allowances_total' => 650000,
            'allowance_breakdown' => json_encode([]),
            'variable_allowance_breakdown' => json_encode(['Transport' => 200000]),
            'bonus_breakdown' => json_encode(['Extra' => 50000]),
            'manual_deduction_breakdown' => json_encode(['Koreksi' => 5000]),
        ]);
        $migration->up();
        app(PayrollGenerationService::class)->recalculateRun($run->fresh());
        $this->assertEquals([$selected->id], $run->fresh()->items->pluck('employee_id')->all());
        $item = $item->fresh();
        $this->assertEquals(123456, $item->base_salary);
        $this->assertEquals(650000, $item->allowances_total);
        $this->assertEquals(['Extra' => 50000], $item->bonus_breakdown);
        $this->assertEquals(['Koreksi' => 5000], $item->manual_deduction_breakdown);
    }

    public function test_employee_can_choose_released_batches_without_other_employee_or_draft_leaks(): void
    {
        $owner = User::factory()->create();
        $user = User::factory()->create(['parent_user_id' => $owner->id, 'role' => 'user', 'email_verified_at' => now()]);
        $employee = $this->employee($owner, ['email' => $user->email]);
        $other = $this->employee($owner);
        $service = app(PayrollGenerationService::class);
        $regular = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $regular->update(['status' => 'released', 'is_saved' => true]);
        $additional = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $additional->update(['status' => 'released', 'is_saved' => true]);
        $unrelated = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$other->id]);
        $unrelated->update(['status' => 'released', 'is_saved' => true]);
        $draft = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id], batchPurpose: 'additional');
        $this->actingAs($user)->postJson('/portal/api/payrolls/preview-secure', [
            'period' => '2026-10', 'current_password' => 'password', 'run_id' => $regular->id,
        ])->assertOk()->assertJsonPath('data.run.id', $regular->id)->assertJsonCount(2, 'data.batches');
        $this->postJson('/portal/api/payrolls/preview-secure', [
            'period' => '2026-10', 'current_password' => 'password', 'run_id' => $unrelated->id,
        ])->assertNotFound();
        $this->app['auth']->guard('web')->logout();
        \Laravel\Sanctum\Sanctum::actingAs($user, ['mobile']);
        $this->getJson('/api/mobile/v1/payrolls/preview?period=2026-10')->assertOk()
            ->assertJsonPath('data.run.id', $additional->id)->assertJsonCount(2, 'data.batches');
        $this->getJson('/api/mobile/v1/payrolls/history?year=2026')->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_payslip_data_and_filename_use_batch_and_stable_sub_company_identity(): void
    {
        $owner = User::factory()->create();
        CompanySetting::query()->create(['user_id' => $owner->id, 'name' => 'Parent Name', 'details' => 'Parent details']);
        $sub = SubCompany::query()->create(['user_id' => $owner->id, 'code' => 'CH', 'name' => 'Child Name', 'address' => 'Child address']);
        $employee = $this->employee($owner, ['sub_company_id' => $sub->id]);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $sub->update(['name' => 'Renamed Child']);
        $service = app(\App\Services\PayslipPdfService::class);
        $method = new \ReflectionMethod($service, 'viewData');
        $data = $method->invoke($service, $run, $run->items->sole(), $owner->id, 'test.pdf');
        $this->assertEquals('Child Name', $data['companyName']);
        $this->assertEquals('Child address', $data['companyDetails']);
        $this->assertStringContainsString($run->code, $service->documentTitle($employee, $run->period, $run->code));
    }

    public function test_recalculation_refreshes_approved_unpaid_days_while_preserving_allowance_overrides(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner);
        $leave = \App\Models\LeaveRequest::factory()->create(['user_id' => $owner->id, 'employee_id' => $employee->id, 'leave_type' => 'unpaid', 'status' => 'approved', 'start_date' => '2026-10-05', 'end_date' => '2026-10-05']);
        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10');
        $item = $run->items->sole();
        $this->actingAs($owner)->put(route('hris.payrolls.items.update', [$run, $item]), ['fixed_allowances' => [['name' => 'Transport', 'amount' => 260000]]])->assertRedirect()->assertSessionHasNoErrors();
        $leave->update(['end_date' => '2026-10-06']);
        $service->recalculateRun($run);
        $this->assertEquals(2, $item->fresh()->calculation_basis['unpaid_days']);
        $this->assertEquals(round(2860000 / 22 * 2, 2), $item->fresh()->unpaid_leave_deduction);
        $leave->update(['status' => 'rejected']);
        $service->recalculateRun($run);
        $this->assertEquals(0, $item->fresh()->unpaid_leave_deduction);
    }

    public function test_regular_generation_cannot_convert_a_thr_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $run = PayrollRun::factory()->create(['user_id' => $owner->id, 'type' => 'thr', 'period' => '2026-10']);
        $this->actingAs($owner)->post(route('hris.payrolls.generate'), ['period' => '2026-10', 'run_id' => $run->id])->assertSessionHasErrors('run_id');
        $this->assertEquals('thr', $run->fresh()->type);
    }

    public function test_reverted_penalty_stays_reverted_after_recalculation(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->employee($owner);
        \App\Models\EmployeeDeduction::query()->create(['user_id' => $owner->id, 'employee_id' => $employee->id, 'type' => 'denda', 'amount' => 100000, 'deduction_date' => '2026-10-05']);
        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10');
        $item = $run->items->sole();
        $this->assertEquals(100000, $item->denda_deduction);
        $this->actingAs($owner)->post(route('hris.payrolls.items.revert-denda', [$run, $item]), ['denda_id' => $item->denda_breakdown[0]['id'], 'action' => 'revert'])->assertRedirect()->assertSessionHasNoErrors();
        $service->recalculateRun($run);
        $this->assertEquals(0, $item->fresh()->denda_deduction);
        $this->assertTrue($item->fresh()->denda_breakdown[0]['is_reverted']);
    }
}
