<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Support\UserPassword;
use App\Support\WhatsAppPhone;
use Illuminate\Support\Facades\Log;

class UserPortalAccountService
{
    public function __construct(private readonly WahaClient $wahaClient) {}

    public function createOrSyncFromPhone(string $phone): ?User
    {
        $normalizedPhone = WhatsAppPhone::normalize($phone);

        if ($normalizedPhone === '') {
            return null;
        }

        $employee = Employee::query()
            ->where('phone', $normalizedPhone)
            ->orWhere('phone', $phone)
            ->first();

        if (! $employee) {
            return null;
        }

        return $this->createOrSyncFromEmployee($employee);
    }

    public function createOrSyncFromEmail(string $email): ?User
    {
        $normalizedEmail = strtolower(trim($email));

        if ($normalizedEmail === '') {
            return null;
        }

        $employee = Employee::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->first();

        if (! $employee) {
            return null;
        }

        return $this->createOrSyncFromEmployee($employee);
    }

    public function createOrSyncFromEmployee(Employee $employee): ?User
    {
        return $this->upsertFromEmployee($employee, resetPasswordToDefault: false, sendCredentialMessage: false);
    }

    public function activateFromEmployee(Employee $employee): ?User
    {
        return $this->upsertFromEmployee($employee, resetPasswordToDefault: true, sendCredentialMessage: false);
    }

    public function createOrSyncForPasswordLogin(Employee $employee): ?User
    {
        return $this->upsertFromEmployee($employee, resetPasswordToDefault: true, sendCredentialMessage: false);
    }

    private function upsertFromEmployee(
        Employee $employee,
        bool $resetPasswordToDefault,
        bool $sendCredentialMessage,
    ): ?User {
        if (! $employee->email && ! $employee->phone) {
            return null;
        }

        $normalizedPhone = $employee->phone
            ? WhatsAppPhone::normalize($employee->phone)
            : null;

        if (! $employee->email && ($normalizedPhone === null || $normalizedPhone === '')) {
            return null;
        }

        $ownerId = (int) $employee->user_id;

        $user = User::query()
            ->where('parent_user_id', $ownerId)
            ->where(function ($query) use ($employee, $normalizedPhone): void {
                if ($employee->email) {
                    $query->where('email', $employee->email);
                }

                if ($normalizedPhone) {
                    $employee->email
                        ? $query->orWhere('phone', $normalizedPhone)
                        : $query->where('phone', $normalizedPhone);
                }
            })
            ->first();

        if (! $user) {
            $user = User::query()->create([
                'name' => $employee->full_name,
                'email' => $employee->email ?: $this->portalPlaceholderEmail($employee, (string) $normalizedPhone),
                'phone' => $normalizedPhone,
                'password' => $resetPasswordToDefault && $normalizedPhone
                    ? UserPassword::defaultFromPhone($normalizedPhone)
                    : str()->random(32),
                'role' => 'user',
                'parent_user_id' => $ownerId,
                'email_verified_at' => null,
                'phone_verified_at' => null,
                'requires_password_change' => $resetPasswordToDefault,
                'password_changed_at' => null,
            ]);

            if ($sendCredentialMessage) {
                $this->sendCredentialMessage($user);
            }

            return $user;
        }

        $user->fill([
            'name' => $employee->full_name,
            'email' => $employee->email ?: $user->email ?: $this->portalPlaceholderEmail($employee, (string) $normalizedPhone),
            'phone' => $normalizedPhone,
            'role' => 'user',
            'parent_user_id' => $ownerId,
        ]);

        if ($user->isDirty('email')) {
            $user->forceFill([
                'email_verified_at' => null,
            ]);
        }

        if ($resetPasswordToDefault) {
            $user->forceFill([
                'password' => $normalizedPhone
                    ? UserPassword::defaultFromPhone($normalizedPhone)
                    : str()->random(32),
                'email_verified_at' => null,
                'requires_password_change' => true,
                'password_changed_at' => null,
            ]);
        }

        if ($user->isDirty()) {
            $user->save();
        }

        if ($sendCredentialMessage) {
            $this->sendCredentialMessage($user);
        }

        return $user;
    }

    private function sendCredentialMessage(User $user): void
    {
        if (! config('services.waha.enabled')) {
            return;
        }

        $message = implode("\n", [
            'Akun Portal User Anda sudah dibuat.',
            'Masuk menggunakan NIK/kode karyawan dan password nomor WhatsApp terdaftar Anda.',
            'Anda juga bisa login lewat kode OTP yang dikirim ke email terdaftar.',
            'Halaman login portal: '.route('portal.login'),
        ]);

        try {
            $this->wahaClient->sendTextToPhone((string) $user->phone, $message);
        } catch (\Throwable $exception) {
            report($exception);

            Log::warning('user.portal_account.whatsapp_failed', [
                'user_id' => $user->id,
                'phone' => $user->phone,
            ]);
        }
    }

    private function portalPlaceholderEmail(Employee $employee, string $normalizedPhone): string
    {
        $employeeCode = $employee->employee_code !== ''
            ? strtolower($employee->employee_code)
            : 'employee-'.$employee->id;

        return sprintf(
            'portal+%s-%s@local.portal',
            $employeeCode,
            $normalizedPhone,
        );
    }
}
