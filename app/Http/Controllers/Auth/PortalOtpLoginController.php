<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Services\UserPortalAccountService;
use App\Support\RoleRedirect;
use App\Support\WhatsAppPhone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PortalOtpLoginController extends Controller
{
    public function __construct(
        private readonly UserPortalAccountService $portalAccounts,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->to(RoleRedirect::for($request->user()));
        }

        return Inertia::render('auth/portal-login');
    }

    public function loginWithWhatsApp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_code' => ['required', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $employeeCode = strtoupper(trim((string) $validated['employee_code']));
        $phone = WhatsAppPhone::normalize((string) $validated['phone']);

        $employee = Employee::query()
            ->where('employee_code', $employeeCode)
            ->first();

        $employeePhone = $employee instanceof Employee
            ? WhatsAppPhone::normalize((string) $employee->phone)
            : '';

        if ($phone === '' || $employeePhone === '' || ! hash_equals($employeePhone, $phone)) {
            throw ValidationException::withMessages([
                'phone' => 'ID karyawan atau nomor WhatsApp tidak cocok.',
            ]);
        }

        $user = $this->portalAccounts->createOrSyncFromEmployee($employee);

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'Akun portal karyawan belum dapat digunakan.',
            ]);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'requires_password_change' => false,
        ])->save();

        $request->session()->forget([
            'portal_login_user_id',
            'portal_login_email',
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('portal.index');
    }
}
