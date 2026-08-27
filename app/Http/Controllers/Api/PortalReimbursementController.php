<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\ReimbursementRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortalReimbursementController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function index(Request $request): JsonResponse
    {
        $employee = $this->resolveRequiredSelfServiceEmployee($request->user());
        $items = ReimbursementRequest::query()
            ->where('employee_id', $employee->id)
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (ReimbursementRequest $row) => $this->payload($row))
            ->values();

        $bankAccounts = $employee->bankAccounts()
            ->orderByDesc('is_primary')
            ->orderBy('id')
            ->get(['id', 'bank_name', 'account_number', 'account_holder_name', 'is_primary'])
            ->map(fn ($acc) => [
                'id' => $acc->id,
                'bank_name' => $acc->bank_name,
                'account_number' => $acc->account_number,
                'account_holder_name' => $acc->account_holder_name,
                'is_primary' => (bool) $acc->is_primary,
                'label' => $acc->bank_name.' - '.$acc->account_number.' (a.n. '.$acc->account_holder_name.')'.($acc->is_primary ? ' [Utama]' : ''),
            ])
            ->values();

        return $this->success([
            'items' => $items,
            'bank_accounts' => $bankAccounts,
            'categories' => ReimbursementRequest::CATEGORIES,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $employee = $this->resolveRequiredSelfServiceEmployee($request->user());
        $validated = $request->validate([
            'category' => ['required', 'string', \Illuminate\Validation\Rule::in(ReimbursementRequest::CATEGORIES)],
            'employee_bank_account_id' => ['nullable', 'integer', \Illuminate\Validation\Rule::exists('employee_bank_accounts', 'id')->where('employee_id', $employee->id)],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:5000'],
            'amount' => ['required', 'numeric', 'min:1', 'max:999999999999.99'],
            'receipt' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $bankAccount = null;
        if (! empty($validated['employee_bank_account_id'])) {
            $bankAccount = $employee->bankAccounts()->find($validated['employee_bank_account_id']);
        }

        if (! $bankAccount) {
            $bankAccount = $employee->bankAccounts()->where('is_primary', true)->first()
                ?: $employee->bankAccounts()->first();
        }

        $path = $request->file('receipt')->store('reimbursements/receipts', 'public');
        $reimbursement = ReimbursementRequest::query()->create([
            'user_id' => $request->user()->accountOwnerId(),
            'employee_id' => $employee->id,
            'category' => $validated['category'] ?? 'Others',
            'employee_bank_account_id' => $bankAccount?->id,
            'bank_name' => $bankAccount?->bank_name,
            'account_number' => $bankAccount?->account_number,
            'account_holder_name' => $bankAccount?->account_holder_name,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'receipt_path' => $path,
            'receipt_original_name' => $request->file('receipt')->getClientOriginalName(),
            'status' => 'pending',
        ]);

        return $this->success($this->payload($reimbursement), 'Pengajuan reimbursement berhasil dikirim.', 201);
    }

    private function payload(ReimbursementRequest $row): array
    {
        return [
            'id' => $row->id,
            'category' => $row->category ?? 'Others',
            'bank_account_id' => $row->employee_bank_account_id,
            'bank_name' => $row->bank_name,
            'account_number' => $row->account_number,
            'account_holder_name' => $row->account_holder_name,
            'title' => $row->title,
            'description' => $row->description,
            'amount' => (string) $row->amount,
            'status' => $row->status,
            'receipt_url' => $row->receipt_path ? Storage::disk('public')->url($row->receipt_path) : null,
            'receipt_name' => $row->receipt_original_name,
            'rejection_reason' => $row->rejection_reason,
            'created_at' => $row->created_at?->toIso8601String(),
        ];
    }
}
