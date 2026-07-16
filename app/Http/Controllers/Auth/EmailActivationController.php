<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\User;
use App\Services\EmailOtpService;
use App\Support\RoleRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmailActivationController extends Controller
{
    public function __construct(private readonly EmailOtpService $otpService) {}

    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($this->shouldSkipEmployeeActivationOtp($user)) {
            $user->forceFill(['email_verified_at' => now()])->save();

            return redirect()->to(RoleRedirect::for($user));
        }

        if ($user->hasActivatedAccount()) {
            return redirect()->to(RoleRedirect::for($user));
        }

        return Inertia::render('auth/activate-account', [
            'email' => $user->email,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($this->shouldSkipEmployeeActivationOtp($user)) {
            $user->forceFill(['email_verified_at' => now()])->save();

            return redirect()->to(RoleRedirect::for($user));
        }

        if ($user->hasActivatedAccount()) {
            return redirect()->to(RoleRedirect::for($user));
        }

        if (! $this->otpService->canResend($user)) {
            throw ValidationException::withMessages([
                'otp' => 'OTP baru dapat dikirim ulang setelah 1 menit.',
            ]);
        }

        $this->otpService->send($user, strict: true);

        return back()->with('status', 'otp-sent');
    }

    public function verify(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($this->shouldSkipEmployeeActivationOtp($user)) {
            $user->forceFill(['email_verified_at' => now()])->save();

            return redirect()->to(RoleRedirect::for($user));
        }

        $validated = $request->validate(['otp' => ['required', 'digits:6']]);

        if ($user->hasActivatedAccount()) {
            return redirect()->to(RoleRedirect::for($user));
        }

        if (! $this->otpService->verify($user, $validated['otp'])) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        return redirect()->to(RoleRedirect::for($user));
    }

    private function shouldSkipEmployeeActivationOtp(User $user): bool
    {
        return $user->role === 'user'
            && ! CompanySetting::employeeActivationOtpEnabledFor($user);
    }
}
