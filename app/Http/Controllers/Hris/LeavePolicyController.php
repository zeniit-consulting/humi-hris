<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\LeavePolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeavePolicyController extends Controller
{
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
            'approval_levels' => ['required', 'integer', Rule::in([1, 2])],
            'is_active' => ['boolean'],
        ]);

        $ownerId = $request->user()->accountOwnerId();

        LeavePolicy::withoutGlobalScopes()->updateOrCreate(
            ['user_id' => $ownerId, 'leave_type' => $validated['leave_type']],
            [
                'policy_type' => $validated['policy_type'],
                'yearly_days' => $validated['yearly_days'],
                'waiting_period_months' => $validated['waiting_period_months'],
                'max_days_per_request' => $validated['max_days_per_request'] ?? null,
                'approval_levels' => $validated['approval_levels'],
                'is_active' => $validated['is_active'] ?? true,
            ]
        );

        return back()->with('success', 'Kebijakan cuti berhasil disimpan.');
    }

    /**
     * Update existing leave policy.
     */
    public function update(Request $request, LeavePolicy $policy): RedirectResponse
    {
        $validated = $request->validate([
            'policy_type' => ['required', Rule::in(['annual', 'prorated', 'monthly_accrual', 'anniversary'])],
            'yearly_days' => ['required', 'integer', 'min:1', 'max:365'],
            'waiting_period_months' => ['required', 'integer', 'min:0', 'max:120'],
            'max_days_per_request' => ['nullable', 'integer', 'min:1', 'max:365'],
            'approval_levels' => ['required', 'integer', Rule::in([1, 2])],
            'is_active' => ['boolean'],
        ]);

        $policy->update([
            'policy_type' => $validated['policy_type'],
            'yearly_days' => $validated['yearly_days'],
            'waiting_period_months' => $validated['waiting_period_months'],
            'max_days_per_request' => $validated['max_days_per_request'] ?? null,
            'approval_levels' => $validated['approval_levels'],
            'is_active' => $validated['is_active'] ?? $policy->is_active,
        ]);

        return back()->with('success', 'Kebijakan cuti berhasil diperbarui.');
    }
}
