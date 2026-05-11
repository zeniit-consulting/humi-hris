<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\GeneratePayrollRequest;
use App\Jobs\SendPayslipToWhatsApp;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Services\PayrollGenerationService;
use App\Support\WhatsAppPhone;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayrollController extends Controller
{
    /**
     * Display payroll generation and preview page.
     */
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
            'type'   => ['nullable', 'in:regular,thr'],
        ]);

        $period = $validated['period'] ?? now()->format('Y-m');
        $type = $validated['type'] ?? 'regular';

        $run = PayrollRun::query()
            ->with([
                'items.employee:id,employee_code,first_name,last_name,phone',
            ])
            ->where('user_id', $ownerId)
            ->where('period', $period)
            ->where('type', $type)
            ->first();

        return Inertia::render('hris/payrolls/index', [
            'period' => $period,
            'type' => $type,
            'run' => $run ? [
                'id' => $run->id,
                'period' => $run->period,
                'type' => $run->type,
                'period_start' => $run->period_start?->format('Y-m-d'),
                'period_end' => $run->period_end?->format('Y-m-d'),
                'thr_reference_date' => $run->thr_reference_date?->format('Y-m-d'),
                'generated_at' => $run->generated_at?->toDateTimeString(),
                'is_saved' => $run->is_saved,
                'saved_at' => $run->saved_at?->toDateTimeString(),
                'employees_count' => $run->employees_count,
                'total_base_salary' => $run->total_base_salary,
                'total_allowances' => $run->total_allowances,
                'total_deductions' => $run->total_deductions,
                'total_net_salary' => $run->total_net_salary,
            ] : null,
            'items' => $run
                ? $run->items->map(fn ($item) => [
                    'id' => $item->id,
                    'employee_id' => $item->employee_id,
                    'employee_label' => $item->employee
                        ? $item->employee->employee_code.' - '.$item->employee->full_name
                        : '-',
                    'can_send_payslip' => $item->employee?->phone
                        ? WhatsAppPhone::isValid($item->employee->phone)
                        : false,
                    'base_salary' => $item->base_salary,
                    'allowances_total' => $item->allowances_total,
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
                    'thr_months_of_service' => $item->thr_months_of_service,
                    'thr_amount' => $item->thr_amount,
                ])->values()
                : [],
        ]);
    }

    /**
     * Auto-generate payroll for selected period.
     */
    public function generate(GeneratePayrollRequest $request, PayrollGenerationService $payrolls): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $period = $request->validated('period');

        $payrolls->generateForPeriod($ownerId, $period, $request->user()?->id);

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
    public function save(PayrollRun $payrollRun, Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);

        $payrollRun->update([
            'is_saved' => true,
            'saved_at' => now(),
            'saved_by' => $request->user()?->id,
        ]);

        return to_route('hris.payrolls.index', ['period' => $payrollRun->period, 'type' => $payrollRun->type ?? 'regular']);
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
            'items.employee:id,employee_code,first_name,last_name',
            'items.employee.bankAccounts' => fn ($q) => $q->where('is_primary', true)->limit(1),
        ]);

        $period = Carbon::createFromFormat('Y-m', $payrollRun->period)->locale('id')->translatedFormat('F Y');
        $filename = 'transfer_mandiri_'.$payrollRun->period.'.csv';

        return response()->streamDownload(function () use ($payrollRun, $period): void {
            $out = fopen('php://output', 'wb');
            // BOM untuk Excel compatibility
            fwrite($out, "\xEF\xBB\xBF");
            // Header Mandiri - format semicolon
            fputcsv($out, ['No', 'Nama Penerima', 'No Rekening', 'Kode Bank', 'Nominal', 'Keterangan'], ';');

            $no = 1;
            foreach ($payrollRun->items as $item) {
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

    /**
     * Export transfer format BCA (CSV comma).
     */
    public function exportBca(PayrollRun $payrollRun, Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);
        abort_unless($payrollRun->is_saved, 422, 'Simpan payroll terlebih dahulu.');

        $payrollRun->loadMissing([
            'items.employee:id,employee_code,first_name,last_name',
            'items.employee.bankAccounts' => fn ($q) => $q->where('is_primary', true)->limit(1),
        ]);

        $period = Carbon::createFromFormat('Y-m', $payrollRun->period)->locale('id')->translatedFormat('F Y');
        $filename = 'transfer_bca_'.$payrollRun->period.'.csv';

        return response()->streamDownload(function () use ($payrollRun, $period): void {
            $out = fopen('php://output', 'wb');
            fwrite($out, "\xEF\xBB\xBF");
            // Header BCA - format comma, quoted
            fputcsv($out, ['NAMA PENERIMA', 'NO REKENING', 'NOMINAL', 'BERITA TRANSFER']);

            foreach ($payrollRun->items as $item) {
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
