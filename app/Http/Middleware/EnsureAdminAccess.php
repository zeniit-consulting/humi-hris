<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\DeviceDetector;
use App\Support\RoleRedirect;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user && in_array($user->role, ['user', 'client_supervisor'], true)) {
            return redirect()->to(RoleRedirect::for($user, $request));
        }

        // Sub-admin staff on mobile is redirected to portal (admin panel is desktop only)
        if ($user && $user->isSubAdmin() && DeviceDetector::isMobile($request)) {
            return redirect()->route('portal.index')
                ->with('info', 'Halaman panel Admin hanya dapat diakses melalui Desktop. Anda dialihkan ke Portal Karyawan.');
        }

        return $next($request);
    }
}
