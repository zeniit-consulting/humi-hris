<?php

namespace App\Services;

use App\Models\User;
use App\Models\WorkShift;

class DefaultWorkShiftService
{
    /**
     * Seed the initial shift masters once for a new account owner.
     */
    public function seedForOwner(User $user): void
    {
        if ($user->role !== 'admin' || $user->parent_user_id !== null) {
            return;
        }

        if (WorkShift::query()->where('user_id', $user->id)->exists()) {
            return;
        }

        foreach ($this->defaults() as $shift) {
            WorkShift::query()->create([
                'user_id' => $user->id,
                ...$shift,
                'late_tolerance_minutes' => 15,
            ]);
        }
    }

    /**
     * @return array<int, array{code: string, name: string, start_time: null|string, end_time: null|string, is_day_off: bool}>
     */
    private function defaults(): array
    {
        return [
            ['code' => 'OFF', 'name' => 'OFF', 'start_time' => null, 'end_time' => null, 'is_day_off' => true],
            ['code' => '0817', 'name' => '0817', 'start_time' => '08:00', 'end_time' => '17:00', 'is_day_off' => false],
            ['code' => '0918', 'name' => '0918', 'start_time' => '09:00', 'end_time' => '18:00', 'is_day_off' => false],
            ['code' => '1701', 'name' => '1701', 'start_time' => '17:00', 'end_time' => '01:00', 'is_day_off' => false],
            ['code' => '0008', 'name' => '0008', 'start_time' => '00:00', 'end_time' => '08:00', 'is_day_off' => false],
        ];
    }
}
