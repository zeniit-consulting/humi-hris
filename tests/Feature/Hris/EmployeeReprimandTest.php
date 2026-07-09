<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EmployeeReprimandTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_employee_reprimands(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Ayu',
            'last_name' => 'Lestari',
        ]);

        $this->actingAs($user)
            ->post(route('hris.reprimands.store'), [
                'employee_id' => $employee->id,
                'level' => 'sp1',
                'issued_date' => '2026-07-07',
                'incident_date' => '2026-07-06',
                'subject' => 'Terlambat tanpa konfirmasi',
                'description' => 'Karyawan terlambat berulang tanpa pemberitahuan.',
                'action_plan' => 'Wajib check-in tepat waktu selama 30 hari.',
                'status' => 'active',
            ])
            ->assertRedirect(route('hris.reprimands.index'));

        $this->assertDatabaseHas('employee_reprimands', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'reprimand_number' => 'SP-202607-0001',
            'level' => 'sp1',
            'subject' => 'Terlambat tanpa konfirmasi',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->get(route('hris.reprimands.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/reprimands/index')
                ->where('filters.status', 'active')
                ->where('stats.active', 1)
                ->where('stats.resolved', 0)
                ->has('reprimands.data', 1)
                ->where('reprimands.data.0.employee_label', 'EMP-001 - Ayu Lestari')
                ->where('reprimands.data.0.level', 'sp1')
                ->where('reprimands.data.0.issued_date', '2026-07-07')
            );

        $reprimandId = (int) \DB::table('employee_reprimands')->value('id');

        $this->actingAs($user)
            ->put(route('hris.reprimands.update', $reprimandId), [
                'employee_id' => $employee->id,
                'level' => 'sp2',
                'issued_date' => '2026-07-08',
                'incident_date' => '2026-07-06',
                'subject' => 'Pelanggaran berulang',
                'description' => 'Pelanggaran berulang setelah SP1.',
                'action_plan' => 'Evaluasi bersama atasan langsung.',
                'status' => 'resolved',
                'resolution_notes' => 'Sudah diselesaikan melalui coaching.',
            ])
            ->assertRedirect(route('hris.reprimands.index'));

        $this->assertDatabaseHas('employee_reprimands', [
            'id' => $reprimandId,
            'level' => 'sp2',
            'status' => 'resolved',
            'resolution_notes' => 'Sudah diselesaikan melalui coaching.',
        ]);

        $this->actingAs($user)
            ->delete(route('hris.reprimands.destroy', $reprimandId))
            ->assertRedirect(route('hris.reprimands.index'));

        $this->assertDatabaseMissing('employee_reprimands', [
            'id' => $reprimandId,
        ]);
    }

    public function test_reprimands_are_limited_to_account_owner(): void
    {
        $this->withoutVite();

        $owner = User::factory()->create();
        $otherOwner = User::factory()->create();

        $visibleEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
        ]);
        $hiddenEmployee = Employee::factory()->create([
            'user_id' => $otherOwner->id,
            'employee_code' => 'EMP-999',
            'first_name' => 'Citra',
            'last_name' => 'Dewi',
        ]);

        \DB::table('employee_reprimands')->insert([
            [
                'user_id' => $owner->id,
                'employee_id' => $visibleEmployee->id,
                'reprimand_number' => 'SP-202607-0001',
                'level' => 'sp1',
                'issued_date' => '2026-07-07',
                'incident_date' => '2026-07-06',
                'subject' => 'Visible reprimand',
                'description' => null,
                'action_plan' => null,
                'status' => 'active',
                'resolution_notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $otherOwner->id,
                'employee_id' => $hiddenEmployee->id,
                'reprimand_number' => 'SP-202607-0001',
                'level' => 'sp3',
                'issued_date' => '2026-07-07',
                'incident_date' => '2026-07-06',
                'subject' => 'Hidden reprimand',
                'description' => null,
                'action_plan' => null,
                'status' => 'active',
                'resolution_notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->actingAs($owner)
            ->get(route('hris.reprimands.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('reprimands.data', 1)
                ->where('reprimands.data.0.employee_label', 'EMP-001 - Budi Santoso')
                ->where('stats.active', 1)
            );

        $this->actingAs($owner)
            ->post(route('hris.reprimands.store'), [
                'employee_id' => $hiddenEmployee->id,
                'level' => 'sp1',
                'issued_date' => '2026-07-07',
                'incident_date' => '2026-07-06',
                'subject' => 'Invalid owner',
                'description' => null,
                'action_plan' => null,
                'status' => 'active',
            ])
            ->assertSessionHasErrors('employee_id');
    }
}
