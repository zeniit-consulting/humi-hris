<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\OvertimeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OvertimeController extends Controller
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

        $paginator = OvertimeRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,email,phone'])
            ->when(isset($validated['employee_id']), fn ($query) => $query->where('employee_id', $validated['employee_id']))
            ->when(($validated['employee_code'] ?? '') !== '', function ($query) use ($validated): void {
                $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('employee_code', $validated['employee_code']));
            })
            ->when(($validated['status'] ?? '') !== '', fn ($query) => $query->where('status', $validated['status']))
            ->when(isset($validated['date_from']), fn ($query) => $query->whereDate('work_date', '>=', $validated['date_from']))
            ->when(isset($validated['date_to']), fn ($query) => $query->whereDate('work_date', '<=', $validated['date_to']))
            ->when(isset($validated['updated_since']), fn ($query) => $query->where('updated_at', '>=', $validated['updated_since']))
            ->orderByDesc('work_date')
            ->orderByDesc('id')
            ->paginate((int) ($validated['per_page'] ?? 25))
            ->withQueryString();

        return $this->paginated($paginator, fn (OvertimeRequest $overtime) => [
            'id' => $overtime->id,
            'employee' => $overtime->employee ? $this->employeeSummary($overtime->employee) : null,
            'work_date' => $overtime->work_date?->format('Y-m-d'),
            'start_time' => $overtime->start_time,
            'end_time' => $overtime->end_time,
            'break_minutes' => $overtime->break_minutes,
            'total_hours' => (float) $overtime->total_hours,
            'reason' => $overtime->reason,
            'status' => $overtime->status,
            'approved_at' => $overtime->approved_at?->toISOString(),
            'notes' => $overtime->notes,
            'updated_at' => $overtime->updated_at?->toISOString(),
        ], 'Daftar lembur berhasil diambil.');
    }
}
