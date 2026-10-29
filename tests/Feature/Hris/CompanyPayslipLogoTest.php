<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\SubCompany;
use App\Models\User;
use App\Services\PayrollGenerationService;
use App\Services\PayslipPdfService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompanyPayslipLogoTest extends TestCase
{
    use RefreshDatabase;

    private function company(User $owner, string $code = 'CHILD'): SubCompany
    {
        return SubCompany::query()->create(['user_id' => $owner->id, 'code' => $code, 'name' => 'Company '.$code, 'is_active' => true]);
    }

    private function logoData(PayrollRun $run, PayrollItem $item): array
    {
        return (new \ReflectionMethod(PayslipPdfService::class, 'viewData'))->invoke(app(PayslipPdfService::class), $run, $item, $run->user_id, 'test.pdf');
    }

    public function test_sub_company_logo_can_be_uploaded_replaced_and_removed(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $this->actingAs($owner)->post(route('hris.sub-companies.store'), [
            'code' => 'LOGO', 'name' => 'Logo Company', 'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertRedirect()->assertSessionHasNoErrors();
        $company = SubCompany::query()->sole();
        $this->assertNotEmpty($company->logo_path);
        $oldPath = $company->logo_path;
        Storage::disk('public')->assertExists($oldPath);
        $this->post(route('hris.sub-companies.update', $company), [
            '_method' => 'put', 'code' => 'LOGO', 'name' => 'Logo Company', 'logo' => UploadedFile::fake()->image('new.jpg'),
        ])->assertRedirect()->assertSessionHasNoErrors();
        $company->refresh();
        $this->assertNotEquals($oldPath, $company->logo_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($company->logo_path);
        $latestPath = $company->logo_path;
        $this->put(route('hris.sub-companies.update', $company), [
            'code' => 'LOGO', 'name' => 'Logo Company', 'remove_logo' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertNull($company->fresh()->logo_path);
        Storage::disk('public')->assertMissing($latestPath);
    }

    public function test_invalid_logo_is_rejected_and_logo_cannot_be_changed_from_another_account(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $company = $this->company($owner);
        $this->actingAs($owner)->put(route('hris.sub-companies.update', $company), [
            'code' => $company->code, 'name' => $company->name,
            'logo' => UploadedFile::fake()->create('logo.svg', 20, 'image/svg+xml'),
        ])->assertSessionHasErrors('logo');
        $this->actingAs($other)->post(route('hris.sub-companies.update', $company), [
            '_method' => 'put', 'code' => $company->code, 'name' => $company->name,
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertNotFound();
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_internal_and_sub_company_payslips_resolve_only_their_own_company_logo(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $parentPath = UploadedFile::fake()->image('parent.png')->store('company-logos', 'public');
        $childPath = UploadedFile::fake()->image('child.png')->store('company-logos', 'public');
        CompanySetting::query()->create(['user_id' => $owner->id, 'name' => 'Parent', 'logo_path' => $parentPath]);
        $company = $this->company($owner);
        $company->update(['logo_path' => $childPath]);
        $internal = Employee::factory()->create(['user_id' => $owner->id, 'sub_company_id' => null, 'hire_date' => '2025-01-01']);
        $child = Employee::factory()->create(['user_id' => $owner->id, 'sub_company_id' => $company->id, 'hire_date' => '2025-01-01']);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $internalItem = $run->items->firstWhere('employee_id', $internal->id);
        $childItem = $run->items->firstWhere('employee_id', $child->id);
        $this->assertEquals(Storage::disk('public')->path($parentPath), $this->logoData($run, $internalItem)['companyLogoPath']);
        $this->assertEquals(Storage::disk('public')->path($childPath), $this->logoData($run, $childItem)['companyLogoPath']);
        $company->update(['logo_path' => null]);
        $this->assertNull($this->logoData($run, $childItem)['companyLogoPath']);
    }

    public function test_company_identity_stays_with_the_payslip_after_employee_transfer(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $first = $this->company($owner, 'FIRST');
        $second = $this->company($owner, 'SECOND');
        $firstPath = UploadedFile::fake()->image('first.png')->store('company-logos', 'public');
        $secondPath = UploadedFile::fake()->image('second.png')->store('company-logos', 'public');
        $first->update(['logo_path' => $firstPath]);
        $second->update(['logo_path' => $secondPath]);
        $employee = Employee::factory()->create(['user_id' => $owner->id, 'sub_company_id' => $first->id, 'hire_date' => '2025-01-01']);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $employee->update(['sub_company_id' => $second->id]);
        app(PayrollGenerationService::class)->recalculateRun($run);
        $item = $run->fresh()->items->sole();
        $this->assertEquals($first->id, $item->company_identity['sub_company_id']);
        $this->assertEquals(Storage::disk('public')->path($firstPath), $this->logoData($run, $item)['companyLogoPath']);
    }

    public function test_foreign_sub_company_logo_and_missing_files_never_fall_back_to_static_branding(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $foreign = $this->company($other);
        $foreignPath = UploadedFile::fake()->image('foreign.png')->store('company-logos', 'public');
        $foreign->update(['logo_path' => $foreignPath]);
        $employee = Employee::factory()->create(['user_id' => $owner->id, 'hire_date' => '2025-01-01']);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $item = $run->items->sole();
        $item->forceFill(['company_identity' => ['owner_id' => $owner->id, 'sub_company_id' => $foreign->id]])->save();
        $this->assertNull($this->logoData($run, $item)['companyLogoPath']);
        $item->update(['company_identity' => ['owner_id' => $owner->id, 'sub_company_id' => null]]);
        CompanySetting::query()->updateOrCreate(['user_id' => $owner->id], ['logo_path' => 'company-logos/missing.png']);
        $this->assertNull($this->logoData($run, $item)['companyLogoPath']);
        $this->assertStringStartsWith('%PDF-', app(PayslipPdfService::class)->output($run, $item, $owner->id));
    }

    public function test_parent_webp_logo_is_embedded_in_the_generated_pdf(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $image = imagecreatetruecolor(80, 40);
        ob_start();
        imagewebp($image);
        $binary = ob_get_clean();
        imagedestroy($image);
        Storage::disk('public')->put('company-logos/parent.webp', $binary);
        CompanySetting::query()->create(['user_id' => $owner->id, 'name' => 'Parent', 'logo_path' => 'company-logos/parent.webp']);
        Employee::factory()->create(['user_id' => $owner->id, 'sub_company_id' => null, 'hire_date' => '2025-01-01']);
        $run = app(PayrollGenerationService::class)->generateForPeriod($owner->id, '2026-10');
        $pdf = app(PayslipPdfService::class)->output($run, $run->items->sole(), $owner->id);
        $this->assertStringStartsWith('%PDF-', $pdf);
        $this->assertStringContainsString('/Subtype /Image', $pdf);
    }

    public function test_thr_keeps_sub_company_logo_and_name_after_employee_transfer(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        CompanySetting::query()->create(['user_id' => $owner->id, 'name' => 'Parent']);
        $first = $this->company($owner, 'FIRST');
        $second = $this->company($owner, 'SECOND');
        $path = UploadedFile::fake()->image('first.png')->store('company-logos', 'public');
        $first->update(['logo_path' => $path, 'address' => 'First address']);
        $employee = Employee::factory()->create(['user_id' => $owner->id, 'sub_company_id' => $first->id, 'hire_date' => '2025-01-01']);
        $run = app(PayrollGenerationService::class)->generateThr($owner->id, '2026-10-20');
        $item = $run->items->sole();
        $this->assertEquals($first->id, $item->company_identity['sub_company_id']);
        $employee->update(['sub_company_id' => $second->id]);
        $data = $this->logoData($run, $item);
        $this->assertEquals($first->name, $data['companyName']);
        $this->assertEquals('First address', $data['companyDetails']);
        $this->assertEquals(Storage::disk('public')->path($path), $data['companyLogoPath']);
    }
}
