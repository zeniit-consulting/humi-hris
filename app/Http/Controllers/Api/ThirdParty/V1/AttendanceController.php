<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\EmployeeAttendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    use InteractsWithThirdPartyApi;

    public function index(Request $request): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'employee_code' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:30'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'updated_since' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $paginator = EmployeeAttendance::query()
            ->with(['employee:id,employee_code,first_name,last_name,email,phone'])
            ->when(isset($validated['employee_id']), fn ($query) => $query->where('employee_id', $validated['employee_id']))
            ->when(($validated['employee_code'] ?? '') !== '', function ($query) use ($validated): void {
                $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('employee_code', $validated['employee_code']));
            })
            ->when(($validated['status'] ?? '') !== '', fn ($query) => $query->where('status', $validated['status']))
            ->when(isset($validated['date_from']), fn ($query) => $query->whereDate('attendance_date', '>=', $validated['date_from']))
            ->when(isset($validated['date_to']), fn ($query) => $query->whereDate('attendance_date', '<=', $validated['date_to']))
            ->when(isset($validated['updated_since']), fn ($query) => $query->where('updated_at', '>=', $validated['updated_since']))
            ->orderByDesc('attendance_date')
            ->orderByDesc('id')
            ->paginate((int) ($validated['per_page'] ?? 25))
            ->withQueryString();

        return $this->paginated($paginator, fn (EmployeeAttendance $attendance) => [
            'id' => $attendance->id,
            'employee' => $attendance->employee ? $this->employeeSummary($attendance->employee) : null,
            'attendance_date' => $attendance->attendance_date?->format('Y-m-d'),
            'timezone' => $attendance->timezone,
            'status' => $attendance->status,
            'check_in_at' => $attendance->check_in_at?->toISOString(),
            'check_out_at' => $attendance->check_out_at?->toISOString(),
            'notes' => $attendance->notes,
            'updated_at' => $attendance->updated_at?->toISOString(),
        ], 'Daftar absensi berhasil diambil.');
    }
}
