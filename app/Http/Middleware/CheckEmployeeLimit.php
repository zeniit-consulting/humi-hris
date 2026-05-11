<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmployeeLimit
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if (! $this->subscriptionService->canAddEmployee($user)) {
            $message = 'Anda telah mencapai batas maksimum karyawan untuk paket saat ini. Upgrade paket atau hubungi admin.';

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'message' => $message,
                    'errors' => ['employee' => [$message]],
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return back()->withErrors(['employee' => $message]);
        }

        return $next($request);
    }
}
