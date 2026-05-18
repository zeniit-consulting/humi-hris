<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectMobileGuestsToPortalLogin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldRedirect($request)) {
            return $next($request);
        }

        return redirect()->route('portal.login');
    }

    private function shouldRedirect(Request $request): bool
    {
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            return false;
        }

        if ($request->user() || $request->expectsJson()) {
            return false;
        }

        if ($request->routeIs('portal.login', 'portal.login.*')) {
            return false;
        }

        if (! $this->isMobileUserAgent((string) $request->userAgent())) {
            return false;
        }

        return true;
    }

    private function isMobileUserAgent(string $userAgent): bool
    {
        return (bool) preg_match(
            '/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i',
            $userAgent,
        );
    }
}
