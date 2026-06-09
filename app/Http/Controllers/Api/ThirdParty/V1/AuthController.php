<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use InteractsWithThirdPartyApi;

    public function issueToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'token_name' => ['nullable', 'string', 'max:100'],
            'revoke_existing' => ['nullable', 'boolean'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->error('Kredensial tidak valid.', 401);
        }

        if ($user->role !== 'admin' || $user->parent_user_id !== null) {
            return $this->error('Hanya akun owner admin yang dapat membuat token integrasi.', 403);
        }

        if (! $user->hasActivatedAccount()) {
            return $this->error('Akun belum aktif.', 403);
        }

        if ($user->isSuspended()) {
            return $this->error('Akun sedang disuspend.', 403);
        }

        $tokenName = $validated['token_name'] ?? 'third-party-api';

        if ($request->boolean('revoke_existing')) {
            $user->tokens()->where('name', $tokenName)->delete();
        }

        $token = $user->createToken($tokenName, ['third-party'])->plainTextToken;

        return $this->success([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'abilities' => ['third-party'],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'company_name' => $user->company_name,
                'account_owner_id' => $user->accountOwnerId(),
            ],
        ], 'Token API pihak ketiga berhasil dibuat.', 201);
    }

    public function revokeCurrentToken(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->success(null, 'Token API pihak ketiga berhasil dicabut.');
    }
}
