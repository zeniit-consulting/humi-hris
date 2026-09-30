<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AttendanceSettingUpdateRequest;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Services\AttendanceStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $setting = $this->settingFor($request);

        $cutoffDay = (string) ($setting->payroll_cutoff_day ?? $setting->attendance_revision_cutoff_day ?? 'end_of_month');

        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('user_id', $request->user()->accountOwnerId())
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name'])
            ->map(fn ($emp) => [
                'id' => $emp->id,
                'label' => trim("{$emp->employee_code} - {$emp->first_name} {$emp->last_name}"),
            ]);

        return Inertia::render('settings/attendance', [
            'employees' => $employees,
            'settings' => [
                'missing_clock_out_request_days' => $setting->missing_clock_out_request_days ?? 2,
                'require_face_recognition' => (bool) ($setting->require_face_recognition ?? false),
                'backup_attendance_enabled' => (bool) ($setting->backup_attendance_enabled ?? false),
                'attendance_revision_cutoff_day' => $cutoffDay,
                'payroll_cutoff_day' => $cutoffDay,
                'late_penalty_enabled' => (bool) ($setting->late_penalty_enabled ?? false),
                'late_tolerance_minutes' => (int) ($setting->late_tolerance_minutes ?? 15),
                'late_penalty_type' => $setting->late_penalty_type ?? 'tiered',
                'late_penalty_tiers' => $setting->late_penalty_tiers ?? [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0, 'description' => 'Toleransi'],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000, 'description' => 'Terlambat 16-30 menit'],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000, 'description' => 'Terlambat 31-60 menit'],
                ],
                'late_base_penalty_minutes' => (int) ($setting->late_base_penalty_minutes ?? 15),
                'late_base_penalty_amount' => (float) ($setting->late_base_penalty_amount ?? 0),
                'late_incremental_penalty_amount' => (float) ($setting->late_incremental_penalty_amount ?? 0),
                'late_incremental_unit_minutes' => (int) ($setting->late_incremental_unit_minutes ?? 1),
                'late_half_day_enabled' => (bool) ($setting->late_half_day_enabled ?? false),
                'late_half_day_cutoff_minutes' => (int) ($setting->late_half_day_cutoff_minutes ?? 60),
                'late_half_day_penalty_amount' => (float) ($setting->late_half_day_penalty_amount ?? 0),
                'late_half_day_penalty_type' => $setting->late_half_day_penalty_type ?? 'prorate_half_day',
                'late_half_day_deduct_leave' => (bool) ($setting->late_half_day_deduct_leave ?? false),
                'unrecorded_cutoff_penalty_enabled' => (bool) ($setting->unrecorded_cutoff_penalty_enabled ?? false),
                'active_working_days' => (int) ($setting->active_working_days ?? 22),
            ],
        ]);
    }

    public function update(AttendanceSettingUpdateRequest $request, AttendanceStatusService $statusService): RedirectResponse
    {
        $validated = $request->validated();
        if (isset($validated['attendance_revision_cutoff_day'])) {
            $validated['payroll_cutoff_day'] = $validated['attendance_revision_cutoff_day'];
        }

        if ($request->has('backup_attendance_enabled')) {
            $validated['backup_attendance_enabled'] = $request->boolean('backup_attendance_enabled');
        }

        if (isset($validated['late_penalty_tiers']) && is_array($validated['late_penalty_tiers'])) {
            $cleanedTiers = [];
            foreach ($validated['late_penalty_tiers'] as $tier) {
                if (! isset($tier['from_minute']) || $tier['from_minute'] === '') {
                    continue;
                }
                $from = (int) $tier['from_minute'];
                $to = isset($tier['to_minute']) && $tier['to_minute'] !== '' && $tier['to_minute'] !== null
                    ? (int) $tier['to_minute']
                    : null;
                $amount = isset($tier['penalty_amount']) ? (float) $tier['penalty_amount'] : 0.0;
                $desc = isset($tier['description']) ? trim((string) $tier['description']) : null;

                $cleanedTiers[] = [
                    'from_minute' => $from,
                    'to_minute' => $to,
                    'penalty_amount' => $amount,
                    'description' => $desc,
                ];
            }

            usort($cleanedTiers, fn ($a, $b) => $a['from_minute'] <=> $b['from_minute']);
            $validated['late_penalty_tiers'] = $cleanedTiers;
        }

        $ownerId = $request->user()->accountOwnerId();
        $this->settingFor($request)->update($validated);

        if (isset($validated['late_tolerance_minutes'])) {
            \App\Models\WorkShift::query()
                ->where('user_id', $ownerId)
                ->update(['late_tolerance_minutes' => (int) $validated['late_tolerance_minutes']]);
        }

        // Auto-sync lateness for existing attendances of current month
        $statusService->syncLateness(
            $ownerId,
            now()->startOfMonth()->toDateString(),
            now()->endOfMonth()->toDateString()
        );

        return to_route('settings.attendance.edit')
            ->with('success', 'Pengaturan absensi berhasil diperbarui.');
    }

    public function syncLateness(Request $request, AttendanceStatusService $statusService): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'date' => ['nullable', 'date'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'all' => ['nullable', 'boolean'],
        ]);

        $startDate = $validated['start_date'] ?? $validated['date'] ?? null;
        $endDate = $validated['end_date'] ?? $validated['date'] ?? $startDate;

        if (! empty($validated['all'])) {
            $startDate = null;
            $endDate = null;
        }

        $employeeId = ! empty($validated['employee_id']) ? (int) $validated['employee_id'] : null;

        $result = $statusService->syncLateness($ownerId, $startDate, $endDate, $employeeId);

        $rangeInfo = $startDate && $endDate
            ? ($startDate === $endDate ? "tanggal {$startDate}" : "rentang {$startDate} s/d {$endDate}")
            : ($startDate ? "tanggal {$startDate}" : 'seluruh data presensi');

        $detailParts = ["{$result['total']} data diperiksa", "{$result['updated']} diperbarui", "{$result['late']} terlambat", "{$result['on_time']} tepat waktu"];
        if ($result['leave_deducted'] > 0) {
            $detailParts[] = "{$result['leave_deducted']} saldo cuti dipotong (setengah hari)";
        }

        return to_route('settings.attendance.edit')
            ->with('success', "Sinkronisasi keterlambatan selesai ({$rangeInfo}): ".implode(', ', $detailParts).'.');
    }

    private function settingFor(Request $request): CompanySetting
    {
        return CompanySetting::query()->firstOrCreate(
            ['user_id' => $request->user()->accountOwnerId()],
            ['name' => 'Perusahaan'],
        );
    }
}
