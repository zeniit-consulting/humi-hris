<?php

use App\Http\Controllers\Admin\SubscriberManagementController;
use App\Http\Controllers\Api\Mobile\V1\AttendanceController;
use App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController;
use App\Http\Controllers\Api\Mobile\V1\KasbonController;
use App\Http\Controllers\Api\Mobile\V1\LeaveController;
use App\Http\Controllers\Api\Mobile\V1\OvertimeController;
use App\Http\Controllers\Api\Mobile\V1\PayrollController;
use App\Http\Controllers\Api\Mobile\V1\PortalController;
use App\Http\Controllers\Api\Mobile\V1\ProfileController as MobileProfileController;
use App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController;
use App\Http\Controllers\Api\PortalClientVisitController;
use App\Http\Controllers\Api\PortalPerformanceController;
use App\Http\Controllers\Api\PortalReimbursementController;
use App\Http\Controllers\Api\PortalResourceController;
use App\Http\Controllers\Api\PortalApprovalController;
use App\Http\Controllers\Auth\EmailActivationController;
use App\Http\Controllers\Auth\PortalOtpLoginController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\Client\ApprovalController as ClientApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocsManualController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserPortalController;
use App\Http\Controllers\UserPortalSectionController;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\JobVacancy;
use App\Support\HumiNews;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Inertia\Inertia;
use Laravel\Fortify\Features;

if (config('docs.domain')) {
    Route::domain(config('docs.domain'))->group(function () {
        Route::get('/', DocsManualController::class)->name('docs.manual');
    });
}

if (config('docs.fallback_path')) {
    Route::get('docs', DocsManualController::class)->name('docs.manual.preview');
}

Route::get('robots.txt', function () {
    $baseUrl = rtrim((string) config('app.url'), '/');
    $privatePaths = [
        '/dashboard',
        '/admin',
        '/billing',
        '/client',
        '/hris',
        '/portal',
        '/settings',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/two-factor-challenge',
    ];
    $crawlerGroups = [
        ['*'],
        ['Googlebot'],
        ['Googlebot-Image'],
        ['GPTBot'],
        ['OAI-SearchBot'],
        ['ChatGPT-User'],
        ['PerplexityBot'],
        ['ClaudeBot'],
        ['Claude-SearchBot'],
        ['Applebot'],
    ];
    $lines = [];

    foreach ($crawlerGroups as $agents) {
        foreach ($agents as $agent) {
            $lines[] = 'User-agent: '.$agent;
        }

        $lines[] = 'Allow: /';
        $lines[] = 'Allow: /features';
        $lines[] = 'Allow: /contact';
        $lines[] = 'Allow: /berita';
        $lines[] = 'Allow: /careers';
        $lines[] = 'Allow: /hris-outsourcing';
        $lines[] = 'Allow: /hris-retail-fnb';
        $lines[] = 'Allow: /hris-manufaktur-shift';

        foreach ($privatePaths as $path) {
            $lines[] = 'Disallow: '.$path;
        }

        $lines[] = '';
    }

    $lines[] = 'Sitemap: '.$baseUrl.'/sitemap.xml';
    $lines[] = '';

    return response(implode("\n", $lines), 200, [
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Cache-Control' => 'public, max-age=3600',
    ]);
})->withoutMiddleware([
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    ShareErrorsFromSession::class,
    ValidateCsrfToken::class,
    AddLinkHeadersForPreloadedAssets::class,
    HandleAppearance::class,
    HandleInertiaRequests::class,
])->name('robots');

