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
        $email = env('SUPERADMIN_EMAIL', 'superadmin@humi.local');
        $name = env('SUPERADMIN_NAME', 'Humi Super Admin');
        $password = env('SUPERADMIN_PASSWORD', 'ChangeMe123!');

        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            $existing->forceFill([
                'name' => $name,
                'role' => 'superadmin',
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
            'phone' => env('SUPERADMIN_PHONE', '628111111111'),
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'password' => Hash::make($password),
            'role' => 'superadmin',
            'parent_user_id' => null,
        ]);
    }
}
