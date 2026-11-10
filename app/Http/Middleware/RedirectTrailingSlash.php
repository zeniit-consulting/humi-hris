<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectTrailingSlash
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->getPathInfo();

        if (in_array($request->method(), ['GET', 'HEAD'], true) && $path !== '/' && str_ends_with($path, '/')) {
            $trimmed = rtrim($path, '/');
            $query = $request->getQueryString();
            $target = $query ? $trimmed.'?'.$query : $trimmed;

            return redirect($target, Response::HTTP_MOVED_PERMANENTLY);
        }

        return $next($request);
    }
}
