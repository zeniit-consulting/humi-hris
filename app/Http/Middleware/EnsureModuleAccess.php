<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  string  ...$modules
     */
    public function handle(Request $request, Closure $next, string ...$modules): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Master admin or superadmin has full access to all modules
        if ($user->parent_user_id === null || $user->role === 'superadmin') {
            return $next($request);
        }

        // Sub-admin with unrestricted permissions (null) has full access
        if ($user->permissions === null) {
            return $next($request);
        }

        // Check if user has permission for at least one of the specified modules
        foreach ($modules as $module) {
            if ($user->hasModulePermission($module)) {
                return $next($request);
            }
        }

        abort(403, 'Anda tidak memiliki hak akses untuk modul ini.');
    }
}
