<?php

namespace App\Http\Middleware;

use App\Models\CompanySetting;
use App\Services\SubscriptionService;
use App\Support\R2Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'appUrl' => rtrim((string) config('app.url'), '/'),
            'companyLogoUrl' => function () use ($request) {
                if (! $request->user()) {
                    return null;
                }

                $setting = CompanySetting::query()
                    ->select('logo_path')
                    ->where('user_id', $request->user()->accountOwnerId())
                    ->first();

                if (! $setting?->logo_path) {
                    return null;
                }

                return Storage::disk('public')->url($setting->logo_path);
            },
            'companyFeatures' => function () use ($request): array {
                $defaults = [
                    'show_sub_company_menu' => true,
                    'show_manpower_request_menu' => true,
                    'show_outsourcing_dashboard' => true,
                ];

                if (! $request->user()) {
                    return $defaults;
                }

                $setting = CompanySetting::query()
                    ->select([
                        'show_sub_company_menu',
                        'show_manpower_request_menu',
                        'show_outsourcing_dashboard',
                    ])
                    ->where('user_id', $request->user()->accountOwnerId())
                    ->first();

                return [
                    'show_sub_company_menu' => (bool) ($setting?->show_sub_company_menu ?? true),
                    'show_manpower_request_menu' => (bool) ($setting?->show_manpower_request_menu ?? true),
                    'show_outsourcing_dashboard' => (bool) ($setting?->show_outsourcing_dashboard ?? true),
                ];
            },
            'auth' => [
                'user' => function () use ($request) {
                    $user = $request->user();

                    if (! $user) {
                        return null;
                    }

                    return [
                        ...$user->toArray(),
                        'avatar' => R2Storage::url($user->avatar_path),
                    ];
                },
            ],
            'permissions' => [
                'can_manage_sub_users' => $request->user()?->canManageSubUsers() ?? false,
                'can_manage_subscribers' => $request->user()?->isSuperAdmin() ?? false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'subscription' => function () use ($request): ?array {
                if (! $request->user() || $request->user()->role === 'user') {
                    return null;
                }

                $user = $request->user()->parent_user_id
                    ? $request->user()->parentUser
                    : $request->user();

                /** @var SubscriptionService $service */
                $service = app(SubscriptionService::class);
                $subscription = $service->getActiveSubscription($user);
                $employeeCount = $service->getEmployeeCount($user);

                if (! $subscription) {
                    return [
                        'plan_slug' => 'free',
                        'status' => 'expired',
                        'employee_count' => $employeeCount,
                        'max_employees' => 10,
                        'current_period_end' => null,
                        'days_remaining' => 0,
                        'locked_features' => [],
                        'is_trial' => false,
                    ];
                }

                $plan = $subscription->plan();

                return [
                    'plan_slug' => $subscription->plan_slug,
                    'status' => $subscription->status,
                    'employee_count' => $employeeCount,
                    'max_employees' => $plan?->max_employees,
                    'current_period_end' => $subscription->current_period_end?->toDateString(),
                    'days_remaining' => $subscription->daysRemaining(),
                    'locked_features' => $subscription->lockedFeatures(),
                    'is_trial' => $subscription->status === 'trial',
                ];
            },
        ];
    }
}
