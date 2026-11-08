<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed a superadmin account without deleting or truncating existing data.
     */
    public function run(): void
    {
        $email = config('auth.superadmin.email', env('SUPERADMIN_EMAIL', 'superadmin@humi.local'));
        $name = config('auth.superadmin.name', env('SUPERADMIN_NAME', 'Humi Super Admin'));
        $password = config('auth.superadmin.password', env('SUPERADMIN_PASSWORD', 'ChangeMe123!'));
        $phone = config('auth.superadmin.phone', env('SUPERADMIN_PHONE', '628111111111'));

        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            $existing->forceFill([
                'name' => $name,
                'role' => 'superadmin',
                'password' => Hash::make($password),
                'phone' => $phone,
                'parent_user_id' => null,
                'email_verified_at' => $existing->email_verified_at ?? now(),
                'phone_verified_at' => $existing->phone_verified_at ?? now(),
            ])->save();

            return;
        }

        User::query()->create([
            'name' => $name,
            'company_name' => 'Humi Internal',
            'email' => $email,
            'phone' => $phone,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'password' => Hash::make($password),
            'role' => 'superadmin',
            'parent_user_id' => null,
        ]);
    }
}
