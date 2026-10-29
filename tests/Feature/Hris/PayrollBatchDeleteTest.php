<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\User;
use App\Services\PayrollGenerationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollBatchDeleteTest extends TestCase
{
    use RefreshDatabase;

    private function createEmployee(User $owner, array $attributes = []): Employee
    {
        return Employee::factory()->create(array_merge([
            'user_id' => $owner->id,
            'hire_date' => '2025-01-01',
            'base_salary' => 5000000,
            'pph21_method' => 'none',
            'pph21_rate' => 0,
            'employment_type' => 'permanent',
            'is_active' => true,
            'employment_status' => 'active',
        ], $attributes));
    }

    public function test_user_can_delete_draft_payroll_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->createEmployee($owner);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);

        $this->assertDatabaseHas('payroll_runs', ['id' => $run->id]);
        $this->assertDatabaseHas('payroll_items', ['payroll_run_id' => $run->id]);

        $response = $this->actingAs($owner)->delete(route('hris.payrolls.destroy', $run));

        $response->assertRedirect(route('hris.payrolls.index', ['period' => '2026-10', 'type' => 'regular']));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('payroll_runs', ['id' => $run->id]);
        $this->assertDatabaseMissing('payroll_items', ['payroll_run_id' => $run->id]);
    }

    public function test_deleting_batch_redirects_to_next_remaining_batch_if_exists(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $empA = $this->createEmployee($owner);
        $empB = $this->createEmployee($owner);

        $service = app(PayrollGenerationService::class);
        $batch1 = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$empA->id]);
        $batch2 = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$empB->id]);

        $response = $this->actingAs($owner)->delete(route('hris.payrolls.destroy', $batch2));

        $response->assertRedirect(route('hris.payrolls.index', [
            'period' => '2026-10',
            'type' => 'regular',
            'run_id' => $batch1->id,
        ]));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('payroll_runs', ['id' => $batch2->id]);
        $this->assertDatabaseHas('payroll_runs', ['id' => $batch1->id]);
    }

    public function test_cannot_delete_released_payroll_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $employee = $this->createEmployee($owner);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $run->update([
            'status' => 'released',
            'released_at' => now(),
            'is_saved' => true,
        ]);

        $response = $this->actingAs($owner)->from(route('hris.payrolls.index'))->delete(route('hris.payrolls.destroy', $run));

        $response->assertRedirect(route('hris.payrolls.index'));
        $response->assertSessionHas('error', 'Batch payroll yang telah dirilis tidak dapat dihapus.');

        $this->assertDatabaseHas('payroll_runs', ['id' => $run->id]);
        $this->assertDatabaseHas('payroll_items', ['payroll_run_id' => $run->id]);
    }

    public function test_cannot_delete_batch_locked_by_another_user(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $admin = User::factory()->create([
            'email_verified_at' => now(),
            'parent_user_id' => $owner->id,
            'role' => 'admin',
        ]);
        $otherAdmin = User::factory()->create([
            'email_verified_at' => now(),
            'parent_user_id' => $owner->id,
            'role' => 'admin',
        ]);

        $employee = $this->createEmployee($owner);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$employee->id]);
        $run->update([
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by' => $otherAdmin->id,
        ]);

        $response = $this->actingAs($admin)->from(route('hris.payrolls.index'))->delete(route('hris.payrolls.destroy', $run));

        $response->assertRedirect(route('hris.payrolls.index'));
        $response->assertSessionHas('error', 'Batch payroll sedang dikunci oleh admin lain.');

        $this->assertDatabaseHas('payroll_runs', ['id' => $run->id]);
    }

    public function test_user_cannot_delete_payroll_batch_belonging_to_another_company(): void
    {
        $ownerA = User::factory()->create(['email_verified_at' => now()]);
        $ownerB = User::factory()->create(['email_verified_at' => now()]);

        $empA = $this->createEmployee($ownerA);

        $service = app(PayrollGenerationService::class);
        $runA = $service->generateForPeriod($ownerA->id, '2026-10', selectedEmployeeIds: [$empA->id]);

        $response = $this->actingAs($ownerB)->delete(route('hris.payrolls.destroy', $runA));

        $response->assertNotFound();
        $this->assertDatabaseHas('payroll_runs', ['id' => $runA->id]);
    }

    public function test_user_can_delete_single_item_from_draft_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $empA = $this->createEmployee($owner, ['base_salary' => 5000000]);
        $empB = $this->createEmployee($owner, ['base_salary' => 7000000]);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$empA->id, $empB->id]);

        $this->assertEquals(2, $run->employees_count);
        $this->assertCount(2, $run->items);

        $itemA = $run->items->firstWhere('employee_id', $empA->id);
        $itemB = $run->items->firstWhere('employee_id', $empB->id);

        $response = $this->actingAs($owner)->delete(route('hris.payrolls.items.destroy', [$run, $itemA]));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('payroll_items', ['id' => $itemA->id]);
        $this->assertDatabaseHas('payroll_items', ['id' => $itemB->id]);

        $run->refresh();
        $this->assertEquals(1, $run->employees_count);
        $this->assertEquals([$empB->id], $run->selected_employee_ids);
    }

    public function test_cannot_delete_item_from_released_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $emp = $this->createEmployee($owner);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$emp->id]);
        $run->update([
            'status' => 'released',
            'released_at' => now(),
            'is_saved' => true,
        ]);

        $item = $run->items->sole();

        $response = $this->actingAs($owner)->delete(route('hris.payrolls.items.destroy', [$run, $item]));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('payroll_items', ['id' => $item->id]);
    }

    public function test_user_can_bulk_delete_items_from_draft_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $empA = $this->createEmployee($owner, ['base_salary' => 5000000]);
        $empB = $this->createEmployee($owner, ['base_salary' => 6000000]);
        $empC = $this->createEmployee($owner, ['base_salary' => 7000000]);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$empA->id, $empB->id, $empC->id]);

        $this->assertEquals(3, $run->employees_count);
        $itemA = $run->items->firstWhere('employee_id', $empA->id);
        $itemB = $run->items->firstWhere('employee_id', $empB->id);
        $itemC = $run->items->firstWhere('employee_id', $empC->id);

        $response = $this->actingAs($owner)->post(route('hris.payrolls.items.bulk-destroy', $run), [
            'item_ids' => [$itemA->id, $itemB->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('payroll_items', ['id' => $itemA->id]);
        $this->assertDatabaseMissing('payroll_items', ['id' => $itemB->id]);
        $this->assertDatabaseHas('payroll_items', ['id' => $itemC->id]);

        $run->refresh();
        $this->assertEquals(1, $run->employees_count);
        $this->assertEquals([$empC->id], $run->selected_employee_ids);
    }

    public function test_cannot_bulk_delete_items_from_released_batch(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $emp = $this->createEmployee($owner);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($owner->id, '2026-10', selectedEmployeeIds: [$emp->id]);
        $run->update([
            'status' => 'released',
            'released_at' => now(),
            'is_saved' => true,
        ]);

        $item = $run->items->sole();

        $response = $this->actingAs($owner)->post(route('hris.payrolls.items.bulk-destroy', $run), [
            'item_ids' => [$item->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('payroll_items', ['id' => $item->id]);
    }

    public function test_deleting_item_from_draft_batch_preserves_exclusion_on_recalculate(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $empA = $this->createEmployee($owner, ['base_salary' => 5000000]);
        $empB = $this->createEmployee($owner, ['base_salary' => 6000000]);

        $service = app(PayrollGenerationService::class);
        // Generated without selectedEmployeeIds (meaning all active employees included)
        $run = $service->generateForPeriod($owner->id, '2026-10');

        $this->assertEquals(2, $run->employees_count);
        $itemA = $run->items->firstWhere('employee_id', $empA->id);

        $this->actingAs($owner)->delete(route('hris.payrolls.items.destroy', [$run, $itemA]));

        $run->refresh();
        $this->assertEquals(1, $run->employees_count);

        // Recalculate the run
        $service->recalculateRun($run);

        $run->refresh();
        $this->assertEquals(1, $run->employees_count);
        $this->assertEquals([$empB->id], $run->items()->pluck('employee_id')->all());
    }
}
