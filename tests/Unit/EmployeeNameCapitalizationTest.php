<?php

namespace Tests\Unit;

use App\Models\Employee;
use PHPUnit\Framework\TestCase;

class EmployeeNameCapitalizationTest extends TestCase
{
    public function test_format_capitalized_words_handles_various_formats(): void
    {
        $this->assertNull(Employee::formatCapitalizedWords(null));
        $this->assertSame('', Employee::formatCapitalizedWords(''));
        $this->assertSame('', Employee::formatCapitalizedWords('   '));
        $this->assertSame('Budi Santoso', Employee::formatCapitalizedWords('budi santoso'));
        $this->assertSame('Budi Santoso', Employee::formatCapitalizedWords('BUDI SANTOSO'));
        $this->assertSame('Dio Restu Pratama', Employee::formatCapitalizedWords('  dio   restu    pratama  '));
        $this->assertSame('Dwi Ratna-Sari', Employee::formatCapitalizedWords('dwi ratna-sari'));
        $this->assertSame('Muhammad Al-Fatih', Employee::formatCapitalizedWords('muhammad al-fatih'));
    }

    public function test_employee_first_name_and_last_name_are_capitalized(): void
    {
        $employee = new Employee;
        $employee->first_name = 'dio restu';
        $employee->last_name = 'al-fatih';

        $this->assertSame('Dio Restu', $employee->first_name);
        $this->assertSame('Al-Fatih', $employee->last_name);
        $this->assertSame('Dio Restu Al-Fatih', $employee->full_name);
    }
}
