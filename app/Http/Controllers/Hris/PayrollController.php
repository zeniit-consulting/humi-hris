<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\GeneratePayrollRequest;
use App\Jobs\SendPayslipToWhatsApp;
use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\SubCompany;
use App\Services\PayrollGenerationService;
use App\Services\PayrollReadinessService;
use App\Support\WhatsAppPhone;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayrollController extends Controller
{
    /**
     * Display payroll generation and preview page.
     */
    public function index(Request $request, PayrollReadinessService $readiness): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
            'type' => ['nullable', 'in:regular,thr'],
            'sub_company_id' => ['nullable', 'integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
        ]);

        $period = $validated['period'] ?? now()->format('Y-m');
        $type = $validated['type'] ?? 'regular';
        $subCompanyId = $validated['sub_company_id'] ?? null;

        $run = PayrollRun::query()
            ->with([
                'items.employee:id,employee_code,first_name,last_name,phone,sub_company_id,is_active,employment_status',
                'items.employee.subCompany:id,code,name',
                'items.employee.bankAccounts:id,employee_id,is_primary',
            ])
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->where('type', $type)
            ->first();

        $items = $run
            ? $run->items
                ->when($subCompanyId !== null, fn ($collection) => $collection->filter(
                    fn ($item) => (int) ($item->employee?->sub_company_id ?? 0) === (int) $subCompanyId
                ))
                ->values()
            : collect();

        $filteredTotals = [
            'employees_count' => $items->count(),
            'total_base_salary' => round((float) $items->sum('base_salary'), 2),
            'total_allowances' => round((float) $items->sum('allowances_total'), 2),
            'total_deductions' => round((float) $items->sum('deductions_total'), 2),
            'total_net_salary' => round((float) $items->sum('net_salary'), 2),
        ];

        return Inertia::render('hris/payrolls/index', [
            'period' => $period,
            'type' => $type,
            'sub_company_id' => $subCompanyId ? (string) $subCompanyId : '',
            'employeeOptions' => Employee::query()
                ->with('subCompany:id,code,name')
                ->where('user_id', $ownerId)
                ->where('is_active', true)
                ->whereIn('employment_status', ['active', 'probation', 'on_leave'])
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'employee_code', 'first_name', 'last_name', 'sub_company_id'])
                ->map(fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'label' => $employee->employee_code.' - '.$employee->full_name,
                    'sub_company_label' => $employee->subCompany
                        ? $employee->subCompany->code.' - '.$employee->subCompany->name
                        : 'Internal',
                ]),
            'subCompanies' => SubCompany::query()
                ->where('user_id', $ownerId)
                ->orderBy('name')
                ->get(['id', 'code', 'name'])
                ->map(fn (SubCompany $company): array => [
                    'id' => $company->id,
                    'label' => $company->code.' - '.$company->name,
                ]),
            'run' => $run ? [
                'id' => $run->id,
                'period' => $run->period,
                'type' => $run->type,
                'period_start' => $run->period_start?->format('Y-m-d'),
                'period_end' => $run->period_end?->format('Y-m-d'),
                'thr_reference_date' => $run->thr_reference_date?->format('Y-m-d'),
                'generated_at' => $run->generated_at?->toIso8601String(),
                'is_saved' => $run->is_saved,
                'saved_at' => $run->saved_at?->toIso8601String(),
                'employees_count' => $filteredTotals['employees_count'],
                'total_base_salary' => $filteredTotals['total_base_salary'],
                'total_allowances' => $filteredTotals['total_allowances'],
                'total_deductions' => $filteredTotals['total_deductions'],
                'total_net_salary' => $filteredTotals['total_net_salary'],
                'unfiltered_employees_count' => $run->employees_count,
                'unfiltered_total_net_salary' => $run->total_net_salary,
            ] : null,
            'items' => $items
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'employee_id' => $item->employee_id,
                    'employee_label' => $item->employee
                        ? $item->employee->employee_code.' - '.$item->employee->full_name
                        : '-',
                    'sub_company_label' => $item->employee?->subCompany
                        ? $item->employee->subCompany->code.' - '.$item->employee->subCompany->name
                        : 'Internal',
                    'can_send_payslip' => $item->employee?->phone
                        ? WhatsAppPhone::isValid($item->employee->phone)
                        : false,
                    'base_salary' => $item->base_salary,
                    'allowances_total' => $item->allowances_total,
                    'is_prorated' => $item->is_prorated,
                    'proration_working_days' => $item->proration_working_days,
                    'proration_payable_days' => $item->proration_payable_days,
                    'proration_factor' => $item->proration_factor,
                    'overtime_hours' => $item->overtime_hours,
                    'overtime_pay' => $item->overtime_pay,
                    'pph21_method' => $item->pph21_method,
                    'pph21_rate' => $item->pph21_rate,
                    'pph21_allowance' => $item->pph21_allowance,
                    'pph21_deduction' => $item->pph21_deduction,
                    'pph21_company_borne' => $item->pph21_company_borne,
                    'kasbon_deduction' => $item->kasbon_deduction,
                    'denda_deduction' => $item->denda_deduction,
                    'deductions_total' => $item->deductions_total,
                    'net_salary' => $item->net_salary,
                    'allowance_breakdown' => $item->allowance_breakdown ?? [],
                    'variable_allowance_breakdown' => $item->variable_allowance_breakdown ?? [],
                    'bonus_breakdown' => $item->bonus_breakdown ?? [],
                    'thr_months_of_service' => $item->thr_months_of_service,
                    'thr_amount' => $item->thr_amount,
                ])->values(),
            'payrollReadiness' => $readiness->summarize($ownerId, $period, $run),
        ]);
    }

    /**
     * Auto-generate payroll for selected period.
     */
    public function generate(GeneratePayrollRequest $request, PayrollGenerationService $payrolls): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $period = $request->validated('period');
        $employeeScope = $request->validated('employee_scope') ?? 'all';
        $excludedEmployeeIds = $request->validated('excluded_employee_ids') ?? [];

        $payrolls->generateForPeriod(
            $ownerId,
            $period,
            $request->user()?->id,
            markAsDraft: true,
            includeSubCompanyEmployees: $employeeScope === 'all',
            excludedEmployeeIds: $excludedEmployeeIds,
        );

        return to_route('hris.payrolls.index', ['period' => $period, 'type' => 'regular']);
    }

    /**
     * Generate THR payroll for the given reference date.
     */
    public function generateThr(Request $request, PayrollGenerationService $payrolls): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $request->validate([
            'reference_date' => ['required', 'date'],
        ]);

        $run = $payrolls->generateThr($ownerId, $validated['reference_date']);

        return to_route('hris.payrolls.index', ['period' => $run->period, 'type' => 'thr'])
            ->with('success', 'THR berhasil digenerate untuk '.Carbon::parse($validated['reference_date'])->locale('id')->translatedFormat('F Y').'.');
    }

    /**
     * Save/finalize generated payroll.
     */
    public function save(PayrollRun $payrollRun, Request $request, PayrollReadinessService $readiness): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);

        $summary = $readiness->summarize($ownerId, $payrollRun->period, $payrollRun);

        $payrollRun->update([
            'is_saved' => true,
            'saved_at' => now(),
            'saved_by' => $request->user()?->id,
        ]);

        $redirect = to_route('hris.payrolls.index', ['period' => $payrollRun->period, 'type' => $payrollRun->type ?? 'regular']);

        if (($summary['warning_count'] ?? 0) > 0 || ($summary['error_count'] ?? 0) > 0) {
            return $redirect->with(
                'warning',
                'Payroll disimpan dengan '.($summary['warning_count'] ?? 0).' warning dan '.($summary['error_count'] ?? 0).' error checklist. Mohon review catatan readiness.'
            );
        }

        return $redirect->with('success', 'Payroll berhasil disimpan.');
    }

    public function updateItem(PayrollRun $payrollRun, PayrollItem $payrollItem, Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);
        abort_unless((int) $payrollItem->payroll_run_id === (int) $payrollRun->id, 404);

        if ($payrollRun->is_saved) {
            return back()->with('error', 'Payroll yang sudah disimpan tidak bisa diedit.');
        }

        $this->normalizePayrollItemInput($request);
        $this->normalizeCompensationRows($request, 'variable_allowances');
        $this->normalizeCompensationRows($request, 'bonuses');

        $validated = $request->validate([
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'allowances_total' => ['nullable', 'numeric', 'min:0'],
            'overtime_hours' => ['nullable', 'numeric', 'min:0'],
            'overtime_pay' => ['nullable', 'numeric', 'min:0'],
            'pph21_rate' => ['nullable', 'numeric', 'min:0'],
            'pph21_allowance' => ['nullable', 'numeric', 'min:0'],
            'pph21_deduction' => ['nullable', 'numeric', 'min:0'],
            'pph21_company_borne' => ['nullable', 'numeric', 'min:0'],
            'kasbon_deduction' => ['nullable', 'numeric', 'min:0'],
            'denda_deduction' => ['nullable', 'numeric', 'min:0'],
            'variable_allowances' => ['nullable', 'array', 'max:20'],
            'variable_allowances.*.name' => ['required', 'string', 'max:100'],
            'variable_allowances.*.amount' => ['required', 'numeric', 'min:0'],
            'bonuses' => ['nullable', 'array', 'max:20'],
            'bonuses.*.name' => ['required', 'string', 'max:100'],
            'bonuses.*.amount' => ['required', 'numeric', 'min:0'],
        ]);

        $variableAllowances = $validated['variable_allowances'] ?? null;
        $bonuses = $validated['bonuses'] ?? null;
        unset($validated['variable_allowances'], $validated['bonuses']);

        $payrollItem->fill($validated);

        if ($variableAllowances !== null || $bonuses !== null) {
            $variableBreakdown = $this->compensationBreakdown(
                $variableAllowances ?? ($payrollItem->variable_allowance_breakdown ?? [])
            );
            $bonusBreakdown = $this->compensationBreakdown(
                $bonuses ?? ($payrollItem->bonus_breakdown ?? [])
            );
            $fixedAllowancesTotal = (float) collect($payrollItem->allowance_breakdown ?? [])->sum();

            $payrollItem->forceFill([
                'variable_allowance_breakdown' => $variableBreakdown,
                'bonus_breakdown' => $bonusBreakdown,
                'allowances_total' => round(
                    $fixedAllowancesTotal + collect($variableBreakdown)->sum() + collect($bonusBreakdown)->sum(),
                    2
                ),
            ]);
        }

        $deductionsTotal = round(
            (float) $payrollItem->pph21_deduction
            + (float) $payrollItem->kasbon_deduction
            + (float) $payrollItem->denda_deduction,
            2
        );
        $netSalary = round(max(
            ((float) $payrollItem->base_salary
                + (float) $payrollItem->allowances_total
                + (float) $payrollItem->overtime_pay
                + (float) $payrollItem->pph21_allowance)
            - $deductionsTotal,
            0
        ), 2);

        $payrollItem->forceFill([
            'deductions_total' => $deductionsTotal,
            'net_salary' => $netSalary,
        ])->save();

        $this->refreshPayrollRunTotals($payrollRun);

        return to_route('hris.payrolls.index', ['period' => $payrollRun->period, 'type' => $payrollRun->type ?? 'regular'])
            ->with('success', 'Item payroll berhasil diperbarui.');
    }

    /**
     * Export transfer format Mandiri (CSV semicolon).
     */
    public function exportMandiri(PayrollRun $payrollRun, Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);
        abort_unless($payrollRun->is_saved, 422, 'Simpan payroll terlebih dahulu.');

        $payrollRun->loadMissing([
            'items.employee:id,employee_code,first_name,last_name,sub_company_id',
            'items.employee.bankAccounts' => fn ($q) => $q->where('is_primary', true)->limit(1),
        ]);

        $subCompanyId = $request->integer('sub_company_id') ?: null;
        $items = $payrollRun->items
            ->when($subCompanyId !== null, fn ($collection) => $collection->filter(
                fn ($item) => (int) ($item->employee?->sub_company_id ?? 0) === (int) $subCompanyId
            ))
            ->values();

        $period = Carbon::createFromFormat('Y-m', $payrollRun->period)->locale('id')->translatedFormat('F Y');
        $filename = 'transfer_mandiri_'.$payrollRun->period.'.csv';

        return response()->streamDownload(function () use ($items, $period): void {
            $out = fopen('php://output', 'wb');
            // BOM untuk Excel compatibility
            fwrite($out, "\xEF\xBB\xBF");
            // Header Mandiri - format semicolon
            fputcsv($out, ['No', 'Nama Penerima', 'No Rekening', 'Kode Bank', 'Nominal', 'Keterangan'], ';');

            $no = 1;
            foreach ($items as $item) {
                $employee = $item->employee;
                $bank = $employee?->bankAccounts->first();
                fputcsv($out, [
                    $no++,
                    $employee?->full_name ?? '-',
                    $bank?->account_number ?? '',
                    strtoupper($bank?->bank_name ?? ''),
                    (int) round((float) $item->net_salary),
                    'GAJI '.$period,
                ], ';');
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function normalizePayrollItemInput(Request $request): void
    {
        $currencyFields = [
            'base_salary',
            'allowances_total',
            'overtime_hours',
            'overtime_pay',
            'pph21_rate',
            'pph21_allowance',
            'pph21_deduction',
            'pph21_company_borne',
            'kasbon_deduction',
            'denda_deduction',
        ];

        $normalized = [];

        foreach ($currencyFields as $field) {
            if (! $request->has($field)) {
                continue;
            }

            $normalized[$field] = $this->normalizeAmount($request->input($field), $field === 'overtime_hours');
        }

        $request->merge($normalized);
    }

    private function normalizeCompensationRows(Request $request, string $key): void
    {
        if (! $request->has($key)) {
            return;
        }

        $rows = collect($request->input($key, []))
            ->map(function (mixed $row): mixed {
                if (! is_array($row)) {
                    return $row;
                }

                $row['amount'] = preg_replace('/[^\d]/', '', (string) ($row['amount'] ?? ''));

                return $row;
            })
            ->all();

        $request->merge([$key => $rows]);
    }

    /**
     * @param  array<int|string, mixed>  $rows
     * @return array<string, float>
     */
    private function compensationBreakdown(array $rows): array
    {
        $breakdown = [];

        foreach ($rows as $key => $row) {
            $name = is_array($row) ? trim((string) ($row['name'] ?? '')) : (string) $key;
            $amount = is_array($row) ? (float) ($row['amount'] ?? 0) : (float) $row;

            $breakdown[$name] = round(($breakdown[$name] ?? 0) + $amount, 2);
        }

        return $breakdown;
    }

    private function normalizeAmount(mixed $value, bool $allowDecimal = false): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = $allowDecimal
            ? preg_replace('/[^\d.]/', '', str_replace(',', '.', (string) $value))
            : preg_replace('/[^\d]/', '', (string) $value);

        return $normalized === '' ? null : $normalized;
    }

    private function refreshPayrollRunTotals(PayrollRun $payrollRun): void
    {
        $payrollRun->load('items');

        $payrollRun->update([
            'employees_count' => $payrollRun->items->count(),
            'total_base_salary' => round((float) $payrollRun->items->sum('base_salary'), 2),
            'total_allowances' => round((float) $payrollRun->items->sum('allowances_total'), 2),
            'total_deductions' => round((float) $payrollRun->items->sum('deductions_total'), 2),
            'total_net_salary' => round((float) $payrollRun->items->sum('net_salary'), 2),
        ]);
    }

    /**
     * Export transfer format BCA (CSV comma).
     */
    public function exportBca(PayrollRun $payrollRun, Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);
        abort_unless($payrollRun->is_saved, 422, 'Simpan payroll terlebih dahulu.');

        $payrollRun->loadMissing([
            'items.employee:id,employee_code,first_name,last_name,sub_company_id',
            'items.employee.bankAccounts' => fn ($q) => $q->where('is_primary', true)->limit(1),
        ]);

        $subCompanyId = $request->integer('sub_company_id') ?: null;
        $items = $payrollRun->items
            ->when($subCompanyId !== null, fn ($collection) => $collection->filter(
                fn ($item) => (int) ($item->employee?->sub_company_id ?? 0) === (int) $subCompanyId
            ))
            ->values();

        $period = Carbon::createFromFormat('Y-m', $payrollRun->period)->locale('id')->translatedFormat('F Y');
        $filename = 'transfer_bca_'.$payrollRun->period.'.csv';

        return response()->streamDownload(function () use ($items, $period): void {
            $out = fopen('php://output', 'wb');
            fwrite($out, "\xEF\xBB\xBF");
            // Header BCA - format comma, quoted
            fputcsv($out, ['NAMA PENERIMA', 'NO REKENING', 'NOMINAL', 'BERITA TRANSFER']);

            foreach ($items as $item) {
                $employee = $item->employee;
                $bank = $employee?->bankAccounts->first();
                fputcsv($out, [
                    strtoupper($employee?->full_name ?? '-'),
                    $bank?->account_number ?? '',
                    (int) round((float) $item->net_salary),
                    'GAJI '.strtoupper($period),
                ]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function sendPayslips(PayrollRun $payrollRun, Request $request): RedirectResponse
    {
        if (! $payrollRun->is_saved) {
            return back()->with('error', 'Simpan payroll terlebih dahulu sebelum mengirim payslip ke WhatsApp.');
        }

        $payrollRun->loadMissing([
            'items.employee:id,employee_code,first_name,last_name,email,phone,division_id,position_id',
            'items.employee.division:id,name',
            'items.employee.position:id,name',
        ]);

        if ($payrollRun->items->isEmpty()) {
            return back()->with('error', 'Tidak ada item payroll yang bisa dikirim.');
        }

        $ownerId = $request->user()->accountOwnerId();
        $queued = 0;
        $skipped = 0;

        foreach ($payrollRun->items as $item) {
            $employee = $item->employee;

            if (! $employee || ! $employee->phone || ! WhatsAppPhone::isValid($employee->phone)) {
                $skipped++;

                continue;
            }

            SendPayslipToWhatsApp::dispatch($item->id, $ownerId)
                ->delay(now()->addSeconds(intdiv($queued, 10) * 60));

            $queued++;
        }

        $message = sprintf(
            'Payslip masuk queue untuk %d karyawan. %d dilewati karena nomor WhatsApp tidak valid.',
            $queued,
            $skipped,
        );

        return back()->with($queued > 0 ? 'success' : 'error', $message);
    }

    public function sendPayslip(PayrollRun $payrollRun, PayrollItem $payrollItem, Request $request): RedirectResponse
    {
        if (! $payrollRun->is_saved) {
            return back()->with('error', 'Simpan payroll terlebih dahulu sebelum mengirim payslip ke WhatsApp.');
        }

        abort_unless((int) $payrollItem->payroll_run_id === (int) $payrollRun->id, 404);

        $payrollItem->loadMissing('employee:id,employee_code,first_name,last_name,phone');

        if (! $payrollItem->employee?->phone || ! WhatsAppPhone::isValid($payrollItem->employee->phone)) {
            return back()->with('error', 'Nomor WhatsApp karyawan tidak valid.');
        }

        SendPayslipToWhatsApp::dispatch($payrollItem->id, $request->user()->accountOwnerId());

        return back()->with('success', 'Payslip karyawan masuk queue pengiriman WhatsApp.');
    }
}
