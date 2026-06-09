<?php

use App\Http\Controllers\Api\Mobile\V1\AttendanceController;
use App\Http\Controllers\Api\Mobile\V1\AuthController;
use App\Http\Controllers\Api\Mobile\V1\DashboardController;
use App\Http\Controllers\Api\Mobile\V1\EmployeeController;
use App\Http\Controllers\Api\Mobile\V1\KasbonController;
use App\Http\Controllers\Api\Mobile\V1\LeaveController;
use App\Http\Controllers\Api\Mobile\V1\MasterController;
use App\Http\Controllers\Api\Mobile\V1\OvertimeController;
use App\Http\Controllers\Api\Mobile\V1\PayrollController;
use App\Http\Controllers\Api\Mobile\V1\PortalController;
use App\Http\Controllers\Api\Mobile\V1\ProfileController;
use App\Http\Controllers\Api\PakasirWebhookController;
use App\Http\Controllers\Api\ThirdParty\V1\AttendanceController as ThirdPartyAttendanceController;
use App\Http\Controllers\Api\ThirdParty\V1\AuthController as ThirdPartyAuthController;
use App\Http\Controllers\Api\ThirdParty\V1\CompanyController as ThirdPartyCompanyController;
use App\Http\Controllers\Api\ThirdParty\V1\EmployeeController as ThirdPartyEmployeeController;
use App\Http\Controllers\Api\ThirdParty\V1\LeaveController as ThirdPartyLeaveController;
use App\Http\Controllers\Api\ThirdParty\V1\OvertimeController as ThirdPartyOvertimeController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;

Route::post('webhooks/pakasir', PakasirWebhookController::class)->name('webhooks.pakasir');

Route::prefix('third-party/v1')->name('third-party.v1.')->group(function (): void {
    Route::post('auth/token', [ThirdPartyAuthController::class, 'issueToken'])
        ->middleware('throttle:10,1')
        ->name('auth.token');

    Route::middleware(['auth:sanctum', CheckAbilities::class.':third-party'])->group(function (): void {
        Route::delete('auth/token', [ThirdPartyAuthController::class, 'revokeCurrentToken'])->name('auth.token.revoke');
        Route::get('company', [ThirdPartyCompanyController::class, 'show'])->name('company.show');
        Route::get('employees', [ThirdPartyEmployeeController::class, 'index'])->name('employees.index');
        Route::get('employees/{employee}', [ThirdPartyEmployeeController::class, 'show'])->name('employees.show');
        Route::get('attendances', [ThirdPartyAttendanceController::class, 'index'])->name('attendances.index');
        Route::get('leaves', [ThirdPartyLeaveController::class, 'index'])->name('leaves.index');
        Route::get('overtimes', [ThirdPartyOvertimeController::class, 'index'])->name('overtimes.index');
    });
});

Route::prefix('mobile/v1')->name('mobile.v1.')->group(function (): void {
    Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');

    Route::middleware('auth:sanctum,web')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');

        Route::get('dashboard/summary', [DashboardController::class, 'summary'])->name('dashboard.summary');
        Route::get('portal/summary', [PortalController::class, 'summary'])->name('portal.summary');
        Route::get('master/options', [MasterController::class, 'options'])->name('master.options');

        Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');

        Route::get('attendances', [AttendanceController::class, 'index'])->name('attendances.index');
        Route::post('attendances', [AttendanceController::class, 'store'])->name('attendances.store');
        Route::put('attendances/{employeeAttendance}', [AttendanceController::class, 'update'])->name('attendances.update');
        Route::delete('attendances/{employeeAttendance}', [AttendanceController::class, 'destroy'])->name('attendances.destroy');

        Route::get('leaves', [LeaveController::class, 'index'])->name('leaves.index');
        Route::post('leaves', [LeaveController::class, 'store'])->name('leaves.store');
        Route::put('leaves/{leave}', [LeaveController::class, 'update'])->name('leaves.update');
        Route::delete('leaves/{leave}', [LeaveController::class, 'destroy'])->name('leaves.destroy');

        Route::get('overtimes', [OvertimeController::class, 'index'])->name('overtimes.index');
        Route::post('overtimes', [OvertimeController::class, 'store'])->name('overtimes.store');
        Route::put('overtimes/{overtime}', [OvertimeController::class, 'update'])->name('overtimes.update');
        Route::delete('overtimes/{overtime}', [OvertimeController::class, 'destroy'])->name('overtimes.destroy');

        Route::get('kasbons', [KasbonController::class, 'index'])->name('kasbons.index');
        Route::post('kasbons', [KasbonController::class, 'store'])->name('kasbons.store');
        Route::put('kasbons/{employeeDeduction}', [KasbonController::class, 'update'])->name('kasbons.update');
        Route::delete('kasbons/{employeeDeduction}', [KasbonController::class, 'destroy'])->name('kasbons.destroy');

        Route::get('payrolls/preview', [PayrollController::class, 'preview'])->name('payrolls.preview');
        Route::post('payrolls/generate', [PayrollController::class, 'generate'])->name('payrolls.generate');
        Route::post('payrolls/{payrollRun}/save', [PayrollController::class, 'save'])->name('payrolls.save');
        Route::get('payrolls/history', [PayrollController::class, 'history'])->name('payrolls.history');

        Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::put('profile', [ProfileController::class, 'updateProfile'])->name('profile.update');
        Route::put('profile/bank-account', [ProfileController::class, 'updateBankAccount'])->name('profile.bank-account.update');
    });
});
