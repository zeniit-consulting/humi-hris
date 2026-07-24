<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\StoreOvertimeRequest;
use App\Http\Requests\Hris\UpdateOvertimeRequest;
use App\Models\Employee;
use App\Models\OvertimeRequest;
use App\Services\ApprovalWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class OvertimeController extends Controller
{
    /**
     * Display overtime management page.
     */
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'date' => ['nullable', 'date'],
        ]);

        $activeDate = Carbon::parse($validated['date'] ?? today())->toDateString();

        $filters = [
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'date' => $activeDate,
        ];

        $overtimes = OvertimeRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->whereDate('work_date', $filters['date'])
            ->orderByDesc('work_date')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (OvertimeRequest $overtime) => [
                'id' => $overtime->id,
                'employee_id' => $overtime->employee_id,
                'employee_label' => $overtime->employee
                    ? $overtime->employee->employee_code.' - '.$overtime->employee->full_name
                    : '-',
                'work_date' => $overtime->work_date->format('Y-m-d'),
                'start_time' => $this->normalizeTime($overtime->start_time),
                'end_time' => $this->normalizeTime($overtime->end_time),
                'break_minutes' => $overtime->break_minutes,
                'total_hours' => $overtime->total_hours,
                'reason' => $overtime->reason,
                'status' => $overtime->status,
                'notes' => $overtime->notes,
            ]);

        $employees = Employee::query()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        return Inertia::render('hris/overtimes/index', [
            'overtimes' => $overtimes,
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]),
            'filters' => $filters,
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => [
                'pending' => OvertimeRequest::query()->where('status', 'pending')->count(),
                'approved' => OvertimeRequest::query()->where('status', 'approved')->count(),
            ],
        ]);
    }

    public function approvals(Request $request): Response
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

        $overtimes = OvertimeRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,division_id,position_id', 'employee.division:id,name', 'employee.position:id,name', 'approver:id,name'])
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->when($filters['date'] !== '', fn ($query) => $query->whereDate('work_date', $filters['date']))
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('work_date')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (OvertimeRequest $overtime) => [
                'id' => $overtime->id,
                'employee_id' => $overtime->employee_id,
                'employee_label' => $overtime->employee ? $overtime->employee->employee_code.' - '.$overtime->employee->full_name : '-',
                'division_name' => $overtime->employee?->division?->name,
                'position_name' => $overtime->employee?->position?->name,
                'work_date' => $overtime->work_date->format('Y-m-d'),
                'start_time' => $this->normalizeTime($overtime->start_time),
                'end_time' => $this->normalizeTime($overtime->end_time),
                'break_minutes' => $overtime->break_minutes,
                'total_hours' => $overtime->total_hours,
                'reason' => $overtime->reason,
                'status' => $overtime->status,
                'approved_by' => $overtime->approver?->name,
                'approved_at' => $overtime->approved_at?->toIso8601String(),
                'notes' => $overtime->notes,
                'created_at' => $overtime->created_at?->toIso8601String(),
            ]);

        $employees = Employee::query()
            ->where('user_id', $ownerId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        $stats = OvertimeRequest::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('hris/overtime-approvals/index', [
            'overtimes' => $overtimes,
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]),
            'filters' => $filters,
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => [
                'pending' => (int) ($stats['pending'] ?? 0),
                'approved' => (int) ($stats['approved'] ?? 0),
                'rejected' => (int) ($stats['rejected'] ?? 0),
            ],
        ]);
    }

    public function approve(Request $request, OvertimeRequest $overtime): RedirectResponse
    {
        abort_unless((int) $overtime->user_id === $request->user()->accountOwnerId(), 404);

        if (app(ApprovalWorkflowService::class)->approve($overtime, $request->user()) === ApprovalWorkflowService::ADVANCED) return back()->with('success', 'Approval tahap 1 berhasil. Menunggu tahap 2.');

        $overtime->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'notes' => null,
        ]);

        $overtime->loadMissing('employee');
        app(\App\Services\WhatsAppNotificationService::class)->notifyOvertimeStatus($overtime);

        return back()->with('success', 'Pengajuan lembur disetujui.');
    }

    public function reject(Request $request, OvertimeRequest $overtime): RedirectResponse
    {
        abort_unless((int) $overtime->user_id === $request->user()->accountOwnerId(), 404);

        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:255'],
        ]);

        app(ApprovalWorkflowService::class)->reject($overtime, $request->user(), $validated['notes']);

        $overtime->loadMissing('employee');
        app(\App\Services\WhatsAppNotificationService::class)->notifyOvertimeStatus($overtime);

        return back()->with('success', 'Pengajuan lembur ditolak.');
    }

    /**
     * Store overtime request.
     */
    public function store(StoreOvertimeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $overtime = OvertimeRequest::create([
            ...$validated,
            'break_minutes' => (int) ($validated['break_minutes'] ?? 0),
            'total_hours' => $this->calculateTotalHours(
                $validated['start_time'],
                $validated['end_time'],
                (int) ($validated['break_minutes'] ?? 0)
            ),
            'approved_at' => $validated['status'] === 'approved' ? now() : null,
            'approved_by' => $validated['status'] === 'approved' ? $request->user()?->id : null,
        ]);

        // Send WhatsApp notification if status is approved or rejected
        if (in_array($validated['status'], ['approved', 'rejected'], true)) {
            $overtime->loadMissing('employee');
            app(\App\Services\WhatsAppNotificationService::class)->notifyOvertimeStatus($overtime);
        }

        return back();
    }

    /**
     * Update overtime request.
     */
    public function update(UpdateOvertimeRequest $request, OvertimeRequest $overtime): RedirectResponse
    {
        $validated = $request->validated();
        $oldStatus = $overtime->status; // capture before update

        $overtime->update([
            ...$validated,
            'break_minutes' => (int) ($validated['break_minutes'] ?? 0),
            'total_hours' => $this->calculateTotalHours(
                $validated['start_time'],
                $validated['end_time'],
                (int) ($validated['break_minutes'] ?? 0)
            ),
            'approved_at' => $validated['status'] === 'approved' ? ($overtime->approved_at ?? now()) : null,
            'approved_by' => $validated['status'] === 'approved' ? ($overtime->approved_by ?? $request->user()?->id) : null,
        ]);

        // Send WhatsApp notification if status changed to approved or rejected
        if ($oldStatus !== $validated['status'] && in_array($validated['status'], ['approved', 'rejected'], true)) {
            $overtime->loadMissing('employee');
            app(\App\Services\WhatsAppNotificationService::class)->notifyOvertimeStatus($overtime);
        }

        return back();
    }

    /**
     * Delete overtime request.
     */
    public function destroy(OvertimeRequest $overtime): RedirectResponse
    {
        $overtime->delete();

        return back();
    }

    /**
     * Export overtime requests to XLS-compatible file.
     */
    public function export(Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'date' => ['nullable', 'date'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
            'date' => Carbon::parse($validated['date'] ?? today())->toDateString(),
        ];

        $rows = OvertimeRequest::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->whereDate('work_date', $filters['date'])
            ->orderByDesc('work_date')
            ->get();

        $fileName = 'overtimes_'.now()->format('Ymd_His').'.xls';

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'wb');

            fputcsv($out, [
                'Tanggal',
                'Kode Pegawai',
                'Nama Pegawai',
                'Jam Mulai',
                'Jam Selesai',
                'Break (menit)',
                'Total Jam',
                'Status',
                'Alasan',
            ], "\t");

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->work_date?->format('Y-m-d'),
                    $row->employee?->employee_code,
                    $row->employee?->full_name,
                    $row->start_time,
                    $row->end_time,
                    $row->break_minutes,
                    $row->total_hours,
                    $row->status,
                    $row->reason,
                ], "\t");
            }

            fclose($out);
        }, $fileName, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    /**
     * Calculate overtime total hours.
     */
    private function calculateTotalHours(string $startTime, string $endTime, int $breakMinutes): float
    {
        $start = Carbon::createFromFormat('H:i', $startTime);
        $end = Carbon::createFromFormat('H:i', $endTime);

        if ($end->lessThanOrEqualTo($start)) {
            throw ValidationException::withMessages([
                'end_time' => 'Jam selesai harus lebih besar dari jam mulai.',
            ]);
        }

        $minutes = $start->diffInMinutes($end) - $breakMinutes;

        if ($minutes < 0) {
            throw ValidationException::withMessages([
                'break_minutes' => 'Break melebihi durasi lembur.',
            ]);
        }

        return round($minutes / 60, 2);
    }

    /**
     * Normalize DB time string to HH:mm format.
     */
    private function normalizeTime(?string $time): ?string
    {
        if ($time === null || $time === '') {
            return null;
        }

        return Carbon::parse($time)->format('H:i');
    }
}
