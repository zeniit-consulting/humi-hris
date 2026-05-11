<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\EmployeeBankAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    /**
     * Get employee profile data (untuk form prefill).
     */
    public function show(Request $request): JsonResponse
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
                'phone' => $employee->phone,
                'address' => $employee->address,
                'email' => $employee->email,
            ],
            'bank_accounts' => $bankAccounts,
        ], 'Profile data retrieved successfully.');
    }

    /**
     * Update employee profile (phone & address).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20', 'regex:/^(\+62|0)[0-9]{9,12}$/'],
            'address' => ['required', 'string', 'max:500'],
        ]);

        $employee->update($validated);

        return $this->success([
            'phone' => $employee->phone,
            'address' => $employee->address,
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
