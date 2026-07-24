<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\ApprovalSetting;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalSettingController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $settings = collect(ApprovalSetting::TYPES)->map(function (string $type) use ($ownerId): array {
            $setting = ApprovalSetting::query()->firstOrCreate(['user_id' => $ownerId, 'request_type' => $type]);
            return ['request_type' => $type, 'two_line_enabled' => $setting->two_line_enabled, 'first_approver_employee_id' => $setting->first_approver_employee_id, 'second_approver_employee_id' => $setting->second_approver_employee_id];
        });
        return Inertia::render('hris/approval-settings/index', [
            'settings' => $settings,
            'employees' => Employee::query()->where('user_id', $ownerId)->where('is_active', true)->with(['division:id,name', 'position:id,name,level'])->orderBy('first_name')->get()->map(fn (Employee $employee) => ['id' => $employee->id, 'label' => $employee->employee_code.' - '.$employee->full_name.' · '.($employee->position?->name ?? '-')]),
        ]);
    }
    public function update(Request $request, string $type): RedirectResponse
    {
        abort_unless(in_array($type, ApprovalSetting::TYPES, true), 404);
        $ownerId = $request->user()->accountOwnerId();
        $data = $request->validate([
            'two_line_enabled' => ['required', 'boolean'],
            'first_approver_employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)->where('is_active', true)],
            'second_approver_employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)->where('is_active', true)],
        ]);
        ApprovalSetting::query()->updateOrCreate(['user_id' => $ownerId, 'request_type' => $type], $data);
        return back()->with('success', 'Pengaturan approval diperbarui.');
    }
}
