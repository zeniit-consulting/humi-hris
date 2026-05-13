<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\StoreEmployeeDocumentRequest;
use App\Http\Requests\Hris\UpdateEmployeeDocumentRequest;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeDocumentController extends Controller
{
    public function store(Employee $employee, StoreEmployeeDocumentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $storedFile = $this->storeFile($request->file('document_file'), $employee->id);

        $employee->documents()->create([
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'] ?? null,
            'issued_at' => $validated['issued_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'issuing_authority' => $validated['issuing_authority'] ?? null,
            'notes' => $validated['notes'] ?? null,
            ...$storedFile,
        ]);

        return back();
    }

    public function update(
        Employee $employee,
        EmployeeDocument $employeeDocument,
        UpdateEmployeeDocumentRequest $request
    ): RedirectResponse {
        $this->ensureDocumentBelongsToEmployee($employee, $employeeDocument);

        $validated = $request->validated();
        $attributes = [
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'] ?? null,
            'issued_at' => $validated['issued_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'issuing_authority' => $validated['issuing_authority'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ];

        if ($request->boolean('remove_file')) {
            $this->deleteStoredFile($employeeDocument);
            $attributes = [
                ...$attributes,
                'file_disk' => null,
                'file_path' => null,
                'file_original_name' => null,
                'file_mime_type' => null,
                'file_size' => null,
                'verified_at' => null,
                'verified_by' => null,
            ];
        }

        if ($request->hasFile('document_file')) {
            $this->deleteStoredFile($employeeDocument);
            $attributes = [
                ...$attributes,
                ...$this->storeFile($request->file('document_file'), $employee->id),
                'verified_at' => null,
                'verified_by' => null,
            ];
        }

        $employeeDocument->update($attributes);

        return back();
    }

    public function destroy(Employee $employee, EmployeeDocument $employeeDocument): RedirectResponse
    {
        $this->ensureDocumentBelongsToEmployee($employee, $employeeDocument);
        $this->deleteStoredFile($employeeDocument);
        $employeeDocument->delete();

        return back();
    }

    public function download(Employee $employee, EmployeeDocument $employeeDocument): StreamedResponse
    {
        $this->ensureDocumentBelongsToEmployee($employee, $employeeDocument);
        abort_unless($employeeDocument->file_path && $employeeDocument->file_disk, 404);

        return Storage::disk($employeeDocument->file_disk)->download(
            $employeeDocument->file_path,
            $employeeDocument->file_original_name ?? basename($employeeDocument->file_path),
        );
    }

    private function ensureDocumentBelongsToEmployee(Employee $employee, EmployeeDocument $employeeDocument): void
    {
        abort_unless($employeeDocument->employee_id === $employee->id, 404);
    }

    private function storeFile(UploadedFile $file, int $employeeId): array
    {
        $r2Config = config('filesystems.disks.r2');
        $disk = filled($r2Config['key'] ?? null)
            && filled($r2Config['secret'] ?? null)
            && filled($r2Config['bucket'] ?? null)
            && filled($r2Config['endpoint'] ?? null)
            ? 'r2'
            : 'local';
        $path = $file->store("employee-documents/{$employeeId}", $disk);

        return [
            'file_disk' => $disk,
            'file_path' => $path,
            'file_original_name' => $file->getClientOriginalName(),
            'file_mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ];
    }

    private function deleteStoredFile(EmployeeDocument $employeeDocument): void
    {
        if (! $employeeDocument->file_path || ! $employeeDocument->file_disk) {
            return;
        }

        Storage::disk($employeeDocument->file_disk)->delete($employeeDocument->file_path);
    }
}
