<?php

namespace Tests\Feature\Hris;

use App\Models\Division;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class EmployeeLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_pkwt_duration_and_extended_personal_details(): void
    {
        [$user, $division, $position] = $this->employeeContext('4');

        $this->actingAs($user)->post(route('hris.employees.store'), [
            ...$this->payload($division, $position),
            'employment_type' => 'PKWT',
            'contract_duration_months' => 12,
            'domicile_address' => 'Jl. Domisili 2',
            'emergency_contact_relationship' => 'Saudara',
            'blood_type' => 'O',
            'religion' => 'Islam',
            'npwp_number' => '12.345.678.9-012.000',
        ])->assertRedirect();

        $this->assertDatabaseHas('employees', [
            'user_id' => $user->id,
            'employment_type' => 'PKWT',
            'contract_duration_months' => 12,
            'contract_end_date' => '2027-02-28 00:00:00',
            'address' => 'Jl. KTP 1',
            'domicile_address' => 'Jl. Domisili 2',
            'emergency_contact_relationship' => 'Saudara',
            'blood_type' => 'O',
            'religion' => 'Islam',
            'npwp_number' => '12.345.678.9-012.000',
        ]);
    }

    public function test_pkwtt_probation_can_be_activated_with_effective_date_and_history(): void
    {
        Carbon::setTestNow('2026-07-15 10:00:00');
        [$user, $division, $position] = $this->employeeContext('4');

        $this->actingAs($user)->post(route('hris.employees.store'), [
            ...$this->payload($division, $position),
            'employment_type' => 'PKWTT',
            'probation_duration_months' => 3,
        ])->assertRedirect();

        $employee = Employee::query()->firstOrFail();
        $this->assertSame('probation', $employee->employment_status);
        $this->assertSame('2026-05-31', $employee->probation_end_date?->format('Y-m-d'));

        $this->actingAs($user)->post(route('hris.employees.activate-pkwtt', $employee), [
            'effective_date' => '2026-07-10',
            'notes' => 'Lulus evaluasi probation.',
        ])->assertRedirect();

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'employment_status' => 'active',
            'pkwtt_activated_at' => '2026-07-10 00:00:00',
        ]);
        $this->assertDatabaseHas('employee_employment_histories', [
            'employee_id' => $employee->id,
            'event_type' => 'pkwtt_activation',
            'old_status' => 'probation',
            'new_status' => 'active',
            'effective_date' => '2026-07-10 00:00:00',
            'notes' => 'Lulus evaluasi probation.',
            'created_by_user_id' => $user->id,
        ]);
    }

    public function test_position_update_records_promotion_history(): void
    {
        [$user, $division, $oldPosition] = $this->employeeContext('4');
        $newPosition = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'level' => '3',
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $oldPosition->id,
            'first_name' => 'Rina',
            'last_name' => null,
            'hire_date' => '2026-03-01',
        ]);

        $this->actingAs($user)->put(route('hris.employees.update', $employee), [
            ...$this->payload($division, $newPosition),
            'employee_code' => $employee->employee_code,
            'full_name' => 'Rina',
            'change_effective_date' => '2026-07-01',
            'change_notes' => 'Promosi hasil evaluasi.',
        ])->assertRedirect();

        $this->assertDatabaseHas('employee_employment_histories', [
            'employee_id' => $employee->id,
            'event_type' => 'promotion',
            'old_position_id' => $oldPosition->id,
            'new_position_id' => $newPosition->id,
            'effective_date' => '2026-07-01 00:00:00',
            'notes' => 'Promosi hasil evaluasi.',
        ]);
    }

    /** @return array{User, Division, Position} */
    private function employeeContext(string $level): array
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $division = Division::factory()->create(['user_id' => $user->id]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'level' => $level,
        ]);

        return [$user, $division, $position];
    }

    /** @return array<string, mixed> */
    private function payload(Division $division, Position $position): array
    {
        return [
            'full_name' => 'Rina Putri',
            'email' => 'rina@example.com',
            'phone' => '081234567890',
            'hire_date' => '2026-03-01',
            'employment_status' => 'active',
            'employment_type' => 'PKWTT',
            'pph21_method' => 'gross',
            'pph21_rate' => 5,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'address' => 'Jl. KTP 1',
            'emergency_contact_name' => 'Budi',
            'emergency_contact_phone' => '081211111111',
            'is_active' => true,
        ];
    }
}
