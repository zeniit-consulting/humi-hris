<?php

use App\Http\Controllers\Api\Mobile\V1\AttendanceController;
use App\Http\Controllers\Api\Mobile\V1\LeaveController;
use App\Http\Controllers\Api\Mobile\V1\OvertimeController;
use App\Http\Controllers\Api\Mobile\V1\PayrollController;
use App\Http\Controllers\Api\Mobile\V1\PortalController;
use App\Http\Controllers\Api\PortalResourceController;
use App\Http\Controllers\Admin\SubscriberManagementController;
use App\Http\Controllers\Auth\PortalOtpLoginController;
use App\Http\Controllers\Auth\WhatsappActivationController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserPortalController;
use App\Http\Controllers\UserPortalSectionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    $allowedVariants = ['original', 'workable'];
    $forcedVariant = $request->query('landing_variant');
    $variant = in_array($forcedVariant, $allowedVariants, true)
        ? $forcedVariant
        : 'original';

    Cookie::queue(
        Cookie::make('landing_variant', $variant, 60 * 24 * 30, sameSite: 'Lax')
    );

    return Inertia::render(
        $variant === 'workable' ? 'landing/workable' : 'welcome',
        [
            'canRegister' => Features::enabled(Features::registration()),
            'landingVariant' => $variant,
        ]
    );
})->name('home');

Route::inertia('landing-workable', 'landing/workable', [
    'canRegister' => Features::enabled(Features::registration()),
    'landingVariant' => 'workable',
])->name('landing.workable');

Route::get('careers', [CareerController::class, 'index'])->name('careers.index');
Route::get('careers/{slug}', [CareerController::class, 'show'])->name('careers.show');
Route::post('careers/{slug}/apply', [CareerController::class, 'storeApplication'])->name('careers.apply');

Route::middleware('auth')->group(function () {
    Route::get('activate-account', [WhatsappActivationController::class, 'show'])->name('activation.notice');
    Route::post('activate-account/send', [WhatsappActivationController::class, 'send'])->name('activation.send');
    Route::post('activate-account/verify', [WhatsappActivationController::class, 'verify'])->name('activation.verify');
});

Route::middleware('guest')->group(function () {
    Route::get('portal/login', [PortalOtpLoginController::class, 'create'])->name('portal.login');
    Route::post('portal/login/send-otp', [PortalOtpLoginController::class, 'sendOtp'])
        ->middleware('throttle:5,1')
        ->name('portal.login.send-otp');
    Route::post('portal/login/verify-otp', [PortalOtpLoginController::class, 'verifyOtp'])
        ->middleware('throttle:10,1')
        ->name('portal.login.verify-otp');
});

Route::middleware(['auth', 'account.activated', 'account.not_suspended', 'admin.access'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('billing/invoices', [BillingController::class, 'createInvoice'])->name('billing.invoices.store');
    Route::post('billing/invoices/{invoice}/proof', [BillingController::class, 'uploadProof'])->name('billing.invoices.proof');
    Route::delete('billing/invoices/{invoice}', [BillingController::class, 'cancelInvoice'])->name('billing.invoices.cancel');
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

Route::middleware(['auth', 'account.activated', 'account.not_suspended'])->group(function () {
    Route::get('portal', UserPortalController::class)->name('portal.index');
    Route::get('portal/api/summary', [PortalController::class, 'summary'])->name('portal.api.summary');
    Route::get('portal/api/attendances', [AttendanceController::class, 'index'])->name('portal.api.attendances.index');
    Route::post('portal/api/attendances', [AttendanceController::class, 'store'])->name('portal.api.attendances.store');
    Route::put('portal/api/attendances/{employeeAttendance}', [AttendanceController::class, 'update'])->name('portal.api.attendances.update');
    Route::delete('portal/api/attendances/{employeeAttendance}', [AttendanceController::class, 'destroy'])->name('portal.api.attendances.destroy');
    Route::get('portal/api/leaves', [LeaveController::class, 'index'])->name('portal.api.leaves.index');
    Route::post('portal/api/leaves', [LeaveController::class, 'store'])->name('portal.api.leaves.store');
    Route::put('portal/api/leaves/{leave}', [LeaveController::class, 'update'])->name('portal.api.leaves.update');
    Route::delete('portal/api/leaves/{leave}', [LeaveController::class, 'destroy'])->name('portal.api.leaves.destroy');
    Route::get('portal/api/overtimes', [OvertimeController::class, 'index'])->name('portal.api.overtimes.index');
    Route::post('portal/api/overtimes', [OvertimeController::class, 'store'])->name('portal.api.overtimes.store');
    Route::put('portal/api/overtimes/{overtime}', [OvertimeController::class, 'update'])->name('portal.api.overtimes.update');
    Route::delete('portal/api/overtimes/{overtime}', [OvertimeController::class, 'destroy'])->name('portal.api.overtimes.destroy');
    Route::get('portal/api/payrolls/preview', [PayrollController::class, 'preview'])->name('portal.api.payrolls.preview');
    Route::get('portal/api/announcements', [PortalResourceController::class, 'announcements'])->name('portal.api.announcements.index');
    Route::get('portal/api/surveys', [PortalResourceController::class, 'surveys'])->name('portal.api.surveys.index');
    Route::post('portal/api/surveys/{survey}/responses', [PortalResourceController::class, 'submitSurvey'])->name('portal.api.surveys.responses.store');
    Route::get('portal/api/assets', [PortalResourceController::class, 'assets'])->name('portal.api.assets.index');
    Route::get('portal/attendance', [UserPortalSectionController::class, 'attendance'])->name('portal.attendance');
    Route::get('portal/check-in', [UserPortalSectionController::class, 'checkIn'])->name('portal.check-in');
    Route::get('portal/leaves', [UserPortalSectionController::class, 'leaves'])->name('portal.leaves');
    Route::get('portal/overtimes', [UserPortalSectionController::class, 'overtimes'])->name('portal.overtimes');
    Route::get('portal/payroll', [UserPortalSectionController::class, 'payroll'])->name('portal.payroll');
    Route::get('portal/profile', [UserPortalSectionController::class, 'profile'])->name('portal.profile');
    Route::get('portal/announcements', [UserPortalSectionController::class, 'announcements'])->name('portal.announcements');
    Route::get('portal/surveys', [UserPortalSectionController::class, 'surveys'])->name('portal.surveys');
    Route::get('portal/assets', [UserPortalSectionController::class, 'assets'])->name('portal.assets');
    Route::post('portal/api/payrolls/preview-secure', [UserPortalSectionController::class, 'previewPayslip'])->name('portal.api.payrolls.preview-secure');
    Route::post('portal/payroll/export', [UserPortalSectionController::class, 'exportPayslip'])->name('portal.payroll.export');
});

require __DIR__.'/hris.php';
require __DIR__.'/settings.php';
