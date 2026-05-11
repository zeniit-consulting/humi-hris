<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Services\LeaveBalanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class LeaveBalanceController extends Controller
{
    public function __construct(private readonly LeaveBalanceService $balanceService) {}

    /**
     * Display leave balance summary for all employees.
     */
    public function index(Request $request): InertiaResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'leave_type' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);

        $year = (int) ($validated['year'] ?? now()->year);
        $leaveType = $validated['leave_type'] ?? 'annual';
        $filters = [
            'year' => $year,
            'leave_type' => $leaveType,
            'employee_id' => $validated['employee_id'] ?? '',
        ];

        $owner = $request->user()->accountOwnerId() === $request->user()->id
            ? $request->user()
            : \App\Models\User::find($ownerId);

        $policy = $this->balanceService->getPolicy($owner, $leaveType);

        $balances = $this->balanceService->getBalanceSummary($owner, $year, $leaveType)
            ->when($filters['employee_id'] !== '', fn ($col) => $col->where('employee_id', $filters['employee_id']))
            ->map(fn ($balance) => [
                'id' => $balance->id,
                'employee_id' => $balance->employee_id,
                'employee_label' => $balance->employee
                    ? $balance->employee->employee_code.' - '.$balance->employee->full_name
                    : '-',
                'policy_type' => $balance->policy_type,
                'total_quota' => $balance->total_quota,
                'accrued_days' => $balance->accrued_days,
                'used_days' => $balance->used_days,
                'adjusted_days' => $balance->adjusted_days,
                'remaining_balance' => $balance->remainingBalance(),
            ])
            ->values();

        $employees = Employee::withoutGlobalScopes()
            ->where('user_id', $ownerId)
            ->orderBy('first_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name'])
            ->map(fn (Employee $e) => [
                'id' => $e->id,
                'label' => $e->employee_code.' - '.$e->full_name,
            ]);

        return Inertia::render('hris/leaves/balances/index', [
            'balances' => $balances,
            'employees' => $employees,
            'policy' => $policy ? [
                'id' => $policy->id,
                'leave_type' => $policy->leave_type,
                'policy_type' => $policy->policy_type,
                'yearly_days' => $policy->yearly_days,
                'max_days_per_request' => $policy->max_days_per_request,
                'is_active' => $policy->is_active,
            ] : null,
            'year' => $year,
            'leaveType' => $leaveType,
            'filters' => $filters,
        ]);
    }

    /**
     * Initialize leave balances for all active employees.
     */
    public function initialize(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'leave_type' => ['required', 'string', 'max:30'],
        ]);

        $owner = \App\Models\User::find($request->user()->accountOwnerId());

        $count = $this->balanceService->initializeBalancesForAll(
            $owner,
            $validated['leave_type'],
            (int) $validated['year']
        );

        return back()->with('success', "Saldo cuti berhasil diinisialisasi untuk {$count} karyawan.");
    }

    /**
     * Run manual monthly accrual.
     */
    public function accrue(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'leave_type' => ['required', 'string', 'max:30'],
        ]);

        $owner = \App\Models\User::find($request->user()->accountOwnerId());

        $count = $this->balanceService->accrueMonthly($owner, $validated['leave_type']);

        return back()->with('success', "Akrual bulanan berhasil dijalankan untuk {$count} karyawan.");
    }

    /**
     * Manual balance adjustment for a single employee.
     */
    public function adjust(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'leave_type' => ['required', 'string', 'max:30'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'amount' => ['required', 'numeric'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        $this->balanceService->adjustBalance(
            $employee,
            $validated['leave_type'],
            (int) $validated['year'],
            (float) $validated['amount'],
            $validated['description']
        );

        return back()->with('success', 'Penyesuaian saldo cuti berhasil disimpan.');
    }

    /**
     * Display leave transaction ledger for a single employee.
     */
    public function ledger(Request $request, Employee $employee): InertiaResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'leave_type' => ['nullable', 'string'],
        ]);

        $year = (int) ($validated['year'] ?? now()->year);
        $leaveType = $validated['leave_type'] ?? 'annual';

        $owner = \App\Models\User::find($ownerId);

        $transactions = $this->balanceService->getLedger($employee, $year, $leaveType)
            ->map(fn ($tx) => [
                'id' => $tx->id,
                'amount' => $tx->amount,
                'type' => $tx->type,
                'description' => $tx->description,
                'balance_after' => $tx->balance_after,
                'effective_date' => $tx->effective_date->format('Y-m-d'),
                'leave_request_id' => $tx->leave_request_id,
            ]);

        $balance = \App\Models\EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $employee->id)
            ->where('leave_type', $leaveType)
            ->where('year', $year)
            ->first();

        return Inertia::render('hris/leaves/balances/ledger', [
            'transactions' => $transactions,
            'employee' => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ],
            'balance' => $balance ? [
                'total_quota' => $balance->total_quota,
                'accrued_days' => $balance->accrued_days,
                'used_days' => $balance->used_days,
                'adjusted_days' => $balance->adjusted_days,
                'remaining_balance' => $balance->remainingBalance(),
            ] : null,
            'year' => $year,
            'leaveType' => $leaveType,
        ]);
    }
}
