<?php

namespace App\Support;

use App\Models\User;

class RoleRedirect
{
    public static function for(?User $user): string
    {
        if (! $user) {
            return route('login');
        }

        return match ($user->role) {
            'user' => route('portal.index'),
            'client_supervisor' => route('client.approvals.index'),
            default => route('dashboard'),
        };
    }
}
