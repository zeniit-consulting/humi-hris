<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeReprimand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeReprimandController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(EmployeeReprimand::STATUSES)],
            'level' => ['nullable', Rule::in(EmployeeReprimand::LEVELS)],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);

        $filters = [
            'status' => $validated['status'] ?? 'active',
            'level' => $validated['level'] ?? '',
            'employee_id' => isset($validated['employee_id']) ? (string) $validated['employee_id'] : '',
        ];

        $reprimands = EmployeeReprimand::query()
            ->with('employee:id,employee_code,first_name,last_name')
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['level'] !== '', fn ($query) => $query->where('level', $filters['level']))
            ->when($filters['employee_id'] !== '', fn ($query) => $query->where('employee_id', $filters['employee_id']))
            ->orderByDesc('issued_date')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (EmployeeReprimand $reprimand): array => $this->payload($reprimand));

        $stats = EmployeeReprimand::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return Inertia::render('hris/reprimands/index', [
            'reprimands' => $reprimands,
            'employeeOptions' => $this->employeeOptions($ownerId),
            'filters' => $filters,
            'levelOptions' => EmployeeReprimand::LEVELS,
            'statusOptions' => EmployeeReprimand::STATUSES,
            'stats' => [
                'active' => (int) ($stats['active']->total ?? 0),
                'resolved' => (int) ($stats['resolved']->total ?? 0),
                'void' => (int) ($stats['void']->total ?? 0),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $this->validated($request, $ownerId);

        $reprimand = EmployeeReprimand::query()->create([
            ...$validated,
            'user_id' => $ownerId,
            'status' => $validated['status'] ?? 'active',
            'reprimand_number' => $this->nextReprimandNumber($ownerId, $validated['issued_date']),
        ]);
        $this->storeAttachment($request->file('attachment'), $reprimand);

        return to_route('hris.reprimands.index')->with('success', 'Teguran berhasil dibuat.');
    }

    public function update(Request $request, EmployeeReprimand $reprimand): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $reprimand->user_id === $ownerId, 404);

        $reprimand->update($this->validated($request, $ownerId));
        $this->storeAttachment($request->file('attachment'), $reprimand);

        return to_route('hris.reprimands.index')->with('success', 'Teguran berhasil diperbarui.');
    }

    public function destroy(Request $request, EmployeeReprimand $reprimand): RedirectResponse
    {
        abort_unless((int) $reprimand->user_id === $request->user()->accountOwnerId(), 404);

        if ($reprimand->attachment_path) {
            Storage::disk('public')->delete($reprimand->attachment_path);
        }
        $reprimand->delete();

        return to_route('hris.reprimands.index')->with('success', 'Teguran berhasil dihapus.');
    }

    public function tracking(Request $request, Employee $employee): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $employee->user_id === $ownerId, 404);
        $reprimands = EmployeeReprimand::query()->where('user_id', $ownerId)->where('employee_id', $employee->id)
            ->orderByDesc('issued_date')->orderByDesc('id')->get()
            ->map(fn (EmployeeReprimand $reprimand): array => $this->payload($reprimand))->values();
        return Inertia::render('hris/reprimands/tracking', [
            'employee' => ['id' => $employee->id, 'label' => $employee->employee_code.' - '.$employee->full_name],
            'reprimands' => $reprimands,
        ]);
    }

    private function validated(Request $request, int $ownerId): array
    {
        return $request->validate([
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'level' => ['required', Rule::in(EmployeeReprimand::LEVELS)],
            'issued_date' => ['required', 'date'],
            'incident_date' => ['nullable', 'date', 'before_or_equal:issued_date'],
            'validity_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'subject' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:3000'],
            'action_plan' => ['nullable', 'string', 'max:3000'],
            'status' => ['nullable', Rule::in(EmployeeReprimand::STATUSES)],
            'resolution_notes' => ['nullable', 'string', 'max:3000'],
            'attachment' => ['nullable', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx'],
        ]);
    }

    private function employeeOptions(int $ownerId): array
    {
        return Employee::query()
            ->select(['id', 'employee_code', 'first_name', 'last_name'])
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ])
            ->all();
    }

    private function payload(EmployeeReprimand $reprimand): array
    {
        return [
            'id' => $reprimand->id,
            'employee_id' => $reprimand->employee_id,
            'employee_label' => $reprimand->employee
                ? $reprimand->employee->employee_code.' - '.$reprimand->employee->full_name
                : '-',
            'reprimand_number' => $reprimand->reprimand_number,
            'level' => $reprimand->level,
            'issued_date' => $reprimand->issued_date?->format('Y-m-d'),
            'incident_date' => $reprimand->incident_date?->format('Y-m-d'),
            'validity_months' => $reprimand->validity_months,
            'expires_at' => $reprimand->validity_months && $reprimand->issued_date ? $reprimand->issued_date->copy()->addMonths($reprimand->validity_months)->format('Y-m-d') : null,
            'subject' => $reprimand->subject,
            'description' => $reprimand->description,
            'action_plan' => $reprimand->action_plan,
            'status' => $reprimand->status,
            'resolution_notes' => $reprimand->resolution_notes,
            'attachment_url' => $reprimand->attachment_path ? Storage::disk('public')->url($reprimand->attachment_path) : null,
            'attachment_name' => $reprimand->attachment_name,
        ];
    }

    private function storeAttachment(?UploadedFile $file, EmployeeReprimand $reprimand): void
    {
        if (! $file) return;
        if ($reprimand->attachment_path) Storage::disk('public')->delete($reprimand->attachment_path);
        $path = $file->store('reprimands', 'public');
        $reprimand->update(['attachment_path' => $path, 'attachment_name' => $file->getClientOriginalName()]);
    }

    private function nextReprimandNumber(int $ownerId, string $issuedDate): string
    {
        $period = date('Ym', strtotime($issuedDate));
        $count = EmployeeReprimand::query()
            ->where('user_id', $ownerId)
            ->where('reprimand_number', 'like', "SP-{$period}-%")
            ->count();

        return 'SP-'.$period.'-'.str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
    }
}
