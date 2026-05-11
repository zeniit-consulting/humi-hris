<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionFeature
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
    ) {}

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $owner = $user->parent_user_id
            ? $user->parentUser
            : $user;

        $subscription = $this->subscriptionService->getActiveSubscription($owner);

        if (! $subscription) {
            $this->flashFeatureError($request, $feature);
            return redirect()->route('billing.index');
        }

        if ($subscription->isFeatureLocked($feature)) {
            $this->flashFeatureError($request, $feature, $subscription->plan_slug);
            return redirect()->route('billing.index');
        }

        return $next($request);
    }

    protected function flashFeatureError(Request $request, string $feature, string $currentPlan = 'free'): void
    {
        $labels = [
            'recruitment'   => 'Rekrutmen',
            'payroll'       => 'Penggajian (Payroll)',
            'kasbon'        => 'Kasbon',
            'assets'        => 'Manajemen Aset',
            'survey'        => 'Survey Karyawan',
            'notifications' => 'Notifikasi & Pengumuman',
        ];

        $label = $labels[$feature] ?? ucfirst($feature);

        $planLabel = match ($currentPlan) {
            'free'  => 'Free',
            'core'  => 'Core',
            'plus'  => 'Plus',
            default => ucfirst($currentPlan),
        };

        // Fitur terkunci di Free → tersedia mulai Core
        $freeOnlyLocked = ['survey', 'notifications'];
        $upgradeTarget = in_array($feature, $freeOnlyLocked, true) ? 'Core atau Plus' : 'Plus';

        $request->session()->flash(
            'error',
            "Fitur {$label} tidak tersedia pada paket {$planLabel} Anda. Upgrade ke paket {$upgradeTarget} untuk mengakses fitur ini."
        );
    }
}
