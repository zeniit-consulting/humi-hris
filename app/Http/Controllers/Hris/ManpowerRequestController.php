<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\ManpowerRequest;
use App\Models\Position;
use App\Models\SubCompany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ManpowerRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'in_progress', 'fulfilled', 'cancelled'])],
            'sub_company_id' => ['nullable', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
        ]);

        $filters = [
            'status' => $validated['status'] ?? 'open',
            'sub_company_id' => isset($validated['sub_company_id']) ? (string) $validated['sub_company_id'] : '',
        ];

        $requests = ManpowerRequest::query()
            ->with(['subCompany:id,code,name', 'position:id,name'])
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['sub_company_id'] !== '', fn ($query) => $query->where('sub_company_id', $filters['sub_company_id']))
            ->orderByRaw("CASE WHEN status = 'open' THEN 0 WHEN status = 'in_progress' THEN 1 ELSE 2 END")
            ->orderByRaw("CASE WHEN priority = 'urgent' THEN 0 WHEN priority = 'high' THEN 1 ELSE 2 END")
            ->orderBy('needed_by')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (ManpowerRequest $row): array => $this->payload($row));

        $stats = ManpowerRequest::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total, SUM(requested_headcount - fulfilled_headcount) as remaining')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return Inertia::render('hris/manpower-requests/index', [
            'requests' => $requests,
            'subCompanies' => $this->subCompanies($ownerId),
            'positions' => Position::query()
                ->where('user_id', $ownerId)
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => $filters,
            'statusOptions' => ['open', 'in_progress', 'fulfilled', 'cancelled'],
            'priorityOptions' => ['normal', 'high', 'urgent'],
            'stats' => [
                'open' => (int) ($stats['open']->total ?? 0),
                'in_progress' => (int) ($stats['in_progress']->total ?? 0),
                'remaining' => (int) (($stats['open']->remaining ?? 0) + ($stats['in_progress']->remaining ?? 0)),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $this->validated($request, $ownerId);

        ManpowerRequest::query()->create([
            ...$validated,
            'user_id' => $ownerId,
            'request_number' => $this->nextRequestNumber($ownerId),
            'fulfilled_headcount' => (int) ($validated['fulfilled_headcount'] ?? 0),
        ]);

        return back()->with('success', 'Manpower request berhasil dibuat.');
    }

    public function update(Request $request, ManpowerRequest $manpowerRequest): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $manpowerRequest->user_id === $ownerId, 404);

        $manpowerRequest->update($this->validated($request, $ownerId));

        return back()->with('success', 'Manpower request berhasil diperbarui.');
    }

    public function destroy(Request $request, ManpowerRequest $manpowerRequest): RedirectResponse
    {
        abort_unless((int) $manpowerRequest->user_id === $request->user()->accountOwnerId(), 404);
        $manpowerRequest->delete();

        return back()->with('success', 'Manpower request berhasil dihapus.');
    }

    private function validated(Request $request, int $ownerId): array
    {
        return $request->validate([
            'sub_company_id' => ['required', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'title' => ['required', 'string', 'max:150'],
            'requested_headcount' => ['required', 'integer', 'min:1', 'max:10000'],
            'fulfilled_headcount' => ['nullable', 'integer', 'min:0', 'lte:requested_headcount'],
            'needed_by' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['open', 'in_progress', 'fulfilled', 'cancelled'])],
            'priority' => ['required', Rule::in(['normal', 'high', 'urgent'])],
            'requirements' => ['nullable', 'string', 'max:3000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
    }

    private function subCompanies(int $ownerId): array
    {
        return SubCompany::query()
            ->where('user_id', $ownerId)
            ->orderBy('name')
            ->get(['id', 'code', 'name'])
            ->map(fn (SubCompany $company): array => [
                'id' => $company->id,
                'label' => $company->code.' - '.$company->name,
            ])
            ->all();
    }

    private function payload(ManpowerRequest $row): array
    {
        return [
            'id' => $row->id,
            'request_number' => $row->request_number,
            'sub_company_id' => $row->sub_company_id,
            'sub_company_label' => $row->subCompany ? $row->subCompany->code.' - '.$row->subCompany->name : '-',
            'position_id' => $row->position_id,
            'position_name' => $row->position?->name,
            'title' => $row->title,
            'requested_headcount' => $row->requested_headcount,
            'fulfilled_headcount' => $row->fulfilled_headcount,
            'needed_by' => $row->needed_by?->format('Y-m-d'),
            'status' => $row->status,
            'priority' => $row->priority,
            'requirements' => $row->requirements,
            'notes' => $row->notes,
        ];
    }

    private function nextRequestNumber(int $ownerId): string
    {
        return 'MPR-'.now()->format('Ym').'-'.str_pad(
            (string) (ManpowerRequest::query()->where('user_id', $ownerId)->whereYear('created_at', now()->year)->count() + 1),
            4,
            '0',
            STR_PAD_LEFT,
        );
    }
}
