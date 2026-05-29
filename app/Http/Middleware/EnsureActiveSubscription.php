<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSubscription
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user || $user->isSuperAdmin() || $user->parent_user_id) {
            return $next($request);
        }

        $subscription = $this->subscriptionService->getLatestSubscription($user);

        if ($subscription?->isExpired() && $subscription->status !== 'expired') {
            $subscription->update(['status' => 'expired']);
        }

        if ($subscription?->isActive()) {
            return $next($request);
        }

        $message = 'Free trial Anda sudah berakhir. Silakan berlangganan minimal paket Basic untuk melanjutkan akses sistem.';

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['message' => $message], Response::HTTP_PAYMENT_REQUIRED);
        }

        return redirect()
            ->route('billing.index')
            ->with('error', $message);
    }
}
