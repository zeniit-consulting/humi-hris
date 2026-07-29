<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EmployeeDocumentStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_document_uses_the_fake_r2_disk_in_testing_without_live_credentials(): void
    {
        config()->set('filesystems.disks.r2.key', null);
        config()->set('filesystems.disks.r2.secret', null);
        config()->set('filesystems.disks.r2.bucket', null);
        config()->set('filesystems.disks.r2.endpoint', null);
        Storage::fake('r2');

        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->post(route('hris.employees.documents.store', $employee), [
            'document_type' => 'ktp',
            'document_file' => UploadedFile::fake()->create('ktp.pdf', 120, 'application/pdf'),
        ])->assertRedirect();

        $document = EmployeeDocument::query()->firstOrFail();

        $this->assertSame('r2', $document->file_disk);
        Storage::disk('r2')->assertExists($document->file_path);
    }
}
