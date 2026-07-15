<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Services\EmailOtpService;
use App\Services\UserPortalAccountService;
use App\Support\RoleRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PortalOtpLoginController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otpService,
        private readonly UserPortalAccountService $portalAccounts,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->to(RoleRedirect::for($request->user()));
        }

        return Inertia::render('auth/portal-login', [
            'status' => $request->session()->get('status'),
            'otpSentTo' => $request->session()->get('portal_login_email'),
        ]);
    }

    public function sendOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:150'],
        ]);

        $email = strtolower(trim((string) $validated['email']));
        $user = $this->resolvePortalUser($email);

        if (! $this->otpService->canResend($user)) {
            throw ValidationException::withMessages([
                'email' => 'OTP baru dapat dikirim ulang setelah 1 menit.',
            ]);
        }

        $this->otpService->send($user, strict: true, context: 'login');

        $request->session()->put('portal_login_user_id', $user->id);
        $request->session()->put('portal_login_email', $email);

        return back()->with('status', 'otp-sent');
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $userId = $request->session()->get('portal_login_user_id');
        $email = $request->session()->get('portal_login_email');

        if (! $userId || ! $email) {
            throw ValidationException::withMessages([
                'otp' => 'Sesi login telah berakhir. Minta OTP baru untuk melanjutkan.',
            ]);
        }

        /** @var User|null $user */
        $user = User::query()
            ->whereKey($userId)
            ->where('role', 'user')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user || ! $this->otpService->verify($user, $validated['otp'])) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        $request->session()->forget([
            'portal_login_user_id',
            'portal_login_email',
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

        $employee = Employee::query()
            ->where('employee_code', $employeeCode)
            ->first();

        $user = $employee instanceof Employee
            ? $this->portalAccounts->createOrSyncFromEmployee($employee)
            : null;

        if (! $user || ! Hash::check((string) $validated['password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'employee_code' => 'NIK atau password tidak valid.',
            ]);
        }

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $request->session()->forget([
            'portal_login_user_id',
            'portal_login_email',
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('portal.index');
    }

    private function resolvePortalUser(string $email): User
    {
        $user = User::query()
            ->where('role', 'user')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user) {
            $user = $this->portalAccounts->createOrSyncFromEmail($email);
        }

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => 'Email belum terdaftar pada data karyawan.',
            ]);
        }

        return $user;
    }
}
