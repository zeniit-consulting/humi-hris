<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\ShiftChangeRequest;
use App\Models\WorkShift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ShiftChangeApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'date' => ['nullable', 'date'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? 'pending',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'date' => $validated['date'] ?? '',
        ];

        $query = ShiftChangeRequest::query()
            ->with([
                'employee:id,employee_code,first_name,last_name,division_id,position_id',
                'employee.division:id,name',
                'employee.position:id,name',
                'currentShift:id,code,name,start_time,end_time,is_day_off',
                'requestedShift:id,code,name,start_time,end_time,is_day_off',
                'approver:id,name',
            ])
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($builder) => $builder->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($builder) => $builder->where('employee_id', $filters['employee_id']))
            ->when($filters['date'] !== '', fn ($builder) => $builder->whereDate('requested_date', $filters['date']))
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderBy('requested_date')
            ->orderByDesc('id');

        $requests = $query->paginate(15)->withQueryString();

        $stats = ShiftChangeRequest::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $employees = Employee::query()
            ->where('user_id', $ownerId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name'])
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]);

        return Inertia::render('hris/shift-change-requests/index', [
            'requests' => $requests->through(fn (ShiftChangeRequest $request) => $this->payload($request)),
            'employees' => $employees,
            'filters' => $filters,
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => [
                'pending' => (int) ($stats['pending'] ?? 0),
                'approved' => (int) ($stats['approved'] ?? 0),
                'rejected' => (int) ($stats['rejected'] ?? 0),
            ],
        ]);
    }

    public function approve(Request $request, ShiftChangeRequest $shiftChangeRequest): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $this->ensureOwnedRequest($shiftChangeRequest, $ownerId);

        if ($shiftChangeRequest->status !== 'pending') {
            return back()->with('error', 'Request perubahan jadwal sudah diproses.');
        }

        DB::transaction(function () use ($request, $shiftChangeRequest, $ownerId): void {
            /** @var WorkShift $shift */
            $shift = WorkShift::query()
                ->where('user_id', $ownerId)
                ->findOrFail($shiftChangeRequest->requested_shift_id);

            EmployeeSchedule::query()->updateOrCreate(
                [
                    'employee_id' => $shiftChangeRequest->employee_id,
                    'work_date' => $shiftChangeRequest->requested_date->toDateString(),
                ],
                [
                    'user_id' => $ownerId,
                    'shift_code' => $shift->code,
                    'start_time' => $shift->start_time,
                    'end_time' => $shift->end_time,
                    'is_day_off' => $shift->is_day_off,
                    'notes' => 'Disetujui dari request perubahan jadwal #'.$shiftChangeRequest->id,
                ],
            );

            $shiftChangeRequest->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);
        });

        return back()->with('success', 'Perubahan jadwal kerja disetujui dan jadwal karyawan diperbarui.');
    }

    public function reject(Request $request, ShiftChangeRequest $shiftChangeRequest): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $this->ensureOwnedRequest($shiftChangeRequest, $ownerId);

        if ($shiftChangeRequest->status !== 'pending') {
            return back()->with('error', 'Request perubahan jadwal sudah diproses.');
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:255'],
        ]);

        $shiftChangeRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Request perubahan jadwal kerja ditolak.');
    }

    private function ensureOwnedRequest(ShiftChangeRequest $shiftChangeRequest, int $ownerId): void
    {
        abort_unless((int) $shiftChangeRequest->user_id === $ownerId, 404);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(ShiftChangeRequest $request): array
    {
        return [
            'id' => $request->id,
            'employee_id' => $request->employee_id,
            'employee_label' => $request->employee
                ? $request->employee->employee_code.' - '.$request->employee->full_name
                : '-',
            'division_name' => $request->employee?->division?->name,
            'position_name' => $request->employee?->position?->name,
            'requested_date' => $request->requested_date?->format('Y-m-d'),
            'requested_date_label' => $request->requested_date
                ? Carbon::parse($request->requested_date)->translatedFormat('d M Y')
                : '-',
            'current_shift' => $this->shiftPayload($request->currentShift),
            'requested_shift' => $this->shiftPayload($request->requestedShift),
            'reason' => $request->reason,
            'status' => $request->status,
            'approved_by' => $request->approver?->name,
            'approved_at' => $request->approved_at?->toIso8601String(),
            'rejection_reason' => $request->rejection_reason,
            'created_at' => $request->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return null|array<string, mixed>
     */
    private function shiftPayload(?WorkShift $shift): ?array
    {
        if ($shift === null) {
            return null;
        }

        return [
            'id' => $shift->id,
            'code' => $shift->code,
            'name' => $shift->name,
            'start_time' => $this->normalizeTime($shift->start_time),
            'end_time' => $this->normalizeTime($shift->end_time),
            'is_day_off' => $shift->is_day_off,
        ];
    }

    private function normalizeTime(?string $time): ?string
    {
        if ($time === null || $time === '') {
            return null;
        }

        return Carbon::parse($time)->format('H:i');
    }
}
