<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeReprimand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        EmployeeReprimand::query()->create([
            ...$validated,
            'user_id' => $ownerId,
            'reprimand_number' => $this->nextReprimandNumber($ownerId, $validated['issued_date']),
        ]);

        return to_route('hris.reprimands.index')->with('success', 'Reprimand berhasil dibuat.');
    }

    public function update(Request $request, EmployeeReprimand $reprimand): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $reprimand->user_id === $ownerId, 404);

        $reprimand->update($this->validated($request, $ownerId));

        return to_route('hris.reprimands.index')->with('success', 'Reprimand berhasil diperbarui.');
    }

    public function destroy(Request $request, EmployeeReprimand $reprimand): RedirectResponse
    {
        abort_unless((int) $reprimand->user_id === $request->user()->accountOwnerId(), 404);

        $reprimand->delete();

        return to_route('hris.reprimands.index')->with('success', 'Reprimand berhasil dihapus.');
    }

    private function validated(Request $request, int $ownerId): array
    {
        return $request->validate([
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'level' => ['required', Rule::in(EmployeeReprimand::LEVELS)],
            'issued_date' => ['required', 'date'],
            'incident_date' => ['nullable', 'date', 'before_or_equal:issued_date'],
            'subject' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:3000'],
            'action_plan' => ['nullable', 'string', 'max:3000'],
            'status' => ['required', Rule::in(EmployeeReprimand::STATUSES)],
            'resolution_notes' => ['nullable', 'string', 'max:3000'],
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
            'subject' => $reprimand->subject,
            'description' => $reprimand->description,
            'action_plan' => $reprimand->action_plan,
            'status' => $reprimand->status,
            'resolution_notes' => $reprimand->resolution_notes,
        ];
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
