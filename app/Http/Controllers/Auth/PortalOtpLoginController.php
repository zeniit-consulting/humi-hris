<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Services\UserPortalAccountService;
use App\Services\WhatsAppOtpService;
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
        private readonly WhatsAppOtpService $otpService,
        private readonly UserPortalAccountService $portalAccounts,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->to(RoleRedirect::for($request->user()));
        }

        return Inertia::render('auth/portal-login', [
            'status' => $request->session()->get('status'),
            'otpSentTo' => $request->session()->get('portal_login_phone'),
        ]);
    }

    public function sendOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $normalizedPhone = WhatsAppPhone::normalize($validated['phone']);
        $user = $this->resolvePortalUser($normalizedPhone);

        if (! $this->otpService->canResend($user)) {
            throw ValidationException::withMessages([
                'phone' => 'OTP baru dapat dikirim ulang setelah 1 menit.',
            ]);
        }

        if (! $this->otpService->send($user, strict: true, context: 'login')) {
            throw ValidationException::withMessages([
                'phone' => 'OTP WhatsApp gagal dikirim. Silakan coba lagi.',
            ]);
        }

        $request->session()->put('portal_login_user_id', $user->id);
        $request->session()->put('portal_login_phone', $normalizedPhone);

        return back()->with('status', 'otp-sent');
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $userId = $request->session()->get('portal_login_user_id');
        $phone = $request->session()->get('portal_login_phone');

        if (! $userId || ! $phone) {
            throw ValidationException::withMessages([
                'otp' => 'Sesi login telah berakhir. Minta OTP baru untuk melanjutkan.',
            ]);
        }

        /** @var User|null $user */
        $user = User::query()
            ->whereKey($userId)
            ->where('role', 'user')
            ->where('phone', $phone)
            ->first();

        if (! $user || ! $this->otpService->verify($user, $validated['otp'])) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        $request->session()->forget([
            'portal_login_user_id',
            'portal_login_phone',
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('portal.index');
    }

    public function loginWithPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_code' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'max:30'],
        ]);

        $employeeCode = strtoupper(trim((string) $validated['employee_code']));
        $normalizedPhone = WhatsAppPhone::normalize((string) $validated['password']);

        if ($normalizedPhone === '') {
            throw ValidationException::withMessages([
                'password' => 'Password harus menggunakan nomor WhatsApp terdaftar.',
            ]);
        }

        $employee = Employee::query()
            ->where('employee_code', $employeeCode)
            ->get()
            ->first(fn (Employee $employee): bool => WhatsAppPhone::normalize((string) $employee->phone) === $normalizedPhone);

        if (! $employee instanceof Employee) {
            throw ValidationException::withMessages([
                'employee_code' => 'NIK atau password tidak valid.',
            ]);
        }

        $user = $this->portalAccounts->createOrSyncForPasswordLogin($employee);

        if (! $user) {
            throw ValidationException::withMessages([
                'employee_code' => 'Akun portal karyawan tidak bisa dibuat dari data ini.',
            ]);
        }

        $user->forceFill([
            'phone_verified_at' => now(),
        ])->save();

        $request->session()->forget([
            'portal_login_user_id',
            'portal_login_phone',
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('portal.index');
    }

    private function resolvePortalUser(string $phone): User
    {
        $user = User::query()
            ->where('role', 'user')
            ->where('phone', $phone)
            ->first();

        if (! $user) {
            $user = $this->portalAccounts->createOrSyncFromPhone($phone);
        }

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor WhatsApp belum terdaftar pada data karyawan.',
            ]);
        }

        return $user;
    }
}
