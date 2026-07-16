<?php

namespace Tests\Unit;

use App\Models\Employee;
use PHPUnit\Framework\TestCase;

class EmployeeWfaTest extends TestCase
{
    public function test_wfa_flag_is_mass_assignable_and_cast_to_boolean(): void
    {
        $employee = new Employee;
        $employee->fill(['is_wfa' => 1]);

        $this->assertTrue($employee->is_wfa);
    }
}
