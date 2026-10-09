<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeavePolicy;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeavePolicyController extends Controller
{
    public function __construct(private readonly LeaveBalanceService $balanceService) {}

    /**
     * Create or update leave policy for a leave_type.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'leave_type' => ['required', 'string', 'max:30'],
            'policy_type' => ['required', Rule::in(['annual', 'prorated', 'monthly_accrual', 'anniversary'])],
            'yearly_days' => ['required', 'integer', 'min:1', 'max:365'],
            'waiting_period_months' => ['required', 'integer', 'min:0', 'max:120'],
            'max_days_per_request' => ['nullable', 'integer', 'min:1', 'max:365'],
            'min_notice_days' => ['nullable', 'integer', 'min:0', 'max:90'],
            'approval_levels' => ['required', 'integer', Rule::in([1, 2])],
            'is_active' => ['boolean'],
            'apply_to_all' => ['nullable', 'boolean'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $ownerId = $request->user()->accountOwnerId();

        $policy = LeavePolicy::withoutGlobalScopes()->updateOrCreate(
            ['user_id' => $ownerId, 'leave_type' => $validated['leave_type']],
            [
                'policy_type' => $validated['policy_type'],
                'yearly_days' => $validated['yearly_days'],
                'waiting_period_months' => $validated['waiting_period_months'],
                'max_days_per_request' => $validated['max_days_per_request'] ?? null,
                'min_notice_days' => (int) ($validated['min_notice_days'] ?? 0),
                'approval_levels' => $validated['approval_levels'],
                'is_active' => $validated['is_active'] ?? true,
            ]
        );

        if ($request->boolean('apply_to_all')) {
            $owner = $request->user()->accountOwnerId() === $request->user()->id
                ? $request->user()
                : User::find($ownerId);
            $year = (int) ($validated['year'] ?? now()->year);
            $count = $this->balanceService->applyPolicyToAll(
                $owner,
                $policy,
                $year,
                $this->visibleEmployeeIdsFor($request)
            );

            return back()->with('success', "Kebijakan cuti berhasil disimpan dan diterapkan ke {$count} karyawan untuk tahun {$year}.");
        }

        return back()->with('success', 'Kebijakan cuti berhasil disimpan.');
    }

    /**
     * Update existing leave policy.
     */
    public function update(Request $request, LeavePolicy $policy): RedirectResponse
    {
        abort_if($policy->user_id !== $request->user()->accountOwnerId(), 403);

        $validated = $request->validate([
            'policy_type' => ['required', Rule::in(['annual', 'prorated', 'monthly_accrual', 'anniversary'])],
            'yearly_days' => ['required', 'integer', 'min:1', 'max:365'],
            'waiting_period_months' => ['required', 'integer', 'min:0', 'max:120'],
            'max_days_per_request' => ['nullable', 'integer', 'min:1', 'max:365'],
            'min_notice_days' => ['nullable', 'integer', 'min:0', 'max:90'],
            'approval_levels' => ['required', 'integer', Rule::in([1, 2])],
            'is_active' => ['boolean'],
            'apply_to_all' => ['nullable', 'boolean'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $policy->update([
            'policy_type' => $validated['policy_type'],
            'yearly_days' => $validated['yearly_days'],
            'waiting_period_months' => $validated['waiting_period_months'],
            'max_days_per_request' => $validated['max_days_per_request'] ?? null,
            'min_notice_days' => (int) ($validated['min_notice_days'] ?? 0),
            'approval_levels' => $validated['approval_levels'],
            'is_active' => $validated['is_active'] ?? $policy->is_active,
        ]);

        if ($request->boolean('apply_to_all')) {
            $owner = $request->user()->accountOwnerId() === $request->user()->id
                ? $request->user()
                : User::find($request->user()->accountOwnerId());
            $year = (int) ($validated['year'] ?? now()->year);
            $count = $this->balanceService->applyPolicyToAll(
                $owner,
                $policy,
                $year,
                $this->visibleEmployeeIdsFor($request)
            );

            return back()->with('success', "Kebijakan cuti berhasil diperbarui dan diterapkan ke {$count} karyawan untuk tahun {$year}.");
        }

        return back()->with('success', 'Kebijakan cuti berhasil diperbarui.');
    }

    private function visibleEmployeeIdsFor(Request $request): ?array
    {
        if (! $request->user()->parent_user_id) {
            return null;
        }

        return Employee::query()
            ->where('user_id', $request->user()->accountOwnerId())
            ->where('is_active', true)
            ->where('employment_status', '!=', 'resigned')
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }
}
