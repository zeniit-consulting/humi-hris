<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\ReimbursementRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReimbursementController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(ReimbursementRequest::STATUSES)],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);
        $filters = ['status' => $validated['status'] ?? 'pending', 'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : ''];

        $requests = ReimbursementRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,division_id,position_id', 'employee.division:id,name', 'employee.position:id,name', 'approver:id,name', 'processor:id,name'])
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'processing' THEN 2 WHEN 'paid' THEN 3 ELSE 4 END")
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ReimbursementRequest $row): array => $this->payload($row));

        $stats = ReimbursementRequest::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return Inertia::render('hris/reimbursements/index', [
            'requests' => $requests,
            'filters' => $filters,
            'statusOptions' => ReimbursementRequest::STATUSES,
            'employees' => Employee::query()->where('user_id', $ownerId)->where('is_active', true)->orderBy('first_name')->orderBy('last_name')->get(['id', 'employee_code', 'first_name', 'last_name'])->map(fn (Employee $employee) => ['id' => $employee->id, 'label' => $employee->employee_code.' - '.$employee->full_name])->values(),
            'stats' => collect(ReimbursementRequest::STATUSES)->mapWithKeys(fn (string $status) => [$status => (int) ($stats[$status] ?? 0)]),
        ]);
    }

    public function approve(Request $request, ReimbursementRequest $reimbursement): RedirectResponse
    {
        $this->authorizeOwner($request, $reimbursement);
        abort_if($reimbursement->status !== 'pending', 422, 'Pengajuan sudah diproses.');
        $reimbursement->update(['status' => 'approved', 'approved_by' => $request->user()->id, 'approved_at' => now(), 'rejection_reason' => null]);

        return back()->with('success', 'Reimbursement disetujui dan siap diproses Finance.');
    }

    public function reject(Request $request, ReimbursementRequest $reimbursement): RedirectResponse
    {
        $this->authorizeOwner($request, $reimbursement);
        abort_if($reimbursement->status !== 'pending', 422, 'Pengajuan sudah diproses.');
        $validated = $request->validate(['rejection_reason' => ['required', 'string', 'max:255']]);
        $reimbursement->update(['status' => 'rejected', 'approved_by' => $request->user()->id, 'approved_at' => now(), 'rejection_reason' => $validated['rejection_reason']]);

        return back()->with('success', 'Reimbursement ditolak.');
    }

    public function updateStatus(Request $request, ReimbursementRequest $reimbursement): RedirectResponse
    {
        $this->authorizeOwner($request, $reimbursement);
        $validated = $request->validate(['status' => ['required', Rule::in(['processing', 'paid'])], 'finance_notes' => ['nullable', 'string', 'max:2000']]);
        abort_unless($reimbursement->status === 'approved' || ($reimbursement->status === 'processing' && $validated['status'] === 'paid'), 422, 'Status reimbursement belum siap diperbarui.');
        $reimbursement->update(['status' => $validated['status'], 'processed_by' => $request->user()->id, 'processed_at' => now(), 'finance_notes' => $validated['finance_notes'] ?? $reimbursement->finance_notes]);

        return back()->with('success', $validated['status'] === 'paid' ? 'Reimbursement ditandai sudah dibayar.' : 'Reimbursement diteruskan ke Finance.');
    }

    private function authorizeOwner(Request $request, ReimbursementRequest $reimbursement): void
    {
        abort_unless((int) $reimbursement->user_id === $request->user()->accountOwnerId(), 404);
    }

    private function payload(ReimbursementRequest $row): array
    {
        return [
            'id' => $row->id,
            'employee_id' => $row->employee_id,
            'employee_label' => $row->employee ? $row->employee->employee_code.' - '.$row->employee->full_name : '-',
            'division_name' => $row->employee?->division?->name,
            'title' => $row->title,
            'description' => $row->description,
            'amount' => (string) $row->amount,
            'status' => $row->status,
            'receipt_url' => $row->receipt_path ? Storage::disk('public')->url($row->receipt_path) : null,
            'receipt_name' => $row->receipt_original_name,
            'approved_by' => $row->approver?->name,
            'approved_at' => $row->approved_at?->toIso8601String(),
            'rejection_reason' => $row->rejection_reason,
            'processed_by' => $row->processor?->name,
            'processed_at' => $row->processed_at?->toIso8601String(),
            'finance_notes' => $row->finance_notes,
            'created_at' => $row->created_at?->toIso8601String(),
        ];
    }
}
