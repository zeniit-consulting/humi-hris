<?php

namespace Tests\Feature\Hris;

use App\Models\CareerTransition;
use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeEmploymentHistory;
use App\Models\Position;
use App\Models\SubCompany;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CareerTransitionTest extends TestCase
{
    use RefreshDatabase;

    private function createSetup(): array
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'PT Zeni Nusantara Mandiri',
            'location_name' => 'Jakarta',
            'location_address' => 'Jl. Sudirman No. 123, Jakarta Selatan',
        ]);

        $oldDivision = Division::query()->create([
            'user_id' => $user->id,
            'name' => 'Divisi Operasional',
            'code' => 'OPS',
        ]);

        $newDivision = Division::query()->create([
            'user_id' => $user->id,
            'name' => 'Divisi Pemasaran',
            'code' => 'MKT',
        ]);

        $oldPosition = Position::query()->create([
            'user_id' => $user->id,
            'name' => 'Staff Operasional',
            'code' => 'STF-OPS',
            'level' => 3,
        ]);

        $newPosition = Position::query()->create([
            'user_id' => $user->id,
            'name' => 'Manager Pemasaran',
            'code' => 'MGR-MKT',
            'level' => 1,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
            'employee_code' => 'EMP-001',
            'division_id' => $oldDivision->id,
            'position_id' => $oldPosition->id,
            'base_salary' => 5000000,
            'employment_status' => 'permanent',
        ]);

        return compact('user', 'oldDivision', 'newDivision', 'oldPosition', 'newPosition', 'employee');
    }

    public function test_admin_can_access_career_transitions_index(): void
    {
        $setup = $this->createSetup();

        $response = $this->actingAs($setup['user'])->get(route('hris.career-transitions.index'));

        $response->assertOk();
    }

    public function test_admin_can_propose_career_transition(): void
    {
        $setup = $this->createSetup();

        $payload = [
            'employee_id' => $setup['employee']->id,
            'transition_type' => 'promotion',
            'effective_date' => '2026-11-01',
            'new_division_id' => $setup['newDivision']->id,
            'new_position_id' => $setup['newPosition']->id,
            'new_base_salary' => 8500000,
            'reason' => 'Pencapaian KPI tahunan terbaik dan kelulusan program leadership assessment',
            'notes' => 'Masa serah terima jabatan 2 minggu sebelum tanggal efektif.',
            'approval_levels' => 2,
        ];

        $response = $this->actingAs($setup['user'])->post(route('hris.career-transitions.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('career_transitions', [
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'transition_type' => 'promotion',
            'old_division_id' => $setup['oldDivision']->id,
            'new_division_id' => $setup['newDivision']->id,
            'old_position_id' => $setup['oldPosition']->id,
            'new_position_id' => $setup['newPosition']->id,
            'old_base_salary' => 5000000,
            'new_base_salary' => 8500000,
            'status' => 'pending',
            'approval_stage' => 0,
            'approval_levels' => 2,
        ]);
    }

    public function test_multi_tier_approval_flow_and_sk_generation(): void
    {
        $setup = $this->createSetup();

        $transition = CareerTransition::query()->create([
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'transition_number' => 'MUT-202610-0001',
            'letter_number' => 'SK/PROM/2026/X/0001',
            'transition_type' => 'promotion',
            'effective_date' => '2026-11-01',
            'old_division_id' => $setup['oldDivision']->id,
            'old_division_name' => $setup['oldDivision']->name,
            'new_division_id' => $setup['newDivision']->id,
            'new_division_name' => $setup['newDivision']->name,
            'old_position_id' => $setup['oldPosition']->id,
            'old_position_name' => $setup['oldPosition']->name,
            'new_position_id' => $setup['newPosition']->id,
            'new_position_name' => $setup['newPosition']->name,
            'old_base_salary' => 5000000,
            'new_base_salary' => 8500000,
            'reason' => 'Promosi kepemimpinan',
            'status' => 'pending',
            'approval_levels' => 2,
            'approval_stage' => 0,
            'created_by_user_id' => $setup['user']->id,
        ]);

        // Stage 1 Approval (Level 1)
        $response1 = $this->actingAs($setup['user'])->post(route('hris.career-transitions.approve', $transition), [
            'notes' => 'Disetujui di tingkat 1 oleh Supervisor',
        ]);

        $response1->assertRedirect();
        $transition->refresh();

        $this->assertSame(1, $transition->approval_stage);
        $this->assertSame('pending', $transition->status);
        $this->assertNotNull($transition->first_approved_at);
        $this->assertSame('Disetujui di tingkat 1 oleh Supervisor', $transition->first_approval_notes);

        // Stage 2 Approval (Level 2 - Final)
        $response2 = $this->actingAs($setup['user'])->post(route('hris.career-transitions.approve', $transition), [
            'notes' => 'Disetujui penuh oleh Direktur Utama',
            'sk_signer_name' => 'Hendrawan, S.E.',
            'sk_signer_position' => 'Direktur Utama',
        ]);

        $response2->assertRedirect();
        $transition->refresh();

        $this->assertSame(2, $transition->approval_stage);
        $this->assertSame('approved', $transition->status);
        $this->assertNotNull($transition->second_approved_at);
        $this->assertNotNull($transition->sk_generated_at);
        $this->assertSame('Hendrawan, S.E.', $transition->sk_signer_name);
    }

    public function test_admin_can_reject_career_transition(): void
    {
        $setup = $this->createSetup();

        $transition = CareerTransition::query()->create([
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'transition_number' => 'MUT-202610-0002',
            'transition_type' => 'mutation',
            'effective_date' => '2026-11-01',
            'reason' => 'Permintaan mutasi',
            'status' => 'pending',
            'approval_levels' => 1,
            'approval_stage' => 0,
            'created_by_user_id' => $setup['user']->id,
        ]);

        $response = $this->actingAs($setup['user'])->post(route('hris.career-transitions.reject', $transition), [
            'reason' => 'Kebutuhan tenaga kerja di divisi asal masih sangat tinggi.',
        ]);

        $response->assertRedirect();
        $transition->refresh();

        $this->assertSame('rejected', $transition->status);
        $this->assertSame('Kebutuhan tenaga kerja di divisi asal masih sangat tinggi.', $transition->rejection_reason);
    }

    public function test_apply_career_transition_updates_employee_and_records_history(): void
    {
        $setup = $this->createSetup();

        $transition = CareerTransition::query()->create([
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'transition_number' => 'MUT-202610-0003',
            'letter_number' => 'SK/PROM/2026/X/0003',
            'transition_type' => 'promotion',
            'effective_date' => '2026-11-01',
            'old_division_id' => $setup['oldDivision']->id,
            'new_division_id' => $setup['newDivision']->id,
            'old_position_id' => $setup['oldPosition']->id,
            'new_position_id' => $setup['newPosition']->id,
            'old_base_salary' => 5000000,
            'new_base_salary' => 9000000,
            'reason' => 'Promosi jabatan resmi',
            'status' => 'approved',
            'approval_levels' => 1,
            'approval_stage' => 2,
            'sk_generated_at' => now(),
            'created_by_user_id' => $setup['user']->id,
        ]);

        $response = $this->actingAs($setup['user'])->post(route('hris.career-transitions.apply', $transition));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $transition->refresh();
        $setup['employee']->refresh();

        // 1. Transition marked as applied
        $this->assertSame('applied', $transition->status);
        $this->assertNotNull($transition->applied_at);

        // 2. Employee master record updated
        $this->assertSame($setup['newDivision']->id, $setup['employee']->division_id);
        $this->assertSame($setup['newPosition']->id, $setup['employee']->position_id);
        $this->assertEquals(9000000, (float) $setup['employee']->base_salary);

        // 3. Career timeline history recorded in EmployeeEmploymentHistory
        $this->assertDatabaseHas('employee_employment_histories', [
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'new_division_id' => $setup['newDivision']->id,
            'new_position_id' => $setup['newPosition']->id,
        ]);

        $this->assertDatabaseHas('employee_employment_histories', [
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'new_base_salary' => 9000000,
        ]);
    }

    public function test_admin_can_download_official_sk_pdf(): void
    {
        $setup = $this->createSetup();

        $transition = CareerTransition::query()->create([
            'user_id' => $setup['user']->id,
            'employee_id' => $setup['employee']->id,
            'transition_number' => 'MUT-202610-0004',
            'letter_number' => 'SK/PROM/2026/X/0004',
            'transition_type' => 'promotion',
            'effective_date' => '2026-11-01',
            'old_division_id' => $setup['oldDivision']->id,
            'old_division_name' => $setup['oldDivision']->name,
            'new_division_id' => $setup['newDivision']->id,
            'new_division_name' => $setup['newDivision']->name,
            'old_position_id' => $setup['oldPosition']->id,
            'old_position_name' => $setup['oldPosition']->name,
            'new_position_id' => $setup['newPosition']->id,
            'new_position_name' => $setup['newPosition']->name,
            'old_base_salary' => 5000000,
            'new_base_salary' => 9000000,
            'reason' => 'Promosi Direksi',
            'status' => 'approved',
            'approval_levels' => 1,
            'approval_stage' => 2,
            'sk_generated_at' => now(),
            'created_by_user_id' => $setup['user']->id,
        ]);

        $response = $this->actingAs($setup['user'])->get(route('hris.career-transitions.sk-document', $transition));

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
    }
}
