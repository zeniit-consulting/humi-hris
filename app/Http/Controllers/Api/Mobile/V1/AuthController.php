<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Mobile\LoginRequest;
use App\Models\Employee;
use App\Models\User;
use App\Services\UserPortalAccountService;
use App\Support\WhatsAppPhone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use InteractsWithMobileApiResponse;

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password tidak valid.',
                'errors' => [
                    'email' => ['Email atau password tidak valid.'],
                ],
            ], 422);
        }

        if ($user->role === 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Akun portal karyawan menggunakan login OTP email.',
                'errors' => [
                    'email' => ['Gunakan login OTP email untuk akun portal karyawan.'],
                ],
            ], 422);
        }

        if ($request->boolean('revoke_other_tokens', true)) {
            $user->tokens()->delete();
        }

        $deviceName = trim((string) ($validated['device_name'] ?? $request->userAgent() ?? 'mobile-app'));
        $deviceName = $deviceName !== '' ? $deviceName : 'mobile-app';

        $token = $user->createToken($deviceName, ['mobile'])->plainTextToken;

        return $this->success([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => $this->userPayload($user),
        ], 'Login berhasil.');
    }

    public function portalLogin(Request $request, UserPortalAccountService $portalAccounts): JsonResponse
    {
        $validated = $request->validate([
            'employee_code' => ['required', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:30'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'revoke_other_tokens' => ['nullable', 'boolean'],
        ]);

        $employeeCode = strtoupper(trim((string) $validated['employee_code']));
        $phone = WhatsAppPhone::normalize((string) $validated['phone']);

        $employee = Employee::query()
            ->where('employee_code', $employeeCode)
            ->first();

        if (! $employee instanceof Employee || ! $employee->is_active || $employee->employment_status === 'resigned') {
            return $this->validationError('Akun portal karyawan tidak aktif.', [
                'employee_code' => ['Akun portal karyawan tidak aktif.'],
            ]);
        }

        $employeePhone = WhatsAppPhone::normalize((string) $employee->phone);

        if ($phone === '' || $employeePhone === '' || ! hash_equals($employeePhone, $phone)) {
            return $this->validationError('ID karyawan atau nomor WhatsApp tidak cocok.', [
                'phone' => ['ID karyawan atau nomor WhatsApp tidak cocok.'],
            ]);
        }

        $user = $portalAccounts->createOrSyncFromEmployee($employee);

        if (! $user) {
            return $this->validationError('Akun portal karyawan belum dapat digunakan.', [
                'phone' => ['Akun portal karyawan belum dapat digunakan.'],
            ]);
        }

        if ($user->isSuspended()) {
            return $this->validationError('Akun portal karyawan tidak aktif.', [
                'employee_code' => ['Akun portal karyawan tidak aktif.'],
            ]);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'requires_password_change' => false,
        ])->save();

        if ($request->boolean('revoke_other_tokens', true)) {
            $user->tokens()->delete();
        }

        $deviceName = trim((string) ($validated['device_name'] ?? $request->userAgent() ?? 'mobile-portal'));
        $deviceName = $deviceName !== '' ? $deviceName : 'mobile-portal';

        $token = $user->createToken($deviceName, ['mobile'])->plainTextToken;

        return $this->success([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => $this->userPayload($user),
            'employee' => [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'phone' => $employee->phone,
            ],
        ], 'Login portal karyawan berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return $this->success($this->userPayload($user));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'Logout berhasil.');
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'parent_user_id' => $user->parent_user_id,
            'account_owner_id' => $user->accountOwnerId(),
            'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
            'created_at' => $user->created_at?->toDateTimeString(),
        ];
    }

    /**
     * @param  array<string, array<int, string>>  $errors
     */
    private function validationError(string $message, array $errors): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], 422);
    }
}
