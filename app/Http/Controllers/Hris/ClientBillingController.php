<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\ClientInvoice;
use App\Models\ClientInvoiceItem;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\SubCompany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientBillingController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['draft', 'sent', 'paid', 'cancelled'])],
            'sub_company_id' => ['nullable', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
            'period' => ['nullable', 'date_format:Y-m'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? '',
            'sub_company_id' => isset($validated['sub_company_id']) ? (string) $validated['sub_company_id'] : '',
            'period' => $validated['period'] ?? now()->format('Y-m'),
        ];

        $invoices = ClientInvoice::query()
            ->with('subCompany:id,name,code')
            ->where('user_id', $ownerId)
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['sub_company_id'] !== '', fn ($query) => $query->where('sub_company_id', $filters['sub_company_id']))
            ->when($filters['period'] !== '', fn ($query) => $query->where('period', $filters['period']))
            ->orderByDesc('issued_at')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (ClientInvoice $invoice): array => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'sub_company_label' => $invoice->subCompany
                    ? $invoice->subCompany->code.' - '.$invoice->subCompany->name
                    : '-',
                'period' => $invoice->period,
                'issued_at' => $invoice->issued_at?->format('Y-m-d'),
                'due_date' => $invoice->due_date?->format('Y-m-d'),
                'status' => $invoice->status,
                'employee_count' => $invoice->employee_count,
                'payroll_cost' => $invoice->payroll_cost,
                'service_fee' => $invoice->service_fee,
                'tax_amount' => $invoice->tax_amount,
                'total_amount' => $invoice->total_amount,
                'notes' => $invoice->notes,
            ]);

        $stats = ClientInvoice::query()
            ->where('user_id', $ownerId)
            ->selectRaw('status, COUNT(*) as total, SUM(total_amount) as amount')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return Inertia::render('hris/client-billings/index', [
            'invoices' => $invoices,
            'subCompanies' => $this->subCompanyOptions($ownerId),
            'filters' => $filters,
            'statusOptions' => ['draft', 'sent', 'paid', 'cancelled'],
            'stats' => [
                'draft' => (int) ($stats['draft']->total ?? 0),
                'sent' => (int) ($stats['sent']->total ?? 0),
                'paid' => (int) ($stats['paid']->total ?? 0),
                'outstanding_amount' => (float) (($stats['draft']->amount ?? 0) + ($stats['sent']->amount ?? 0)),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'sub_company_id' => ['required', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
            'period' => ['required', 'date_format:Y-m'],
            'issued_at' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'service_fee' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $summary = $this->payrollSummary($ownerId, (int) $validated['sub_company_id'], $validated['period']);
        $serviceFee = round((float) ($validated['service_fee'] ?? 0), 2);
        $taxAmount = round((float) ($validated['tax_amount'] ?? 0), 2);

        DB::transaction(function () use ($ownerId, $validated, $summary, $serviceFee, $taxAmount): void {
            $invoice = ClientInvoice::query()->create([
                'user_id' => $ownerId,
                'sub_company_id' => $validated['sub_company_id'],
                'invoice_number' => $this->nextInvoiceNumber($ownerId, $validated['period']),
                'period' => $validated['period'],
                'issued_at' => $validated['issued_at'],
                'due_date' => $validated['due_date'] ?? null,
                'employee_count' => $summary['employee_count'],
                'payroll_cost' => $summary['payroll_cost'],
                'service_fee' => $serviceFee,
                'tax_amount' => $taxAmount,
                'total_amount' => round($summary['payroll_cost'] + $serviceFee + $taxAmount, 2),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($summary['items'] as $item) {
                ClientInvoiceItem::query()->create([
                    'user_id' => $ownerId,
                    'client_invoice_id' => $invoice->id,
                    'employee_id' => $item['employee_id'],
                    'description' => $item['description'],
                    'quantity' => 1,
                    'unit_price' => $item['amount'],
                    'amount' => $item['amount'],
                ]);
            }
        });

        return back()->with('success', 'Invoice klien berhasil dibuat dari payroll periode terkait.');
    }

    public function update(Request $request, ClientInvoice $clientInvoice): RedirectResponse
    {
        abort_unless((int) $clientInvoice->user_id === $request->user()->accountOwnerId(), 404);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['draft', 'sent', 'paid', 'cancelled'])],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $clientInvoice->update($validated);

        return back()->with('success', 'Invoice klien berhasil diperbarui.');
    }

    public function destroy(Request $request, ClientInvoice $clientInvoice): RedirectResponse
    {
        abort_unless((int) $clientInvoice->user_id === $request->user()->accountOwnerId(), 404);
        abort_if($clientInvoice->status === 'paid', 422, 'Invoice yang sudah paid tidak bisa dihapus.');

        $clientInvoice->delete();

        return back()->with('success', 'Invoice klien berhasil dihapus.');
    }

    private function subCompanyOptions(int $ownerId): array
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

    private function payrollSummary(int $ownerId, int $subCompanyId, string $period): array
    {
        $run = PayrollRun::query()
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->where('type', 'regular')
            ->first();

        if (! $run) {
            $employees = Employee::query()
                ->where('user_id', $ownerId)
                ->where('sub_company_id', $subCompanyId)
                ->where('is_active', true)
                ->get(['id', 'employee_code', 'first_name', 'last_name', 'base_salary']);

            return [
                'employee_count' => $employees->count(),
                'payroll_cost' => round((float) $employees->sum('base_salary'), 2),
                'items' => $employees->map(fn (Employee $employee): array => [
                    'employee_id' => $employee->id,
                    'description' => 'Payroll '.$period.' - '.$employee->employee_code.' '.$employee->full_name,
                    'amount' => round((float) $employee->base_salary, 2),
                ])->all(),
            ];
        }

        $items = $run->items()
            ->with('employee:id,employee_code,first_name,last_name,sub_company_id')
            ->whereHas('employee', fn ($query) => $query->where('sub_company_id', $subCompanyId))
            ->get();

        return [
            'employee_count' => $items->count(),
            'payroll_cost' => round((float) $items->sum('net_salary'), 2),
            'items' => $items->map(fn ($item): array => [
                'employee_id' => $item->employee_id,
                'description' => 'Payroll '.$period.' - '.$item->employee?->employee_code.' '.$item->employee?->full_name,
                'amount' => round((float) $item->net_salary, 2),
            ])->all(),
        ];
    }

    private function nextInvoiceNumber(int $ownerId, string $period): string
    {
        $sequence = ClientInvoice::query()
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->count() + 1;

        return 'CL-'.$period.'-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
