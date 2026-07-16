<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\CompanySetting;
use App\Services\EmailOtpService;
use App\Support\R2Storage;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $companySetting = CompanySetting::query()->firstOrCreate(
            ['user_id' => $ownerId],
            [
                'name' => 'Perusahaan',
                'details' => null,
                'portal_kasbon_enabled' => true,
                'employee_activation_otp_enabled' => true,
                'location_name' => null,
                'location_address' => null,
                'location_latitude' => null,
                'location_longitude' => null,
                'attendance_radius_meters' => 100,
                'attendance_locations' => [],
                'employee_code_prefix' => 'EMP',
                'employee_code_digits' => 4,
                'employee_code_next_number' => 1,
            ],
        );

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'company' => [
                'name' => $companySetting->name,
                'details' => $companySetting->details,
                'portal_kasbon_enabled' => (bool) ($companySetting->portal_kasbon_enabled ?? true),
                'employee_activation_otp_enabled' => (bool) ($companySetting->employee_activation_otp_enabled ?? true),
                'location_name' => $companySetting->location_name,
                'location_address' => $companySetting->location_address,
                'location_latitude' => $companySetting->location_latitude,
                'location_longitude' => $companySetting->location_longitude,
                'attendance_radius_meters' => $companySetting->attendance_radius_meters ?? 100,
                'attendance_locations' => $companySetting->attendance_locations ?? [],
                'logo_url' => $companySetting->logo_path
                    ? Storage::disk('public')->url($companySetting->logo_path)
                    : null,
                'overtime_hour_divisor' => $companySetting->overtime_hour_divisor ?? 173,
                'overtime_multiplier_hour1' => $companySetting->overtime_multiplier_hour1 ?? 1.5,
                'overtime_multiplier_subsequent' => $companySetting->overtime_multiplier_subsequent ?? 2.0,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request, EmailOtpService $otpService): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->safe()->except(['avatar', 'remove_avatar']);

        $user->fill($validated);

        $emailChanged = $user->isDirty('email');

        if ($emailChanged) {
            $user->email_verified_at = null;
            $user->email_otp_code = null;
            $user->email_otp_sent_at = null;
            $user->email_otp_expires_at = null;
        }

        if ($request->boolean('remove_avatar')) {
            $this->deleteAvatar($user->avatar_path);
            $user->avatar_path = null;
        }

        if ($request->file('avatar') instanceof UploadedFile) {
            if (! R2Storage::isConfigured()) {
                return back()
                    ->withInput()
                    ->withErrors(['avatar' => 'Cloudflare R2 belum dikonfigurasi lengkap. Isi R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, dan R2_ENDPOINT.']);
            }

            $this->deleteAvatar($user->avatar_path);
            $user->avatar_path = R2Storage::disk()->putFile('avatars', $request->file('avatar'), 'public');
        }

        $user->save();

        if ($emailChanged) {
            $otpService->send($user, strict: true);

            return redirect()
                ->route('activation.notice')
                ->with('status', 'otp-sent');
        }

        return to_route('profile.edit');
    }

    private function deleteAvatar(?string $path): void
    {
        if (! $path) {
            return;
        }

        if (R2Storage::isConfigured()) {
            R2Storage::disk()->delete($path);
        }
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
