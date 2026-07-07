<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\CompanyAsset;
use App\Models\CompanyAssetProcurementRequest;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompanyAssetProcurementRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(CompanyAssetProcurementRequest::STATUSES)],
            'priority' => ['nullable', Rule::in(CompanyAssetProcurementRequest::PRIORITIES)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? '',
            'priority' => $validated['priority'] ?? '',
            'search' => $validated['search'] ?? '',
        ];

        $requests = CompanyAssetProcurementRequest::query()
            ->with(['requestedByEmployee:id,employee_code,first_name,last_name', 'assets:id,procurement_request_id,asset_code,name'])
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['priority'] !== '', fn ($query) => $query->where('priority', $filters['priority']))
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('request_number', 'like', "%{$search}%")
                        ->orWhere('item_name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'ordered' THEN 2 WHEN 'received' THEN 3 ELSE 4 END")
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END")
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (CompanyAssetProcurementRequest $procurementRequest): array => $this->payload($procurementRequest));

        $summaryRows = CompanyAssetProcurementRequest::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('hris/assets/procurement-requests', [
            'requests' => $requests,
            'filters' => $filters,
            'employeeOptions' => Employee::query()
                ->where('user_id', $ownerId)
                ->where('is_active', true)
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'employee_code', 'first_name', 'last_name'])
                ->map(fn (Employee $employee) => [
                    'id' => $employee->id,
                    'label' => $employee->employee_code.' - '.$employee->full_name,
                ])
                ->values(),
            'statusOptions' => CompanyAssetProcurementRequest::STATUSES,
            'priorityOptions' => CompanyAssetProcurementRequest::PRIORITIES,
            'summary' => [
                'pending' => (int) ($summaryRows['pending'] ?? 0),
                'approved' => (int) ($summaryRows['approved'] ?? 0),
                'ordered' => (int) ($summaryRows['ordered'] ?? 0),
                'received' => (int) ($summaryRows['received'] ?? 0),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $this->validateRequestPayload($request, $ownerId);

        CompanyAssetProcurementRequest::query()->create([
            ...$validated,
            'user_id' => $ownerId,
            'request_number' => $this->nextRequestNumber($ownerId),
            'status' => 'pending',
        ]);

        return to_route('hris.assets.procurement-requests.index');
    }

    public function updateStatus(Request $request, CompanyAssetProcurementRequest $procurementRequest): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless($procurementRequest->user_id === $ownerId, 404);

        $validated = $request->validate([
            'status' => ['required', Rule::in(CompanyAssetProcurementRequest::STATUSES)],
            'actual_unit_price' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'purchase_date' => ['nullable', 'date'],
            'asset_code_prefix' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($procurementRequest, $validated, $ownerId): void {
            $status = $validated['status'];
            $timestamps = match ($status) {
                'approved' => ['approved_at' => now()],
                'ordered' => ['ordered_at' => now()],
                'received' => ['received_at' => now()],
                default => [],
            };

            $procurementRequest->update([
                'status' => $status,
                'actual_unit_price' => $validated['actual_unit_price'] ?? $procurementRequest->actual_unit_price,
                'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $procurementRequest->notes,
                ...$timestamps,
            ]);

            if ($status === 'received') {
                $this->createReceivedAssets($procurementRequest->refresh(), $validated, $ownerId);
            }
        });

        return to_route('hris.assets.procurement-requests.index');
    }

    private function validateRequestPayload(Request $request, int $ownerId): array
    {
        return $request->validate([
            'requested_by_employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'item_name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:80'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'estimated_unit_price' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'needed_by' => ['nullable', 'date'],
            'priority' => ['required', Rule::in(CompanyAssetProcurementRequest::PRIORITIES)],
            'reason' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
    }

    private function createReceivedAssets(CompanyAssetProcurementRequest $procurementRequest, array $validated, int $ownerId): void
    {
        if ($procurementRequest->assets()->exists()) {
            return;
        }

        $prefix = $this->normalizeAssetCodePrefix(
            $validated['asset_code_prefix'] ?? $procurementRequest->request_number,
        );
        $purchaseDate = $validated['purchase_date'] ?? now()->toDateString();
        $purchasePrice = $validated['actual_unit_price'] ?? $procurementRequest->actual_unit_price ?? $procurementRequest->estimated_unit_price ?? 0;

        for ($index = 1; $index <= $procurementRequest->quantity; $index++) {
            CompanyAsset::query()->create([
                'user_id' => $ownerId,
                'procurement_request_id' => $procurementRequest->id,
                'asset_code' => $this->nextAssetCode($ownerId, $prefix, $index),
                'name' => $procurementRequest->item_name,
                'category' => $procurementRequest->category,
                'purchase_date' => $purchaseDate,
                'purchase_price' => $purchasePrice,
                'condition' => 'new',
                'status' => 'available',
                'useful_life_months' => 36,
                'salvage_value' => 0,
                'notes' => 'Dibuat dari request pengadaan '.$procurementRequest->request_number,
            ]);
        }
    }

    private function nextAssetCode(int $ownerId, string $prefix, int $initialNumber): string
    {
        $number = $initialNumber;

        do {
            $code = sprintf('%s-%03d', $prefix, $number);
            $exists = CompanyAsset::query()
                ->where('user_id', $ownerId)
                ->where('asset_code', $code)
                ->exists();
            $number++;
        } while ($exists);

        return $code;
    }

    private function normalizeAssetCodePrefix(string $value): string
    {
        $prefix = strtoupper(preg_replace('/[^A-Z0-9]+/i', '-', $value) ?? '');
        $prefix = trim($prefix, '-');

        return $prefix !== '' ? $prefix : 'AST';
    }

    private function nextRequestNumber(int $ownerId): string
    {
        $prefix = 'APR-'.now()->format('Ym');
        $latestNumber = CompanyAssetProcurementRequest::query()
            ->where('user_id', $ownerId)
            ->where('request_number', 'like', $prefix.'-%')
            ->orderByDesc('request_number')
            ->value('request_number');

        $next = $latestNumber
            ? ((int) substr((string) $latestNumber, -4)) + 1
            : 1;

        return sprintf('%s-%04d', $prefix, $next);
    }

    private function payload(CompanyAssetProcurementRequest $procurementRequest): array
    {
        return [
            'id' => $procurementRequest->id,
            'request_number' => $procurementRequest->request_number,
            'requested_by_employee_id' => $procurementRequest->requested_by_employee_id,
            'requested_by_employee_label' => $procurementRequest->requestedByEmployee
                ? $procurementRequest->requestedByEmployee->employee_code.' - '.$procurementRequest->requestedByEmployee->full_name
                : '-',
            'item_name' => $procurementRequest->item_name,
            'category' => $procurementRequest->category,
            'quantity' => $procurementRequest->quantity,
            'estimated_unit_price' => $procurementRequest->estimated_unit_price,
            'actual_unit_price' => $procurementRequest->actual_unit_price,
            'needed_by' => $procurementRequest->needed_by?->format('Y-m-d'),
            'priority' => $procurementRequest->priority,
            'status' => $procurementRequest->status,
            'reason' => $procurementRequest->reason,
            'notes' => $procurementRequest->notes,
            'approved_at' => $procurementRequest->approved_at?->toDateTimeString(),
            'ordered_at' => $procurementRequest->ordered_at?->toDateTimeString(),
            'received_at' => $procurementRequest->received_at?->toDateTimeString(),
            'assets' => $procurementRequest->assets->map(fn (CompanyAsset $asset) => [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
            ])->values(),
        ];
    }
}
