<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;

class RoleRedirect
{
    public static function for(?User $user, ?Request $request = null): string
    {
        if (! $user) {
            return route('login');
        }

        if ($user->role === 'user') {
            return route('portal.index');
        }

        if ($user->role === 'client_supervisor') {
            return route('client.approvals.index');
        }

        // Sub-admin staff accessing via mobile device is directed to employee portal
        $req = $request ?: (function_exists('request') ? request() : null);
        if ($user->isSubAdmin() && $req && DeviceDetector::isMobile($req)) {
            return route('portal.index');
        }

        return route('dashboard');
    }
}
