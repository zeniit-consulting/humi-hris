<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\ReimbursementRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReimbursementController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
            'sort_by' => ['nullable', Rule::in(['employee', 'title', 'amount', 'receipt', 'status', 'created_at'])],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
        ]);
        $period = $validated['period'] ?? now()->format('Y-m');
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDir = $validated['sort_dir'] ?? 'desc';

        $requestsQuery = ReimbursementRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,division_id,position_id', 'employee.division:id,name', 'employee.position:id,name', 'approver:id,name', 'processor:id,name'])
            ->whereYear('created_at', substr($period, 0, 4))
            ->whereMonth('created_at', substr($period, 5, 2));

        $sortColumn = match ($sortBy) {
            'employee' => 'employee_id',
            'title' => 'title',
            'amount' => 'amount',
            'receipt' => 'receipt_original_name',
            'status' => 'status',
            default => 'created_at',
        };
        $requests = $requestsQuery
            ->orderBy($sortColumn, $sortDir)
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ReimbursementRequest $row): array => $this->payload($row));

        $stats = ReimbursementRequest::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return Inertia::render('hris/reimbursements/index', [
            'requests' => $requests,
            'period' => $period,
            'sort' => ['by' => $sortBy, 'direction' => $sortDir],
            'stats' => collect(ReimbursementRequest::STATUSES)->mapWithKeys(fn (string $status) => [$status => (int) ($stats[$status] ?? 0)]),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
            'status' => ['nullable', Rule::in(ReimbursementRequest::STATUSES)],
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
        ]);
        $status = $validated['status'] ?? '';
        $employeeId = isset($validated['employee_id']) ? (string) $validated['employee_id'] : '';
        $period = $validated['period'] ?? now()->format('Y-m');

        $rows = ReimbursementRequest::query()
            ->with(['employee:id,employee_code,first_name,last_name,division_id', 'employee.division:id,name', 'approver:id,name', 'processor:id,name'])
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($employeeId !== '', fn ($query) => $query->where('employee_id', $employeeId))
            ->whereYear('created_at', substr($period, 0, 4))
            ->whereMonth('created_at', substr($period, 5, 2))
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'processing' THEN 2 WHEN 'paid' THEN 3 ELSE 4 END")
            ->latest('id')
            ->get();

        $statusLabels = [
            'pending' => 'Menunggu',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'processing' => 'Diproses Finance',
            'paid' => 'Dibayar',
        ];
        $headers = [
            'ID',
            'Kode Pegawai',
            'Nama Karyawan',
            'Divisi',
            'Pengajuan',
            'Deskripsi',
            'Nominal',
            'Status',
            'Tanggal Pengajuan',
            'Disetujui Oleh',
            'Tanggal Persetujuan',
            'Diproses Oleh',
            'Tanggal Diproses',
            'Catatan Finance',
            'Alasan Penolakan',
            'Nama Nota',
        ];

        $fileName = 'reimbursements_'.now()->format('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($headers, $rows, $statusLabels): void {
            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Reimbursement');
            $sheet->fromArray($headers, null, 'A1');

            $sheet->getStyle('A1:P1')->getFont()->setBold(true);
            $sheet->freezePane('A2');
            $sheet->getStyle('G:G')->getNumberFormat()->setFormatCode('#,##0');

            foreach ($rows as $index => $row) {
                $employee = $row->employee;
                $sheet->fromArray([
                    $row->id,
                    $employee?->employee_code,
                    $employee?->full_name,
                    $employee?->division?->name,
                    $row->title,
                    $row->description,
                    (float) $row->amount,
                    $statusLabels[$row->status] ?? $row->status,
                    $row->created_at?->format('Y-m-d H:i'),
                    $row->approver?->name,
                    $row->approved_at?->format('Y-m-d H:i'),
                    $row->processor?->name,
                    $row->processed_at?->format('Y-m-d H:i'),
                    $row->finance_notes,
                    $row->rejection_reason,
                    $row->receipt_original_name,
                ], null, 'A'.($index + 2));
            }

            foreach (range('A', 'P') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
