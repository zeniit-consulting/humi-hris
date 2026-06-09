<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveController extends Controller
{
    use InteractsWithThirdPartyApi;

    public function index(Request $request): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'employee_code' => ['nullable', 'string', 'max:50'],
            'leave_type' => ['nullable', 'string', 'max:30'],
            'status' => ['nullable', 'string', 'max:30'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'updated_since' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $paginator = LeaveRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,email,phone'])
            ->when(isset($validated['employee_id']), fn ($query) => $query->where('employee_id', $validated['employee_id']))
            ->when(($validated['employee_code'] ?? '') !== '', function ($query) use ($validated): void {
                $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('employee_code', $validated['employee_code']));
            })
            ->when(($validated['leave_type'] ?? '') !== '', fn ($query) => $query->where('leave_type', $validated['leave_type']))
            ->when(($validated['status'] ?? '') !== '', fn ($query) => $query->where('status', $validated['status']))
            ->when(isset($validated['date_from']), fn ($query) => $query->whereDate('start_date', '>=', $validated['date_from']))
            ->when(isset($validated['date_to']), fn ($query) => $query->whereDate('start_date', '<=', $validated['date_to']))
            ->when(isset($validated['updated_since']), fn ($query) => $query->where('updated_at', '>=', $validated['updated_since']))
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->paginate((int) ($validated['per_page'] ?? 25))
            ->withQueryString();

        return $this->paginated($paginator, fn (LeaveRequest $leave) => [
            'id' => $leave->id,
            'employee' => $leave->employee ? $this->employeeSummary($leave->employee) : null,
            'leave_type' => $leave->leave_type,
            'start_date' => $leave->start_date?->format('Y-m-d'),
            'end_date' => $leave->end_date?->format('Y-m-d'),
            'total_days' => (float) $leave->total_days,
            'reason' => $leave->reason,
            'status' => $leave->status,
            'approved_at' => $leave->approved_at?->toISOString(),
            'rejection_reason' => $leave->rejection_reason,
            'updated_at' => $leave->updated_at?->toISOString(),
        ], 'Daftar cuti berhasil diambil.');
    }
}
