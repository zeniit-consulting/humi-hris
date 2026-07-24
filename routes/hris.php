<?php

use App\Http\Controllers\Hris\AttendanceController;
use App\Http\Controllers\Hris\ApprovalSettingController;
use App\Http\Controllers\Hris\AttendanceCorrectionApprovalController;
use App\Http\Controllers\Hris\AttendanceScheduleController;
use App\Http\Controllers\Hris\ClientBillingController;
use App\Http\Controllers\Hris\ClientVisitController;
use App\Http\Controllers\Hris\CompanyAssetController;
use App\Http\Controllers\Hris\CompanyAssetProcurementRequestController;
use App\Http\Controllers\Hris\DivisionController;
use App\Http\Controllers\Hris\EmployeeAllowanceController;
use App\Http\Controllers\Hris\EmployeeBankAccountController;
use App\Http\Controllers\Hris\EmployeeController;
use App\Http\Controllers\Hris\EmployeeDocumentController;
use App\Http\Controllers\Hris\EmployeeMasterController;
use App\Http\Controllers\Hris\EmployeeReprimandController;
use App\Http\Controllers\Hris\KasbonController;
use App\Http\Controllers\Hris\LeaveBalanceController;
use App\Http\Controllers\Hris\LeaveController;
use App\Http\Controllers\Hris\LeavePolicyController;
use App\Http\Controllers\Hris\ManpowerRequestController;
use App\Http\Controllers\Hris\NotificationController;
use App\Http\Controllers\Hris\OrganizationChartController;
use App\Http\Controllers\Hris\OvertimeController;
use App\Http\Controllers\Hris\PayrollController;
use App\Http\Controllers\Hris\PerformanceController;
use App\Http\Controllers\Hris\PositionController;
use App\Http\Controllers\Hris\RecruitmentController;
use App\Http\Controllers\Hris\ReimbursementController;
use App\Http\Controllers\Hris\ReportController;
use App\Http\Controllers\Hris\ScheduleController;
use App\Http\Controllers\Hris\ShiftChangeApprovalController;
use App\Http\Controllers\Hris\SubCompanyController;
use App\Http\Controllers\Hris\SurveyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'account.activated', 'account.not_suspended', 'admin.access', 'subscription.active'])->prefix('hris')->name('hris.')->group(function () {
    Route::get('approval-settings', [ApprovalSettingController::class, 'index'])->name('approval-settings.index');
    Route::put('approval-settings/{type}', [ApprovalSettingController::class, 'update'])->name('approval-settings.update');
    Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('employees/resigned', [EmployeeController::class, 'resigned'])->name('employees.resigned');
    Route::get('sub-companies', [SubCompanyController::class, 'index'])->name('sub-companies.index');
    Route::post('sub-companies', [SubCompanyController::class, 'store'])->name('sub-companies.store');
    Route::put('sub-companies/{subCompany}', [SubCompanyController::class, 'update'])->name('sub-companies.update');
    Route::delete('sub-companies/{subCompany}', [SubCompanyController::class, 'destroy'])->name('sub-companies.destroy');
    Route::post('sub-companies/{subCompany}/locations', [SubCompanyController::class, 'storeLocation'])->name('sub-companies.locations.store');
    Route::put('sub-companies/{subCompany}/locations/{location}', [SubCompanyController::class, 'updateLocation'])->name('sub-companies.locations.update');
    Route::delete('sub-companies/{subCompany}/locations/{location}', [SubCompanyController::class, 'destroyLocation'])->name('sub-companies.locations.destroy');
    Route::get('client-billings', [ClientBillingController::class, 'index'])->name('client-billings.index');
    Route::post('client-billings', [ClientBillingController::class, 'store'])->name('client-billings.store');
    Route::put('client-billings/{clientInvoice}', [ClientBillingController::class, 'update'])->name('client-billings.update');
    Route::delete('client-billings/{clientInvoice}', [ClientBillingController::class, 'destroy'])->name('client-billings.destroy');
    Route::get('manpower-requests', [ManpowerRequestController::class, 'index'])->name('manpower-requests.index');
    Route::post('manpower-requests', [ManpowerRequestController::class, 'store'])->name('manpower-requests.store');
    Route::put('manpower-requests/{manpowerRequest}', [ManpowerRequestController::class, 'update'])->name('manpower-requests.update');
    Route::delete('manpower-requests/{manpowerRequest}', [ManpowerRequestController::class, 'destroy'])->name('manpower-requests.destroy');
    Route::get('reprimands', [EmployeeReprimandController::class, 'index'])->name('reprimands.index');
    Route::post('reprimands', [EmployeeReprimandController::class, 'store'])->name('reprimands.store');
    Route::put('reprimands/{reprimand}', [EmployeeReprimandController::class, 'update'])->name('reprimands.update');
    Route::delete('reprimands/{reprimand}', [EmployeeReprimandController::class, 'destroy'])->name('reprimands.destroy');
    Route::get('employees/master-data', [EmployeeMasterController::class, 'index'])->name('employees.master-data');
    Route::get('employees/import-template', [EmployeeController::class, 'downloadImportTemplate'])->name('employees.import-template');
    Route::post('employees/import', [EmployeeController::class, 'import'])->name('employees.import');
    Route::get('employees/export', [EmployeeController::class, 'export'])->name('employees.export');
    Route::get('employees/{employee}/contract', [EmployeeController::class, 'contract'])->name('employees.contract');
    Route::post('employees/{employee}/activate-user', [EmployeeController::class, 'activatePortalUser'])->name('employees.activate-user');
    Route::post('employees/{employee}/invite-user', [EmployeeController::class, 'invitePortalUser'])->name('employees.invite-user');
    Route::post('employees/{employee}/activate-pkwtt', [EmployeeController::class, 'activatePkwtt'])->name('employees.activate-pkwtt');
    Route::post('employees/{employee}/offboard', [EmployeeController::class, 'offboard'])->name('employees.offboard');
    Route::post('employees', [EmployeeController::class, 'store'])->middleware('employee.limit')->name('employees.store');
    Route::put('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::get('organization-chart', [OrganizationChartController::class, 'index'])->name('organization-chart.index');
    Route::middleware('subscription.feature:performance')->group(function () {
        Route::get('performances', [PerformanceController::class, 'index'])->name('performances.index');
        Route::post('performances/periods', [PerformanceController::class, 'storePeriod'])->name('performances.periods.store');
        Route::put('performances/periods/{period}', [PerformanceController::class, 'updatePeriod'])->name('performances.periods.update');
        Route::post('performances/templates', [PerformanceController::class, 'storeTemplate'])->name('performances.templates.store');
        Route::put('performances/templates/{template}', [PerformanceController::class, 'updateTemplate'])->name('performances.templates.update');
        Route::delete('performances/templates/{template}', [PerformanceController::class, 'destroyTemplate'])->name('performances.templates.destroy');
        Route::post('performances/templates/{template}/metrics', [PerformanceController::class, 'storeMetric'])->name('performances.templates.metrics.store');
        Route::post('performances/templates/{template}/attendance-defaults', [PerformanceController::class, 'storeAttendanceDefaults'])->name('performances.templates.attendance-defaults.store');
        Route::put('performances/metrics/{metric}', [PerformanceController::class, 'updateMetric'])->name('performances.metrics.update');
        Route::delete('performances/metrics/{metric}', [PerformanceController::class, 'destroyMetric'])->name('performances.metrics.destroy');
        Route::post('performances/reviews', [PerformanceController::class, 'storeReview'])->name('performances.reviews.store');
        Route::put('performances/reviews/{review}', [PerformanceController::class, 'updateReview'])->name('performances.reviews.update');
        Route::post('performances/reviews/{review}/sync-attendance', [PerformanceController::class, 'syncAttendance'])->name('performances.reviews.sync-attendance');
        Route::post('performances/reviews/{review}/objectives', [PerformanceController::class, 'storeObjective'])->name('performances.reviews.objectives.store');
        Route::post('performances/reviews/{review}/check-ins', [PerformanceController::class, 'storeCheckIn'])->name('performances.reviews.check-ins.store');
        Route::put('performances/objectives/{objective}', [PerformanceController::class, 'updateObjective'])->name('performances.objectives.update');
        Route::delete('performances/objectives/{objective}', [PerformanceController::class, 'destroyObjective'])->name('performances.objectives.destroy');
        Route::post('performances/objectives/{objective}/key-results', [PerformanceController::class, 'storeKeyResult'])->name('performances.objectives.key-results.store');
        Route::put('performances/key-results/{keyResult}', [PerformanceController::class, 'updateKeyResult'])->name('performances.key-results.update');
        Route::delete('performances/key-results/{keyResult}', [PerformanceController::class, 'destroyKeyResult'])->name('performances.key-results.destroy');
        Route::put('performances/kpi-results/{kpiResult}', [PerformanceController::class, 'updateKpiResult'])->name('performances.kpi-results.update');
    });
    Route::middleware('subscription.feature:recruitment')->group(function () {
        Route::get('recruitment', [RecruitmentController::class, 'index'])->name('recruitment.index');
        Route::post('recruitment/vacancies', [RecruitmentController::class, 'store'])->name('recruitment.vacancies.store');
        Route::put('recruitment/vacancies/{jobVacancy}', [RecruitmentController::class, 'update'])->name('recruitment.vacancies.update');
        Route::delete('recruitment/vacancies/{jobVacancy}', [RecruitmentController::class, 'destroy'])->name('recruitment.vacancies.destroy');
        Route::put('recruitment/applications/{jobApplication}', [RecruitmentController::class, 'updateApplication'])->name('recruitment.applications.update');
        Route::get('recruitment/applications/{jobApplication}/offer-letter', [RecruitmentController::class, 'offerLetter'])
            ->name('recruitment.applications.offer-letter');
        Route::get('recruitment/applications/{jobApplication}/initial-contract', [RecruitmentController::class, 'initialContract'])
            ->name('recruitment.applications.initial-contract');
    });

    Route::post('divisions', [DivisionController::class, 'store'])->name('divisions.store');
    Route::put('divisions/{division}', [DivisionController::class, 'update'])->name('divisions.update');
    Route::delete('divisions/{division}', [DivisionController::class, 'destroy'])->name('divisions.destroy');

    Route::post('positions', [PositionController::class, 'store'])->name('positions.store');
    Route::put('positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::delete('positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');

    Route::post('employees/{employee}/bank-accounts', [EmployeeBankAccountController::class, 'store'])
        ->name('employees.bank-accounts.store');
    Route::put('employees/{employee}/bank-accounts/{employeeBankAccount}', [EmployeeBankAccountController::class, 'update'])
        ->name('employees.bank-accounts.update');
    Route::delete('employees/{employee}/bank-accounts/{employeeBankAccount}', [EmployeeBankAccountController::class, 'destroy'])
        ->name('employees.bank-accounts.destroy');
    Route::post('employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])
        ->name('employees.documents.store');
    Route::put('employees/{employee}/documents/{employeeDocument}', [EmployeeDocumentController::class, 'update'])
        ->name('employees.documents.update');
    Route::delete('employees/{employee}/documents/{employeeDocument}', [EmployeeDocumentController::class, 'destroy'])
        ->name('employees.documents.destroy');
    Route::get('employees/{employee}/documents/{employeeDocument}/download', [EmployeeDocumentController::class, 'download'])
        ->name('employees.documents.download');
    Route::post('employees/{employee}/allowances', [EmployeeAllowanceController::class, 'store'])
        ->name('employees.allowances.store');
    Route::put('employees/{employee}/allowances/{employeeAllowance}', [EmployeeAllowanceController::class, 'update'])
        ->name('employees.allowances.update');
    Route::delete('employees/{employee}/allowances/{employeeAllowance}', [EmployeeAllowanceController::class, 'destroy'])
        ->name('employees.allowances.destroy');

    Route::get('attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::get('client-visits', [ClientVisitController::class, 'index'])->name('client-visits.index');
    Route::get('attendances/export', [AttendanceController::class, 'export'])->name('attendances.export');
    Route::get('attendances/employees/{employee}/monthly', [AttendanceController::class, 'showMonthly'])->name('attendances.monthly.show');
    Route::post('attendances/sync-missing-checkouts', [AttendanceController::class, 'syncMissingCheckouts'])->name('attendances.sync-missing-checkouts');
    Route::post('attendances', [AttendanceController::class, 'store'])->name('attendances.store');
    Route::put('attendances/{employeeAttendance}', [AttendanceController::class, 'update'])->name('attendances.update');
    Route::delete('attendances/{employeeAttendance}', [AttendanceController::class, 'destroy'])->name('attendances.destroy');
    Route::post('attendances/schedules', [AttendanceScheduleController::class, 'store'])->name('attendances.schedules.store');

    Route::get('schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::post('schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::delete('schedules/{employeeSchedule}', [ScheduleController::class, 'destroySchedule'])->name('schedules.destroy');
    Route::post('schedules/holidays/sync', [ScheduleController::class, 'syncHolidays'])->name('schedules.holidays.sync');
    Route::post('schedules/shifts', [ScheduleController::class, 'storeShift'])->name('schedules.shifts.store');
    Route::put('schedules/shifts/{workShift}', [ScheduleController::class, 'updateShift'])->name('schedules.shifts.update');
    Route::delete('schedules/shifts/{workShift}', [ScheduleController::class, 'destroyShift'])->name('schedules.shifts.destroy');
    Route::post('schedules/roster', [ScheduleController::class, 'roster'])->name('schedules.roster');
    Route::get('shift-change-requests', [ShiftChangeApprovalController::class, 'index'])->name('shift-change-requests.index');
    Route::post('shift-change-requests/{shiftChangeRequest}/approve', [ShiftChangeApprovalController::class, 'approve'])->name('shift-change-requests.approve');
    Route::post('shift-change-requests/{shiftChangeRequest}/reject', [ShiftChangeApprovalController::class, 'reject'])->name('shift-change-requests.reject');
    Route::get('attendance-approvals', [AttendanceCorrectionApprovalController::class, 'index'])->name('attendance-approvals.index');
    Route::post('attendance-approvals/{attendanceRequest}/approve', [AttendanceCorrectionApprovalController::class, 'approve'])->name('attendance-approvals.approve');
    Route::post('attendance-approvals/{attendanceRequest}/reject', [AttendanceCorrectionApprovalController::class, 'reject'])->name('attendance-approvals.reject');

    Route::middleware('subscription.feature:payroll')->group(function () {
        Route::get('payrolls', [PayrollController::class, 'index'])->name('payrolls.index');
        Route::post('payrolls/generate', [PayrollController::class, 'generate'])->name('payrolls.generate');
        Route::post('payrolls/thr/generate', [PayrollController::class, 'generateThr'])->name('payrolls.thr.generate');
        Route::post('payrolls/{payrollRun}/save', [PayrollController::class, 'save'])->name('payrolls.save');
        Route::post('payrolls/{payrollRun}/send-payslips', [PayrollController::class, 'sendPayslips'])->name('payrolls.send-payslips');
        Route::put('payrolls/{payrollRun}/items/{payrollItem}', [PayrollController::class, 'updateItem'])->name('payrolls.items.update');
        Route::post('payrolls/{payrollRun}/items/{payrollItem}/send-payslip', [PayrollController::class, 'sendPayslip'])->name('payrolls.items.send-payslip');
        Route::get('payrolls/{payrollRun}/export/mandiri', [PayrollController::class, 'exportMandiri'])->name('payrolls.export.mandiri');
        Route::get('payrolls/{payrollRun}/export/bca', [PayrollController::class, 'exportBca'])->name('payrolls.export.bca');
        Route::get('kasbons', [KasbonController::class, 'index'])->name('kasbons.index');
        Route::post('kasbons', [KasbonController::class, 'store'])->name('kasbons.store');
        Route::put('kasbons/{employeeDeduction}', [KasbonController::class, 'update'])->name('kasbons.update');
        Route::delete('kasbons/{employeeDeduction}', [KasbonController::class, 'destroy'])->name('kasbons.destroy');
    });

    Route::middleware('subscription.feature:assets')->group(function () {
        Route::get('assets', [CompanyAssetController::class, 'index'])->name('assets.index');
        Route::get('assets/procurement-requests', [CompanyAssetProcurementRequestController::class, 'index'])->name('assets.procurement-requests.index');
        Route::post('assets/procurement-requests', [CompanyAssetProcurementRequestController::class, 'store'])->name('assets.procurement-requests.store');
        Route::post('assets/procurement-requests/{procurementRequest}/status', [CompanyAssetProcurementRequestController::class, 'updateStatus'])->name('assets.procurement-requests.status');
        Route::post('assets', [CompanyAssetController::class, 'store'])->name('assets.store');
        Route::put('assets/{companyAsset}', [CompanyAssetController::class, 'update'])->name('assets.update');
        Route::delete('assets/{companyAsset}', [CompanyAssetController::class, 'destroy'])->name('assets.destroy');
    });

    Route::get('leaves', [LeaveController::class, 'index'])->name('leaves.index');
    Route::get('leaves/export', [LeaveController::class, 'export'])->name('leaves.export');
    Route::get('leave-approvals', [LeaveController::class, 'approvals'])->name('leave-approvals.index');
    Route::post('leave-approvals/{leave}/approve', [LeaveController::class, 'approve'])->name('leave-approvals.approve');
    Route::post('leave-approvals/{leave}/reject', [LeaveController::class, 'reject'])->name('leave-approvals.reject');

    // Leave Policy
    Route::post('leaves/policy', [LeavePolicyController::class, 'store'])->name('leaves.policy.store');
    Route::put('leaves/policy/{policy}', [LeavePolicyController::class, 'update'])->name('leaves.policy.update');

    // Leave Balance
    Route::get('leaves/balances', [LeaveBalanceController::class, 'index'])->name('leaves.balances.index');
    Route::post('leaves/balances/initialize', [LeaveBalanceController::class, 'initialize'])->name('leaves.balances.initialize');
    Route::post('leaves/balances/accrue', [LeaveBalanceController::class, 'accrue'])->name('leaves.balances.accrue');
    Route::put('leaves/balances/{employee}/adjust', [LeaveBalanceController::class, 'adjust'])->name('leaves.balances.adjust');
    Route::get('leaves/balances/{employee}/ledger', [LeaveBalanceController::class, 'ledger'])->name('leaves.balances.ledger');

    Route::post('leaves', [LeaveController::class, 'store'])->name('leaves.store');
    Route::put('leaves/{leave}', [LeaveController::class, 'update'])->name('leaves.update');
    Route::delete('leaves/{leave}', [LeaveController::class, 'destroy'])->name('leaves.destroy');

    Route::get('overtimes', [OvertimeController::class, 'index'])->name('overtimes.index');
    Route::get('overtimes/export', [OvertimeController::class, 'export'])->name('overtimes.export');
    Route::get('overtime-approvals', [OvertimeController::class, 'approvals'])->name('overtime-approvals.index');
    Route::post('overtime-approvals/{overtime}/approve', [OvertimeController::class, 'approve'])->name('overtime-approvals.approve');
    Route::post('overtime-approvals/{overtime}/reject', [OvertimeController::class, 'reject'])->name('overtime-approvals.reject');
    Route::post('overtimes', [OvertimeController::class, 'store'])->name('overtimes.store');
    Route::put('overtimes/{overtime}', [OvertimeController::class, 'update'])->name('overtimes.update');
    Route::delete('overtimes/{overtime}', [OvertimeController::class, 'destroy'])->name('overtimes.destroy');

    Route::get('reimbursements', [ReimbursementController::class, 'index'])->name('reimbursements.index');
    Route::post('reimbursements/{reimbursement}/approve', [ReimbursementController::class, 'approve'])->name('reimbursements.approve');
    Route::post('reimbursements/{reimbursement}/reject', [ReimbursementController::class, 'reject'])->name('reimbursements.reject');
    Route::post('reimbursements/{reimbursement}/status', [ReimbursementController::class, 'updateStatus'])->name('reimbursements.status');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications', [NotificationController::class, 'store'])->name('notifications.store');
    Route::put('notifications/{notification}', [NotificationController::class, 'update'])->name('notifications.update');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::get('surveys', [SurveyController::class, 'index'])->name('surveys.index');
    Route::post('surveys', [SurveyController::class, 'store'])->name('surveys.store');
    Route::put('surveys/{survey}', [SurveyController::class, 'update'])->name('surveys.update');
    Route::delete('surveys/{survey}', [SurveyController::class, 'destroy'])->name('surveys.destroy');
    Route::post('surveys/{survey}/responses', [SurveyController::class, 'respond'])->name('surveys.responses.store');
});
