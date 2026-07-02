<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\EmployeeBankAccount;
use App\Models\User;
use App\Services\EmployeeProfileCompletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    /**
     * Get employee profile data (untuk form prefill).
     */
    public function show(Request $request, EmployeeProfileCompletionService $completionService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $bankAccounts = EmployeeBankAccount::query()
            ->where('employee_id', $employee->id)
            ->get(['id', 'bank_name', 'account_number', 'account_holder_name', 'is_primary']);

        return $this->success([
            'employee' => [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'full_name' => $employee->full_name,
                'phone' => $employee->phone,
                'address' => $employee->address,
                'email' => $employee->email,
                'gender' => $employee->gender,
                'birth_date' => $employee->birth_date?->format('Y-m-d'),
                'last_education' => $employee->last_education,
                'marital_status' => $employee->marital_status,
                'children_count' => $employee->children_count,
                'hire_date' => $employee->hire_date?->format('Y-m-d'),
                'employment_status' => $employee->employment_status,
                'employment_type' => $employee->employment_type,
                'ptkp_category' => $employee->ptkp_category,
                'family_card_number' => $employee->family_card_number,
                'ktp_number' => $employee->ktp_number,
                'bpjs_kesehatan_number' => $employee->bpjs_kesehatan_number,
                'bpjs_ketenagakerjaan_number' => $employee->bpjs_ketenagakerjaan_number,
                'sim_a_number' => $employee->sim_a_number,
                'sim_b_number' => $employee->sim_b_number,
                'sim_c_number' => $employee->sim_c_number,
                'biological_mother_name' => $employee->biological_mother_name,
                'emergency_contact_name' => $employee->emergency_contact_name,
                'emergency_contact_phone' => $employee->emergency_contact_phone,
                'division' => $employee->division ? [
                    'id' => $employee->division->id,
                    'name' => $employee->division->name,
                ] : null,
                'position' => $employee->position ? [
                    'id' => $employee->position->id,
                    'name' => $employee->position->name,
                ] : null,
            ],
            'bank_accounts' => $bankAccounts,
            'profile_completion' => $completionService->summarize($employee),
        ], 'Profile data retrieved successfully.');
    }

    /**
     * Update employee profile and self-service identity fields.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20', 'regex:/^(\+62|0)[0-9]{9,12}$/'],
            'address' => ['required', 'string', 'max:500'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'birth_date' => ['nullable', 'date'],
            'last_education' => ['nullable', 'string', 'max:100'],
            'marital_status' => ['nullable', 'string', 'in:single,married,divorced,widowed'],
            'children_count' => ['nullable', 'integer', 'min:0', 'max:99'],
            'family_card_number' => ['nullable', 'string', 'max:32'],
            'ktp_number' => ['nullable', 'string', 'max:32'],
            'bpjs_kesehatan_number' => ['nullable', 'string', 'max:32'],
            'bpjs_ketenagakerjaan_number' => ['nullable', 'string', 'max:32'],
            'sim_a_number' => ['nullable', 'string', 'max:32'],
            'sim_b_number' => ['nullable', 'string', 'max:32'],
            'sim_c_number' => ['nullable', 'string', 'max:32'],
            'biological_mother_name' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:100'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
        ]);

        $employee->update($validated);

        if ($user->role === 'user' && $user->phone !== $validated['phone']) {
            $user->forceFill([
                'phone' => $validated['phone'],
            ])->save();
        }

        $employee->refresh();

        return $this->success([
            'phone' => $employee->phone,
            'address' => $employee->address,
            'gender' => $employee->gender,
            'birth_date' => $employee->birth_date?->format('Y-m-d'),
            'last_education' => $employee->last_education,
            'marital_status' => $employee->marital_status,
            'children_count' => $employee->children_count,
            'family_card_number' => $employee->family_card_number,
            'ktp_number' => $employee->ktp_number,
            'bpjs_kesehatan_number' => $employee->bpjs_kesehatan_number,
            'bpjs_ketenagakerjaan_number' => $employee->bpjs_ketenagakerjaan_number,
            'sim_a_number' => $employee->sim_a_number,
            'sim_b_number' => $employee->sim_b_number,
            'sim_c_number' => $employee->sim_c_number,
            'biological_mother_name' => $employee->biological_mother_name,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
        ], 'Profil berhasil diperbarui.');
    }

    /**
     * Update or create bank account (primary).
     */
    public function updateBankAccount(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:30'],
            'account_holder_name' => ['required', 'string', 'max:150'],
        ]);

        // Hapus primary flag dari akun bank lain
        EmployeeBankAccount::query()
            ->where('employee_id', $employee->id)
            ->update(['is_primary' => false]);

        // Upsert akun bank primary
        $account = EmployeeBankAccount::query()->updateOrCreate(
            ['employee_id' => $employee->id, 'is_primary' => true],
            [
                'user_id' => $user->accountOwnerId(),
                ...$validated,
            ],
        );

        return $this->success([
            'id' => $account->id,
            'bank_name' => $account->bank_name,
            'account_number' => $account->account_number,
            'account_holder_name' => $account->account_holder_name,
            'is_primary' => true,
        ], 'Rekening bank berhasil disimpan.');
    }
}
