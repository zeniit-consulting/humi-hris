<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireBearerToken
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken() && Auth::guard('web')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Bearer token diperlukan.',
                'data' => null,
            ], 401);
        }

        return $next($request);
    }
}
