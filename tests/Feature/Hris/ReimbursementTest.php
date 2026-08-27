<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeBankAccount;
use App\Models\ReimbursementRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class ReimbursementTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_submit_reimbursement_with_category_and_default_primary_bank_account(): void
    {
        Storage::fake('public');

        $company = User::factory()->create(['role' => 'user']);
        $employeeUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $company->id,
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $company->id,
            'email' => $employeeUser->email,
        ]);

        $primaryBank = EmployeeBankAccount::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'Budi Santoso',
            'is_primary' => true,
        ]);

        $secondaryBank = EmployeeBankAccount::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'bank_name' => 'Mandiri',
            'account_number' => '9876543210',
            'account_holder_name' => 'Budi Santoso',
            'is_primary' => false,
        ]);

        $file = UploadedFile::fake()->image('nota.jpg');

        $response = $this->actingAs($employeeUser)->postJson('/portal/api/reimbursements', [
            'category' => 'Travels',
            'title' => 'Bensin Luar Kota',
            'description' => 'Perjalanan dinas ke Bandung',
            'amount' => 250000,
            'receipt' => $file,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('reimbursement_requests', [
            'employee_id' => $employee->id,
            'category' => 'Travels',
            'employee_bank_account_id' => $primaryBank->id,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'title' => 'Bensin Luar Kota',
            'amount' => 250000,
            'status' => 'pending',
        ]);
    }

    public function test_employee_can_choose_specific_bank_account(): void
    {
        Storage::fake('public');

        $company = User::factory()->create(['role' => 'user']);
        $employeeUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $company->id,
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $company->id,
            'email' => $employeeUser->email,
        ]);

        $primaryBank = EmployeeBankAccount::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'Budi Santoso',
            'is_primary' => true,
        ]);

        $secondaryBank = EmployeeBankAccount::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'bank_name' => 'Mandiri',
            'account_number' => '9876543210',
            'account_holder_name' => 'Budi Santoso',
            'is_primary' => false,
        ]);

        $file = UploadedFile::fake()->image('nota_meals.png');

        $response = $this->actingAs($employeeUser)->postJson('/portal/api/reimbursements', [
            'category' => 'Meals',
            'employee_bank_account_id' => $secondaryBank->id,
            'title' => 'Makan Siang Klien',
            'description' => 'Meeting dengan vendor',
            'amount' => 150000,
            'receipt' => $file,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('reimbursement_requests', [
            'employee_id' => $employee->id,
            'category' => 'Meals',
            'employee_bank_account_id' => $secondaryBank->id,
            'bank_name' => 'Mandiri',
            'account_number' => '9876543210',
            'amount' => 150000,
        ]);
    }

    public function test_admin_can_filter_by_status_and_category(): void
    {
        $this->withoutVite();

        $company = User::factory()->create([
            'email_verified_at' => now(),
            'role' => 'superadmin',
        ]);
        $employee = Employee::factory()->create(['user_id' => $company->id]);

        $req1 = ReimbursementRequest::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'category' => 'Travels',
            'title' => 'Tiket Kereta',
            'description' => 'Dinas',
            'amount' => 300000,
            'status' => 'pending',
            'created_at' => now(),
        ]);

        $req2 = ReimbursementRequest::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'category' => 'Supplies',
            'title' => 'Beli Kertas & Tinta',
            'description' => 'ATK',
            'amount' => 120000,
            'status' => 'approved',
            'created_at' => now(),
        ]);

        // Filter status approved
        $response = $this->actingAs($company)->get('/hris/reimbursements?status=approved');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('hris/reimbursements/index')
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $req2->id)
        );

        // Filter category Travels
        $response = $this->actingAs($company)->get('/hris/reimbursements?category=Travels');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('hris/reimbursements/index')
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $req1->id)
        );
    }

    public function test_export_excludes_rejected_and_adds_sum_at_top_of_nominal(): void
    {
        $this->withoutVite();

        $company = User::factory()->create([
            'email_verified_at' => now(),
            'role' => 'superadmin',
        ]);
        $employee = Employee::factory()->create(['user_id' => $company->id]);

        $req1 = ReimbursementRequest::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'category' => 'Travels',
            'title' => 'Bensin',
            'description' => 'Perjalanan',
            'amount' => 200000,
            'status' => 'approved',
            'created_at' => now(),
        ]);

        $req2 = ReimbursementRequest::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'category' => 'Meals',
            'title' => 'Makan',
            'description' => 'Makan',
            'amount' => 100000,
            'status' => 'pending',
            'created_at' => now(),
        ]);

        $reqRejected = ReimbursementRequest::create([
            'user_id' => $company->id,
            'employee_id' => $employee->id,
            'category' => 'Others',
            'title' => 'Ditolak',
            'description' => 'Tidak valid',
            'amount' => 500000,
            'status' => 'rejected',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($company)->get('/hris/reimbursements/export');
        $response->assertOk();

        // Capture exported stream
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        $tempFile = tempnam(sys_get_temp_dir(), 'reimb_export_');
        file_put_contents($tempFile, $content);

        $spreadsheet = IOFactory::load($tempFile);
        $sheet = $spreadsheet->getActiveSheet();

        // Row 1 should have TOTAL NOMINAL in J1 and SUM formula in K1
        $this->assertEquals('TOTAL NOMINAL:', $sheet->getCell('J1')->getValue());
        $this->assertStringContainsString('=SUM(K3:K', (string) $sheet->getCell('K1')->getValue());

        // Row 2 is headers
        $this->assertEquals('ID', $sheet->getCell('A2')->getValue());
        $this->assertEquals('Kategori', $sheet->getCell('E2')->getValue());
        $this->assertEquals('Nominal', $sheet->getCell('K2')->getValue());

        // Row 3 & 4 are data
        $row3Title = $sheet->getCell('I3')->getValue();
        $row4Title = $sheet->getCell('I4')->getValue();
        $titles = [$row3Title, $row4Title];

        $this->assertContains('Bensin', $titles);
        $this->assertContains('Makan', $titles);
        $this->assertNotContains('Ditolak', $titles);

        // Row 5 should be empty because rejected is omitted
        $this->assertNull($sheet->getCell('A5')->getValue());

        @unlink($tempFile);
    }
}
