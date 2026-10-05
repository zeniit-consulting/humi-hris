<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class ScheduleImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_import_template_is_sorted_by_company_internal_first_then_subcompany_then_by_employee_id(): void
    {
        $user = User::factory()->create();

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'PT Induk',
        ]);

        $subCompBeta = SubCompany::query()->create([
            'user_id' => $user->id,
            'name' => 'Beta Logistics',
            'code' => 'BETA',
            'is_active' => true,
        ]);

        $subCompAlpha = SubCompany::query()->create([
            'user_id' => $user->id,
            'name' => 'Alpha Mining',
            'code' => 'ALPHA',
            'is_active' => true,
        ]);

        // Create employees out of order
        $empBeta1 = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompBeta->id,
            'first_name' => 'Budi',
            'last_name' => 'Beta',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $empInternalHighId = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => null,
            'first_name' => 'Zack',
            'last_name' => 'Internal',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $empAlpha2 = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompAlpha->id,
            'first_name' => 'Andi',
            'last_name' => 'Alpha Two',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $empInternalLowId = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => null,
            'first_name' => 'Anton',
            'last_name' => 'Internal',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $empAlpha1 = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompAlpha->id,
            'first_name' => 'Asep',
            'last_name' => 'Alpha One',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/hris/schedules/import/template?month=2026-09');
        $response->assertOk();

        // Capture streamed response content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        $tempFile = tempnam(sys_get_temp_dir(), 'sched_tpl_');
        file_put_contents($tempFile, $content);

        $spreadsheet = IOFactory::load($tempFile);
        $sheet = $spreadsheet->getActiveSheet();

        // Check header row 2
        $this->assertEquals('ID', $sheet->getCell('A2')->getValue());
        $this->assertEquals('Nama', $sheet->getCell('B2')->getValue());
        $this->assertEquals('Perusahaan', $sheet->getCell('C2')->getValue());
        $this->assertEquals(1, $sheet->getCell('D2')->getValue());
        $this->assertEquals(2, $sheet->getCell('E2')->getValue());

        // Check sample row 3
        $this->assertEquals('CONTOH', $sheet->getCell('A3')->getValue());

        // Expected order:
        // 1. Internal sorted by ID asc
        // 2. Alpha Mining sorted by ID asc
        // 3. Beta Logistics sorted by ID asc
        $internalIds = collect([$empInternalHighId, $empInternalLowId])->sortBy('id')->pluck('id')->values();
        $alphaIds = collect([$empAlpha1, $empAlpha2])->sortBy('id')->pluck('id')->values();
        $betaIds = collect([$empBeta1])->sortBy('id')->pluck('id')->values();

        $expectedIds = $internalIds->concat($alphaIds)->concat($betaIds)->all();

        $actualIds = [];
        $actualCompanies = [];
        for ($row = 4; $row < 4 + count($expectedIds); $row++) {
            $actualIds[] = (int) $sheet->getCell("A{$row}")->getValue();
            $actualCompanies[] = (string) $sheet->getCell("C{$row}")->getValue();
        }

        $this->assertEquals($expectedIds, $actualIds);
        $this->assertStringContainsString('Internal', $actualCompanies[0]);
        $this->assertStringContainsString('Internal', $actualCompanies[1]);
        $this->assertEquals('Alpha Mining', $actualCompanies[2]);
        $this->assertEquals('Alpha Mining', $actualCompanies[3]);
        $this->assertEquals('Beta Logistics', $actualCompanies[4]);

        @unlink($tempFile);
    }

    public function test_schedule_import_successfully_imports_schedules_with_zero_stripped_codes_and_aliases(): void
    {
        $user = User::factory()->create();

        $shiftNormal = WorkShift::query()->firstOrCreate(
            ['user_id' => $user->id, 'code' => '0817'],
            [
                'name' => 'Shift Pagi',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        $shiftSiang = WorkShift::query()->firstOrCreate(
            ['user_id' => $user->id, 'code' => '1321'],
            [
                'name' => 'Shift Siang',
                'start_time' => '13:00:00',
                'end_time' => '21:00:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        $employee1 = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Siti',
            'last_name' => 'Aminah',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $employee2 = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-002',
            'first_name' => 'Rudi',
            'last_name' => 'Hartono',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        // Build Excel spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Row 1: Month info
        $sheet->setCellValue('A1', 'Employee ID');
        $sheet->setCellValue('B1', 'Employee Name');
        $sheet->setCellValue('C1', 'Bulan');
        $sheet->setCellValue('D1', '2026-09');

        // Row 2: Table header
        $sheet->setCellValue('A2', 'ID');
        $sheet->setCellValue('B2', 'Nama');
        $sheet->setCellValue('C2', 'Perusahaan');
        $sheet->setCellValue('D2', 1);
        $sheet->setCellValue('E2', 2);
        $sheet->setCellValue('F2', 3);
        $sheet->setCellValue('G2', 4);

        // Row 3: Example row
        $sheet->setCellValue('A3', 'CONTOH');
        $sheet->setCellValue('B3', 'Sample');
        $sheet->setCellValue('C3', 'Internal');
        $sheet->setCellValue('D3', '0817');

        // Row 4: Employee 1 using numeric DB ID, with Excel number '817' (leading zero dropped) and 'OFF'
        $sheet->setCellValue('A4', $employee1->id);
        $sheet->setCellValue('B4', $employee1->full_name);
        $sheet->setCellValue('C4', 'PT Induk');
        $sheet->setCellValue('D4', 817); // Number without leading zero
        $sheet->setCellValue('E4', 'off'); // Lowercase alias
        $sheet->setCellValue('F4', 'libur'); // Alias for day off

        // Row 5: Employee 2 using employee_code
        $sheet->setCellValue('A5', $employee2->employee_code);
        $sheet->setCellValue('B5', $employee2->full_name);
        $sheet->setCellValue('C5', 'PT Induk');
        $sheet->setCellValue('D5', '1321');
        $sheet->setCellValue('E5', '-'); // Alias for day off

        // Row 8: Legend table at bottom
        $sheet->setCellValue('A8', '=== TABEL KETERANGAN KODE JAM KERJA ===');
        $sheet->setCellValue('A9', 'Kode Shift');
        $sheet->setCellValue('B9', 'Nama Shift');
        $sheet->setCellValue('A10', '0817');
        $sheet->setCellValue('B10', 'Shift Pagi');

        $writer = new Xlsx($spreadsheet);
        $tempPath = tempnam(sys_get_temp_dir(), 'sched_import_');
        $writer->save($tempPath);

        $uploadedFile = new UploadedFile(
            $tempPath,
            'jadwal_september.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($user)->post('/hris/schedules/import', [
            'file' => $uploadedFile,
            'month' => '2026-09',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $response->assertSessionHasNoErrors();

        // Verify schedules for employee 1
        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee1->id,
            'work_date' => '2026-09-01',
            'shift_code' => '0817',
            'is_day_off' => false,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee1->id,
            'work_date' => '2026-09-02',
            'shift_code' => 'OFF',
            'is_day_off' => true,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee1->id,
            'work_date' => '2026-09-03',
            'shift_code' => 'OFF',
            'is_day_off' => true,
        ]);

        // Verify schedules for employee 2
        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee2->id,
            'work_date' => '2026-09-01',
            'shift_code' => '1321',
            'is_day_off' => false,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee2->id,
            'work_date' => '2026-09-02',
            'shift_code' => 'OFF',
            'is_day_off' => true,
        ]);

        @unlink($tempPath);
    }

    public function test_schedule_import_works_with_legacy_template_and_date_serial(): void
    {
        $user = User::factory()->create();

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Bambang',
            'last_name' => 'Pamungkas',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Row 1: Month info as Excel date serial (approx 46266 for Sep 2026)
        $sheet->setCellValue('A1', 'Employee ID');
        $sheet->setCellValue('B1', 'Employee Name');
        $sheet->setCellValue('C1', 'Bulan');
        $sheet->setCellValue('D1', 46266); // Excel date serial number

        // Legacy format: Col A = ID, Col B = Nama, Col C = Day 1, Col D = Day 2
        $sheet->setCellValue('A2', 'ID');
        $sheet->setCellValue('B2', 'Nama');
        $sheet->setCellValue('C2', 1);
        $sheet->setCellValue('D2', 2);

        $sheet->setCellValue('A3', 'CONTOH');
        $sheet->setCellValue('B3', 'Contoh');
        $sheet->setCellValue('C3', '0817');

        $sheet->setCellValue('A4', $employee->id);
        $sheet->setCellValue('B4', $employee->full_name);
        $sheet->setCellValue('C4', '0817');
        $sheet->setCellValue('D4', '0918');

        $writer = new Xlsx($spreadsheet);
        $tempPath = tempnam(sys_get_temp_dir(), 'sched_legacy_');
        $writer->save($tempPath);

        $uploadedFile = new UploadedFile(
            $tempPath,
            'jadwal_legacy.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($user)->post('/hris/schedules/import', [
            'file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-09-01',
            'shift_code' => '0817',
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-09-02',
            'shift_code' => '0918',
        ]);

        @unlink($tempPath);
    }

    public function test_schedule_index_returns_monthly_matrix(): void
    {
        $user = User::factory()->create();

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-10-01',
            'shift_code' => '0817',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        $response = $this->actingAs($user)->get('/hris/schedules?month=2026-10');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('hris/schedules/index')
            ->has('monthlyMatrix')
            ->has('monthlyMatrix.days', 31)
            ->has('monthlyMatrix.rows', 1)
            ->where('monthlyMatrix.rows.0.employee_name', 'John Doe')
            ->where('monthlyMatrix.rows.0.schedules.2026-10-01.shift_code', '0817')
            ->where('monthlyMatrix.rows.0.schedules.2026-10-01.is_day_off', false)
            ->where('monthlyMatrix.rows.0.total_work_days', 1)
            ->where('monthlyMatrix.rows.0.total_off_days', 30)
        );
    }
}

