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
        $items = ReimbursementRequest::query()->where('employee_id', $employee->id)->latest('id')->limit(50)->get()->map(fn (ReimbursementRequest $row) => $this->payload($row))->values();

        return $this->success(['items' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $employee = $this->resolveRequiredSelfServiceEmployee($request->user());
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:5000'],
            'amount' => ['required', 'numeric', 'min:1', 'max:999999999999.99'],
            'receipt' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        $path = $request->file('receipt')->store('reimbursements/receipts', 'public');
        $reimbursement = ReimbursementRequest::query()->create([
            'user_id' => $request->user()->accountOwnerId(),
            'employee_id' => $employee->id,
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