Route::get('sitemap.xml', function () {
    $baseUrl = rtrim((string) config('app.url'), '/');
    $urls = [
        [
            'loc' => $baseUrl,
            'priority' => '1.0',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/careers',
            'priority' => '0.6',
            'changefreq' => 'daily',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/features',
            'priority' => '0.8',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/contact',
            'priority' => '0.7',
            'changefreq' => 'monthly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/berita',
            'priority' => '0.8',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/hris-outsourcing',
            'priority' => '0.9',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/hris-retail-fnb',
            'priority' => '0.9',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/hris-manufaktur-shift',
            'priority' => '0.9',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
    ];

    JobVacancy::query()
        ->select(['slug', 'updated_at'])
        ->where('status', 'published')
        ->where(function ($query): void {
            $query
                ->whereNull('closing_date')
                ->orWhereDate('closing_date', '>=', now()->toDateString());
        })
        ->latest('updated_at')
        ->limit(500)
        ->get()
        ->each(function (JobVacancy $vacancy) use (&$urls, $baseUrl): void {
            $urls[] = [
                'loc' => $baseUrl.'/careers/'.$vacancy->slug,
                'priority' => '0.5',
                'changefreq' => 'weekly',
                'lastmod' => $vacancy->updated_at?->toAtomString() ?? now()->toAtomString(),
            ];
        });

    HumiNews::all()
        ->each(function (array $article) use (&$urls, $baseUrl): void {
            $urls[] = [
                'loc' => $baseUrl.'/berita/'.$article['slug'],
                'priority' => '0.7',
                'changefreq' => 'monthly',
                'lastmod' => $article['updated_at'],
            ];
        });

    $xml = view('sitemap', ['urls' => $urls])->render();

    return response($xml, 200, [
        'Content-Type' => 'application/xml',
        'Cache-Control' => 'public, max-age=3600',
    ]);
})->withoutMiddleware([
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    ShareErrorsFromSession::class,
    ValidateCsrfToken::class,
    AddLinkHeadersForPreloadedAssets::class,
    HandleAppearance::class,
    HandleInertiaRequests::class,
])->name('sitemap');

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('landing-v2', function () {
    return Inertia::render('landing/mintlify', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('landing-v2');

Route::get('hris-outsourcing', function () {
    return Inertia::render('landing/industry', [
        'industrySlug' => 'outsourcing',
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('landing.outsourcing');

Route::get('hris-retail-fnb', function () {
    return Inertia::render('landing/industry', [
        'industrySlug' => 'retail-fnb',
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('landing.retail-fnb');

Route::get('hris-manufaktur-shift', function () {
    return Inertia::render('landing/industry', [
        'industrySlug' => 'manufaktur-shift',
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('landing.manufaktur-shift');

Route::get('features', function () {
    return Inertia::render('features');
})->name('features');

Route::get('contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::get('berita', [NewsController::class, 'index'])->name('news.index');
Route::get('berita/{slug}', [NewsController::class, 'show'])->name('news.show');

Route::get('careers', [CareerController::class, 'index'])->name('careers.index');
Route::get('careers/{slug}', [CareerController::class, 'show'])->name('careers.show');
Route::post('careers/{slug}/apply', [CareerController::class, 'storeApplication'])->name('careers.apply');

Route::middleware('auth')->group(function () {
    Route::get('activate-account', [EmailActivationController::class, 'show'])->name('activation.notice');
    Route::post('activate-account/send', [EmailActivationController::class, 'send'])->name('activation.send');
    Route::post('activate-account/verify', [EmailActivationController::class, 'verify'])->name('activation.verify');
});

Route::middleware('guest')->group(function () {
    Route::get('portal/login', [PortalOtpLoginController::class, 'create'])->name('portal.login');
    Route::post('portal/login/authenticate', [PortalOtpLoginController::class, 'loginWithWhatsApp'])
        ->middleware('throttle:10,1')
        ->name('portal.login.authenticate');
});

Route::middleware(['auth', 'account.activated', 'account.not_suspended', 'admin.access', 'billing.owner'])->group(function () {
    Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
    Route::get('billing/invoices', [BillingController::class, 'invoiceFallback'])->name('billing.invoices.index');
    Route::post('billing/invoices', [BillingController::class, 'createInvoice'])->name('billing.invoices.store');
    Route::get('billing/invoices/{invoice}/payment', [BillingController::class, 'payment'])->name('billing.invoices.payment');
    Route::post('billing/invoices/{invoice}/payment/check', [BillingController::class, 'checkPayment'])->name('billing.invoices.payment.check');
    Route::post('billing/invoices/{invoice}/proof', [BillingController::class, 'uploadProof'])->name('billing.invoices.proof');
    Route::delete('billing/invoices/{invoice}', [BillingController::class, 'cancelInvoice'])->name('billing.invoices.cancel');
});

Route::middleware(['auth', 'account.activated', 'account.not_suspended', 'admin.access', 'subscription.active'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['auth', 'account.activated', 'account.not_suspended', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('subscribers', [SubscriberManagementController::class, 'index'])->name('subscribers.index');
    Route::get('invoices', [SubscriberManagementController::class, 'invoices'])->name('invoices.index');
    Route::get('audit-logs', [SubscriberManagementController::class, 'auditLogs'])->name('audit-logs.index');
    Route::put('subscribers/{subscriber}/subscription', [SubscriberManagementController::class, 'updateSubscription'])
        ->name('subscribers.subscription.update');
    Route::post('subscribers/{subscriber}/suspend', [SubscriberManagementController::class, 'suspend'])
        ->name('subscribers.suspend');
    Route::post('subscribers/{subscriber}/reactivate', [SubscriberManagementController::class, 'reactivate'])
        ->name('subscribers.reactivate');
    Route::post('subscribers/invoices/{invoice}/approve', [SubscriberManagementController::class, 'approveInvoice'])
        ->name('subscribers.invoices.approve');
    Route::post('subscribers/invoices/{invoice}/cancel', [SubscriberManagementController::class, 'cancelInvoice'])
        ->name('subscribers.invoices.cancel');
});

Route::middleware(['auth', 'account.activated', 'account.not_suspended'])->prefix('client')->name('client.')->group(function () {
    Route::get('approvals', [ClientApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/attendance/{attendanceRequest}/approve', [ClientApprovalController::class, 'approveAttendance'])->name('approvals.attendance.approve');
    Route::post('approvals/attendance/{attendanceRequest}/reject', [ClientApprovalController::class, 'rejectAttendance'])->name('approvals.attendance.reject');
    Route::post('approvals/leaves/{leave}/approve', [ClientApprovalController::class, 'approveLeave'])->name('approvals.leaves.approve');
    Route::post('approvals/leaves/{leave}/reject', [ClientApprovalController::class, 'rejectLeave'])->name('approvals.leaves.reject');
    Route::post('approvals/overtimes/{overtime}/approve', [ClientApprovalController::class, 'approveOvertime'])->name('approvals.overtimes.approve');
    Route::post('approvals/overtimes/{overtime}/reject', [ClientApprovalController::class, 'rejectOvertime'])->name('approvals.overtimes.reject');
    Route::post('approvals/reimbursements/{reimbursement}/approve', [ClientApprovalController::class, 'approveReimbursement'])->name('approvals.reimbursements.approve');
    Route::post('approvals/reimbursements/{reimbursement}/reject', [ClientApprovalController::class, 'rejectReimbursement'])->name('approvals.reimbursements.reject');
});

Route::middleware(['auth', 'account.activated', 'account.not_suspended'])->group(function () {
    Route::get('portal', UserPortalController::class)->name('portal.index');
    Route::get('portal/api/summary', [PortalController::class, 'summary'])->name('portal.api.summary');
    Route::get('portal/api/attendances', [AttendanceController::class, 'index'])->name('portal.api.attendances.index');
    Route::post('portal/api/attendances', [AttendanceController::class, 'store'])->name('portal.api.attendances.store');
    Route::put('portal/api/attendances/{employeeAttendance}', [AttendanceController::class, 'update'])->name('portal.api.attendances.update');
    Route::delete('portal/api/attendances/{employeeAttendance}', [AttendanceController::class, 'destroy'])->name('portal.api.attendances.destroy');
    Route::get('portal/api/attendance-requests', [AttendanceCorrectionRequestController::class, 'index'])->name('portal.api.attendance-requests.index');
    Route::post('portal/api/attendance-requests', [AttendanceCorrectionRequestController::class, 'store'])->name('portal.api.attendance-requests.store');
    Route::get('portal/api/leaves', [LeaveController::class, 'index'])->name('portal.api.leaves.index');
    Route::post('portal/api/leaves', [LeaveController::class, 'store'])->name('portal.api.leaves.store');
    Route::put('portal/api/leaves/{leave}', [LeaveController::class, 'update'])->name('portal.api.leaves.update');
    Route::delete('portal/api/leaves/{leave}', [LeaveController::class, 'destroy'])->name('portal.api.leaves.destroy');
    Route::get('portal/api/overtimes', [OvertimeController::class, 'index'])->name('portal.api.overtimes.index');
    Route::post('portal/api/overtimes', [OvertimeController::class, 'store'])->name('portal.api.overtimes.store');
    Route::put('portal/api/overtimes/{overtime}', [OvertimeController::class, 'update'])->name('portal.api.overtimes.update');
    Route::delete('portal/api/overtimes/{overtime}', [OvertimeController::class, 'destroy'])->name('portal.api.overtimes.destroy');
    Route::get('portal/api/kasbons', [KasbonController::class, 'index'])->name('portal.api.kasbons.index');
    Route::post('portal/api/kasbons', [KasbonController::class, 'store'])->name('portal.api.kasbons.store');
    Route::get('portal/api/reimbursements', [PortalReimbursementController::class, 'index'])->name('portal.api.reimbursements.index');
    Route::post('portal/api/reimbursements', [PortalReimbursementController::class, 'store'])->name('portal.api.reimbursements.store');
    Route::get('portal/api/shift-change-requests', [ShiftChangeRequestController::class, 'index'])->name('portal.api.shift-change-requests.index');
    Route::post('portal/api/shift-change-requests', [ShiftChangeRequestController::class, 'store'])->name('portal.api.shift-change-requests.store');
    Route::get('portal/api/payrolls/preview', [PayrollController::class, 'preview'])->name('portal.api.payrolls.preview');
    Route::get('portal/api/profile', [MobileProfileController::class, 'show'])->name('portal.api.profile.show');
    Route::put('portal/api/profile', [MobileProfileController::class, 'updateProfile'])->name('portal.api.profile.update');
    Route::put('portal/api/profile/bank-account', [MobileProfileController::class, 'updateBankAccount'])->name('portal.api.profile.bank-account.update');
    Route::get('portal/api/announcements', [PortalResourceController::class, 'announcements'])->name('portal.api.announcements.index');
    Route::get('portal/api/surveys', [PortalResourceController::class, 'surveys'])->name('portal.api.surveys.index');
    Route::post('portal/api/surveys/{survey}/responses', [PortalResourceController::class, 'submitSurvey'])->name('portal.api.surveys.responses.store');
    Route::get('portal/api/assets', [PortalResourceController::class, 'assets'])->name('portal.api.assets.index');
    Route::get('portal/api/reprimands', [PortalResourceController::class, 'reprimands'])->name('portal.api.reprimands.index');
    Route::get('portal/api/approvals', [PortalApprovalController::class, 'index'])->name('portal.api.approvals.index');
    Route::post('portal/api/approvals/{type}/{id}/approve', [PortalApprovalController::class, 'approve'])->name('portal.api.approvals.approve');
    Route::post('portal/api/approvals/{type}/{id}/reject', [PortalApprovalController::class, 'reject'])->name('portal.api.approvals.reject');
    Route::get('portal/api/performances', [PortalPerformanceController::class, 'index'])->name('portal.api.performances.index');
    Route::post('portal/api/performances/{review}/check-ins', [PortalPerformanceController::class, 'storeCheckIn'])->name('portal.api.performances.check-ins.store');
    Route::get('portal/api/client-visits', [PortalClientVisitController::class, 'index'])->name('portal.api.client-visits.index');
    Route::post('portal/api/client-visits', [PortalClientVisitController::class, 'store'])->name('portal.api.client-visits.store');
    Route::put('portal/api/client-visits/{visit}/clock-out', [PortalClientVisitController::class, 'clockOut'])->name('portal.api.client-visits.clock-out');
    Route::get('portal/attendance', [UserPortalSectionController::class, 'attendance'])->name('portal.attendance');
    Route::get('portal/check-in', [UserPortalSectionController::class, 'checkIn'])->name('portal.check-in');
    Route::get('portal/check-out', [UserPortalSectionController::class, 'checkOut'])->name('portal.check-out');
    Route::get('portal/shift-change', [UserPortalSectionController::class, 'shiftChange'])->name('portal.shift-change');
    Route::get('portal/attendance-request', [UserPortalSectionController::class, 'attendanceRequest'])->name('portal.attendance-request');
    Route::get('portal/leaves', [UserPortalSectionController::class, 'leaves'])->name('portal.leaves');
    Route::get('portal/overtimes', [UserPortalSectionController::class, 'overtimes'])->name('portal.overtimes');
    Route::get('portal/kasbons', [UserPortalSectionController::class, 'kasbons'])->name('portal.kasbons');
    Route::get('portal/reimbursements', [UserPortalSectionController::class, 'reimbursements'])->name('portal.reimbursements');
    Route::get('portal/payroll', [UserPortalSectionController::class, 'payroll'])->name('portal.payroll');
    Route::get('portal/activity', [UserPortalSectionController::class, 'activity'])->name('portal.activity');
    Route::get('portal/activity/client-visits', [UserPortalSectionController::class, 'clientVisits'])->name('portal.activity.client-visits');
    Route::get('portal/activity/performance', [UserPortalSectionController::class, 'performanceActivity'])->name('portal.activity.performance');
    Route::get('portal/profile', [UserPortalSectionController::class, 'profile'])->name('portal.profile');
    Route::get('portal/announcements', [UserPortalSectionController::class, 'announcements'])->name('portal.announcements');
    Route::get('portal/surveys', [UserPortalSectionController::class, 'surveys'])->name('portal.surveys');
    Route::get('portal/assets', [UserPortalSectionController::class, 'assets'])->name('portal.assets');
    Route::get('portal/reprimands', [UserPortalSectionController::class, 'reprimands'])->name('portal.reprimands');
    Route::get('portal/approvals', [UserPortalSectionController::class, 'approvals'])->name('portal.approvals');
    Route::post('portal/api/payrolls/preview-secure', [UserPortalSectionController::class, 'previewPayslip'])->name('portal.api.payrolls.preview-secure');
    Route::post('portal/payroll/export', [UserPortalSectionController::class, 'exportPayslip'])->name('portal.payroll.export');
});

require __DIR__.'/hris.php';
require __DIR__.'/settings.php';
