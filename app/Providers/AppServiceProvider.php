<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Http\Responses\RegisterResponse;
use App\Models\User;
use App\Observers\UserObserver;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->singleton(RegisterResponseContract::class, RegisterResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureApiDocumentationAccess();
        User::observe(UserObserver::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );

        RateLimiter::for('payslip-whatsapp', fn (): Limit => Limit::perMinute(10)->by('payslip-whatsapp'));
        RateLimiter::for('transactional-email', fn (): Limit => Limit::perMinute(
            max(1, (int) config('mail.rate_limit_per_minute', 5)),
        )->by((string) config('mail.from.address')));
        RateLimiter::for('whatsapp-otp', function (object $job): Limit {
            $delaySeconds = max(1, (int) config('services.waha.otp_send_delay_seconds', 30));
            $key = method_exists($job, 'rateLimitKey') ? $job->rateLimitKey() : 'whatsapp-otp';

            return Limit::perSecond(1, $delaySeconds)->by($key);
        });
    }

    protected function configureApiDocumentationAccess(): void
    {
        Gate::define('viewApiDocs', function (?User $user = null): bool {
            if ((bool) config('scramble.docs_public', false)) {
                return true;
            }

            return $user !== null && ($user->isSuperAdmin() || ($user->role === 'admin' && $user->parent_user_id === null));
        });
    }
}
