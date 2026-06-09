<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    use InteractsWithThirdPartyApi;

    public function index(Request $request): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'employment_status' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'updated_since' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $paginator = Employee::query()
            ->with(['division:id,name', 'position:id,name,level', 'subCompany:id,name,code'])
            ->when(($validated['search'] ?? '') !== '', function ($query) use ($validated): void {
                $search = $validated['search'];

                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('employee_code', 'like', '%'.$search.'%')
                        ->orWhere('first_name', 'like', '%'.$search.'%')
                        ->orWhere('last_name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%');
                });
            })
            ->when(isset($validated['division_id']), fn ($query) => $query->where('division_id', $validated['division_id']))
            ->when(isset($validated['position_id']), fn ($query) => $query->where('position_id', $validated['position_id']))
            ->when(($validated['employment_status'] ?? '') !== '', fn ($query) => $query->where('employment_status', $validated['employment_status']))
            ->when(isset($validated['is_active']), fn ($query) => $query->where('is_active', $validated['is_active']))
            ->when(isset($validated['updated_since']), fn ($query) => $query->where('updated_at', '>=', $validated['updated_since']))
            ->orderBy('employee_code')
            ->paginate((int) ($validated['per_page'] ?? 25))
            ->withQueryString();

        return $this->paginated($paginator, fn (Employee $employee) => $this->serializeEmployee($employee), 'Daftar karyawan berhasil diambil.');
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load(['division:id,name', 'position:id,name,level', 'subCompany:id,name,code', 'manager:id,employee_code,first_name,last_name,email,phone']);

        return $this->success($this->serializeEmployee($employee, includeDetails: true), 'Detail karyawan berhasil diambil.');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeEmployee(Employee $employee, bool $includeDetails = false): array
    {
        $payload = [
            'id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'full_name' => $employee->full_name,
            'first_name' => $employee->first_name,
            'last_name' => $employee->last_name,
            'email' => $employee->email,
            'phone' => $employee->phone,
            'employment_status' => $employee->employment_status,
            'employment_type' => $employee->employment_type,
            'hire_date' => $employee->hire_date?->format('Y-m-d'),
            'offboarded_at' => $employee->offboarded_at?->format('Y-m-d'),
            'is_active' => $employee->is_active,
            'division' => $employee->division ? [
                'id' => $employee->division->id,
                'name' => $employee->division->name,
            ] : null,
            'position' => $employee->position ? [
                'id' => $employee->position->id,
                'name' => $employee->position->name,
                'level' => (string) $employee->position->level,
            ] : null,
            'sub_company' => $employee->subCompany ? [
                'id' => $employee->subCompany->id,
                'code' => $employee->subCompany->code,
                'name' => $employee->subCompany->name,
            ] : null,
            'updated_at' => $employee->updated_at?->toISOString(),
        ];

        if (! $includeDetails) {
            return $payload;
        }

        return array_merge($payload, [
            'gender' => $employee->gender,
            'birth_date' => $employee->birth_date?->format('Y-m-d'),
            'last_education' => $employee->last_education,
            'marital_status' => $employee->marital_status,
            'children_count' => $employee->children_count,
            'address' => $employee->address,
            'manager' => $employee->manager ? $this->employeeSummary($employee->manager) : null,
        ]);
    }
}
