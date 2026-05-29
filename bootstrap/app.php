<?php

use App\Http\Middleware\CheckEmployeeLimit;
use App\Http\Middleware\CheckSubscriptionFeature;
use App\Http\Middleware\EnsureAccountActivated;
use App\Http\Middleware\EnsureAccountNotSuspended;
use App\Http\Middleware\EnsureActiveSubscription;
use App\Http\Middleware\EnsureAdminAccess;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->statefulApi();
        $middleware->alias([
            'admin.access' => EnsureAdminAccess::class,
            'account.activated' => EnsureAccountActivated::class,
            'account.not_suspended' => EnsureAccountNotSuspended::class,
            'subscription.active' => EnsureActiveSubscription::class,
            'subscription.feature' => CheckSubscriptionFeature::class,
            'employee.limit' => CheckEmployeeLimit::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
