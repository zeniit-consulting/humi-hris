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
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
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
                'lockedBy:id,name',
                'items.employee:id,employee_code,first_name,last_name,phone,sub_company_id,division_id,hire_date,offboarded_at,base_salary,is_active,employment_status,employment_type',
                'items.employee.subCompany:id,code,name',
                'items.employee.division:id,name',
                'items.employee.bankAccounts:id,employee_id,bank_name,account_number,account_holder_name,is_primary',
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
                ->get(['id', 'employee_code', 'first_name', 'last_name', 'sub_company_id', 'service_fee_points'])
                ->map(fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'label' => $employee->employee_code.' - '.$employee->full_name,
                    'sub_company_label' => $employee->subCompany
                        ? $employee->subCompany->code.' - '.$employee->subCompany->name
                        : 'Internal',
                    'service_fee_points' => $employee->service_fee_points,
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
                'is_locked' => (bool) $run->is_locked,
                'locked_at' => $run->locked_at?->toIso8601String(),
                'locked_by' => $run->locked_by,
                'locked_by_name' => $run->lockedBy?->name,
                'is_locked_by_me' => (int) ($run->locked_by ?? 0) === (int) $request->user()->id,
                'employees_count' => $filteredTotals['employees_count'],
                'total_base_salary' => $filteredTotals['total_base_salary'],
                'total_allowances' => $filteredTotals['total_allowances'],
                'total_deductions' => $filteredTotals['total_deductions'],
                'total_net_salary' => $filteredTotals['total_net_salary'],
                'service_fee_total' => $run->service_fee_total,
                'unfiltered_employees_count' => $run->employees_count,
                'unfiltered_total_net_salary' => $run->total_net_salary,
            ] : null,
            'items' => $items
                ->map(function ($item) {
                    $primaryBank = $item->employee?->bankAccounts?->firstWhere('is_primary', true)
                        ?? $item->employee?->bankAccounts?->first();

                    return [
                        'id' => $item->id,
                        'employee_id' => $item->employee_id,
                        'employee_code' => $item->employee?->employee_code ?? '-',
                        'employee_name' => $item->employee?->full_name ?? '-',
                        'employee_label' => $item->employee
                            ? $item->employee->employee_code.' - '.$item->employee->full_name
                            : '-',
                        'division_name' => $item->employee?->division?->name ?? '-',
                        'hire_date' => $item->employee?->hire_date?->format('d M Y'),
                        'offboarded_at' => $item->employee?->offboarded_at?->format('d M Y'),
                        'employment_status' => $item->employee?->employment_status ?? null,
                        'employment_type' => $item->employee?->employment_type ?? null,
                        'bank_name' => $primaryBank?->bank_name ?? null,
                        'account_number' => $primaryBank?->account_number ?? null,
                        'account_holder_name' => $primaryBank?->account_holder_name ?? null,
                        'unprorated_base_salary' => $item->employee?->base_salary,
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
                        'bpjs_kesehatan_company' => $item->bpjs_kesehatan_company,
                        'bpjs_kesehatan_employee' => $item->bpjs_kesehatan_employee,
                        'bpjs_kesehatan_class' => $item->bpjs_kesehatan_class,
                        'bpjs_jkk_company' => $item->bpjs_jkk_company,
                        'bpjs_jkm_company' => $item->bpjs_jkm_company,
                        'bpjs_jht_company' => $item->bpjs_jht_company,
                        'bpjs_jht_employee' => $item->bpjs_jht_employee,
                        'bpjs_jp_company' => $item->bpjs_jp_company,
                        'bpjs_jp_employee' => $item->bpjs_jp_employee,
                        'bpjs_total_company' => $item->bpjs_total_company,
                        'bpjs_total_employee' => $item->bpjs_total_employee,
                        'private_insurance_name' => $item->private_insurance_name,
                        'private_insurance_nominal' => $item->private_insurance_nominal,
                        'kasbon_deduction' => $item->kasbon_deduction,
                        'denda_deduction' => $item->denda_deduction,
                        'unpaid_leave_deduction' => $item->unpaid_leave_deduction,
                        'deductions_total' => $item->deductions_total,
                        'net_salary' => $item->net_salary,
                        'allowance_breakdown' => $item->allowance_breakdown ?? [],
                        'variable_allowance_breakdown' => $item->variable_allowance_breakdown ?? [],
                        'bonus_breakdown' => $item->bonus_breakdown ?? [],
                        'thr_months_of_service' => $item->thr_months_of_service,
                        'thr_amount' => $item->thr_amount,
                    ];
                })->values(),
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
        $serviceFeeTotal = (float) ($request->validated('service_fee_total') ?? 0);

        $payrolls->generateForPeriod(
            $ownerId,
            $period,
            $request->user()?->id,
            markAsDraft: true,
            includeSubCompanyEmployees: $employeeScope === 'all',
            excludedEmployeeIds: $excludedEmployeeIds,
            serviceFeeTotal: $serviceFeeTotal,
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

    /**
     * Lock or unlock the payroll run.
     */
     public function toggleLock(PayrollRun $payrollRun, Request $request): RedirectResponse
     {
         $ownerId = $request->user()->accountOwnerId();
         abort_if((int) $payrollRun->user_id !== $ownerId, 403);
 
         if ($payrollRun->is_saved) {
             return back()->with('error', 'Payroll yang sudah difinalisasi/disimpan tidak memerlukan lock/unlock.');
         }
 
         $user = $request->user();
 
         // If currently locked, perform unlock with PIN verification (user phone number)
         if ($payrollRun->is_locked) {
             $validated = $request->validate([
                 'pin' => ['required', 'string'],
             ], [
                 'pin.required' => 'PIN (nomor telepon pengunci) wajib diisi untuk melakukan unlock.',
             ]);
 
             $lockingUser = $payrollRun->lockedBy;
             $cleanInputPin = preg_replace('/\D/', '', (string) $validated['pin']);
             $cleanUserPhone = $lockingUser ? preg_replace('/\D/', '', (string) $lockingUser->phone) : '';
 
             // Normalize trailing digits if international / leading zero (e.g. 0812 vs 62812)
             $matchesPhone = false;
             if ($cleanUserPhone !== '' && $cleanInputPin !== '') {
                 if ($cleanUserPhone === $cleanInputPin) {
                     $matchesPhone = true;
                 } elseif (str_ends_with($cleanUserPhone, $cleanInputPin) || str_ends_with($cleanInputPin, $cleanUserPhone)) {
                     $matchesPhone = true;
                 }
             }
 
             if (! $matchesPhone) {
                 return back()->with('error', 'PIN tidak valid. Masukkan nomor telepon user yang melakukan lock payroll.');
             }
 
             $payrollRun->update([
                 'is_locked' => false,
                 'locked_at' => null,
                 'locked_by' => null,
             ]);
 
             return back()->with('success', 'Payroll berhasil di-unlock. Data sekarang dapat diedit.');
         }
 
         // If currently unlocked, lock it under current user
         $payrollRun->update([
             'is_locked' => true,
             'locked_at' => now(),
             'locked_by' => $user->id,
         ]);
 
         return back()->with('success', "Payroll berhasil di-lock oleh {$user->name}. Admin lain tidak dapat mengubah data tanpa PIN.");
     }
 
     public function updateItem(PayrollRun $payrollRun, PayrollItem $payrollItem, Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);
        abort_unless((int) $payrollItem->payroll_run_id === (int) $payrollRun->id, 404);

        if ($payrollRun->is_saved) {
            return back()->with('error', 'Payroll yang sudah disimpan tidak bisa diedit.');
        }

        if ($payrollRun->is_locked && (int) $payrollRun->locked_by !== (int) $request->user()->id) {
            $lockedByName = $payrollRun->lockedBy?->name ?? 'Admin lain';
            return back()->with('error', "Payroll sedang di-lock oleh {$lockedByName}. Hanya user tersebut yang dapat mengedit atau melakukan unlock.");
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
            'bpjs_kesehatan_company' => ['nullable', 'numeric', 'min:0'],
            'bpjs_kesehatan_employee' => ['nullable', 'numeric', 'min:0'],
            'bpjs_jkk_company' => ['nullable', 'numeric', 'min:0'],
            'bpjs_jkm_company' => ['nullable', 'numeric', 'min:0'],
            'bpjs_jht_company' => ['nullable', 'numeric', 'min:0'],
            'bpjs_jht_employee' => ['nullable', 'numeric', 'min:0'],
            'bpjs_jp_company' => ['nullable', 'numeric', 'min:0'],
            'bpjs_jp_employee' => ['nullable', 'numeric', 'min:0'],
            'private_insurance_name' => ['nullable', 'string', 'max:100'],
            'private_insurance_nominal' => ['nullable', 'numeric', 'min:0'],
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

        $bpjsTotalCompany = round(
            (float) $payrollItem->bpjs_kesehatan_company
            + (float) $payrollItem->bpjs_jkk_company
            + (float) $payrollItem->bpjs_jkm_company
            + (float) $payrollItem->bpjs_jht_company
            + (float) $payrollItem->bpjs_jp_company,
            2
        );

        $bpjsTotalEmployee = round(
            (float) $payrollItem->bpjs_kesehatan_employee
            + (float) $payrollItem->bpjs_jht_employee
            + (float) $payrollItem->bpjs_jp_employee
            + (float) $payrollItem->private_insurance_nominal,
            2
        );

        $deductionsTotal = round(
            (float) $payrollItem->pph21_deduction
            + (float) $payrollItem->kasbon_deduction
            + (float) $payrollItem->denda_deduction
            + (float) $payrollItem->unpaid_leave_deduction
            + $bpjsTotalEmployee,
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
            'bpjs_total_company' => $bpjsTotalCompany,
            'bpjs_total_employee' => $bpjsTotalEmployee,
            'deductions_total' => $deductionsTotal,
            'net_salary' => $netSalary,
        ])->save();

        $this->refreshPayrollRunTotals($payrollRun);

        return to_route('hris.payrolls.index', ['period' => $payrollRun->period, 'type' => $payrollRun->type ?? 'regular'])
            ->with('success', 'Item payroll berhasil diperbarui.');
    }

    /**
     * Export full payroll records to CSV.
     */
    public function exportCsv(PayrollRun $payrollRun, Request $request): StreamedResponse
    {
        if (in_array(strtolower((string) $request->query('format')), ['excel', 'xlsx', 'xls'], true)) {
            return $this->exportExcel($payrollRun, $request);
        }

        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);

        $payrollRun->loadMissing([
            'items.employee:id,employee_code,first_name,last_name,sub_company_id,division_id,position_id,employment_status,ktp_number,npwp_number,ptkp_category',
            'items.employee.subCompany:id,code,name',
            'items.employee.division:id,name',
            'items.employee.position:id,name',
            'items.employee.bankAccounts' => fn ($q) => $q->where('is_primary', true)->limit(1),
        ]);

        $subCompanyId = $request->integer('sub_company_id') ?: null;
        $items = $payrollRun->items
            ->when($subCompanyId !== null, fn ($collection) => $collection->filter(
                fn ($item) => (int) ($item->employee?->sub_company_id ?? 0) === (int) $subCompanyId
            ))
            ->values();

        $isThr = $payrollRun->type === 'thr';
        $prefix = $isThr ? 'thr_' : 'payroll_';
        $statusSuffix = $payrollRun->is_saved ? '' : '_draft';
        $filename = $prefix.$payrollRun->period.$statusSuffix.'.csv';

        $fixedAllowanceNames = $items
            ->flatMap(fn ($item) => array_keys($item->allowance_breakdown ?? []))
            ->unique()
            ->values()
            ->all();

        return response()->streamDownload(function () use ($items, $isThr, $fixedAllowanceNames): void {
            $out = fopen('php://output', 'wb');
            // BOM for UTF-8 Excel compatibility
            fwrite($out, "\xEF\xBB\xBF");

            if ($isThr) {
                $totalBaseSalary = 0;
                $totalThrAmount = 0;
                $totalPph21 = 0;
                $totalNetSalary = 0;

                foreach ($items as $item) {
                    $totalBaseSalary += (float) $item->base_salary;
                    $totalThrAmount += (float) ($item->thr_amount ?: $item->net_salary);
                    $totalPph21 += (float) $item->pph21_deduction;
                    $totalNetSalary += (float) $item->net_salary;
                }

                // Baris Total di atas header
                fputcsv($out, [
                    'TOTAL',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    (int) round($totalBaseSalary),
                    '',
                    (int) round($totalThrAmount),
                    (int) round($totalPph21),
                    (int) round($totalNetSalary),
                ]);

                fputcsv($out, [
                    'No',
                    'NIK',
                    'Nama Karyawan',
                    'No. KTP',
                    'No. NPWP',
                    'Status Pajak',
                    'Perusahaan / Entitas',
                    'Divisi',
                    'Jabatan',
                    'Status Karyawan',
                    'Bank',
                    'No Rekening',
                    'Atas Nama',
                    'Gaji Pokok',
                    'Masa Kerja (Bulan)',
                    'Nominal THR',
                    'PPh 21',
                    'Total THR Bersih',
                ]);

                $no = 1;
                foreach ($items as $item) {
                    $employee = $item->employee;
                    $bank = $employee?->bankAccounts->first();

                    fputcsv($out, [
                        $no++,
                        $employee?->employee_code ?? '',
                        $employee?->full_name ?? '-',
                        $employee?->ktp_number ? "'".$employee->ktp_number : '-',
                        $employee?->npwp_number ? "'".$employee->npwp_number : '-',
                        $employee?->ptkp_category ?? '-',
                        $employee?->subCompany?->name ?? 'Internal',
                        $employee?->division?->name ?? '-',
                        $employee?->position?->name ?? '-',
                        $employee?->employment_status ?? '-',
                        strtoupper($bank?->bank_name ?? ''),
                        $bank?->account_number ?? '',
                        $bank?->account_holder_name ?? '',
                        (int) round((float) $item->base_salary),
                        $item->thr_months_of_service ?? 0,
                        (int) round((float) ($item->thr_amount ?: $item->net_salary)),
                        (int) round((float) $item->pph21_deduction),
                        (int) round((float) $item->net_salary),
                    ]);
                }
            } else {
                $headers = [
                    'No',
                    'NIK',
                    'Nama Karyawan',
                    'No. KTP',
                    'No. NPWP',
                    'Status Pajak',
                    'Perusahaan / Entitas',
                    'Divisi',
                    'Jabatan',
                    'Status Karyawan',
                    'Bank',
                    'No Rekening',
                    'Atas Nama',
                    'Gaji Pokok',
                ];

                foreach ($fixedAllowanceNames as $allowanceName) {
                    $headers[] = str_starts_with(strtolower($allowanceName), 'tunjangan')
                        ? $allowanceName
                        : 'Tunjangan '.$allowanceName;
                }

                $headers[] = 'Total Tunjangan Diterima';
                $headers[] = 'Jam Lembur';
                $headers[] = 'Uang Lembur';
                $headers[] = 'Benefit - BPJS TK Perusahaan';
                $headers[] = 'Benefit - BPJS Kes Perusahaan';
                $headers[] = 'Benefit - Tunjangan PPh 21';
                $headers[] = 'Potongan PPh 21';
                $headers[] = 'BPJS TK Karyawan';
                $headers[] = 'BPJS Kes Karyawan';
                $headers[] = 'Asuransi Swasta';
                $headers[] = 'Potongan Kasbon';
                $headers[] = 'Potongan Denda';
                $headers[] = 'Potongan Unpaid Leave';
                $headers[] = 'Total Potongan';
                $headers[] = 'Gaji Bersih';

                // Hitung total untuk setiap kolom nominal
                $totalBaseSalary = 0;
                $totalAllowancesByName = array_fill_keys($fixedAllowanceNames, 0);
                $totalAllowancesReceived = 0;
                $totalOvertimeHours = 0;
                $totalOvertimePay = 0;
                $totalBpjsTkCompany = 0;
                $totalBpjsKesCompany = 0;
                $totalPph21Allowance = 0;
                $totalPph21Deduction = 0;
                $totalBpjsTkEmployee = 0;
                $totalBpjsKesEmployee = 0;
                $totalPrivateInsurance = 0;
                $totalKasbon = 0;
                $totalDenda = 0;
                $totalUnpaidLeave = 0;
                $totalDeductions = 0;
                $totalNetSalary = 0;

                foreach ($items as $item) {
                    $bpjsTkCompany = round((float) $item->bpjs_jkk_company + (float) $item->bpjs_jkm_company + (float) $item->bpjs_jht_company + (float) $item->bpjs_jp_company, 2);
                    $bpjsTkEmployee = round((float) $item->bpjs_jht_employee + (float) $item->bpjs_jp_employee, 2);
                    $employeePph21 = $item->pph21_method === 'gross_up' ? 0.0 : (float) $item->pph21_deduction;
                    $allowanceBreakdown = $item->allowance_breakdown ?? [];

                    $totalBaseSalary += (float) $item->base_salary;
                    foreach ($fixedAllowanceNames as $allowanceName) {
                        $totalAllowancesByName[$allowanceName] += (float) ($allowanceBreakdown[$allowanceName] ?? 0);
                    }
                    $totalAllowancesReceived += (float) $item->allowances_total;
                    $totalOvertimeHours += (float) $item->overtime_hours;
                    $totalOvertimePay += (float) $item->overtime_pay;
                    $totalBpjsTkCompany += $bpjsTkCompany;
                    $totalBpjsKesCompany += (float) $item->bpjs_kesehatan_company;
                    $totalPph21Allowance += (float) $item->pph21_allowance;
                    $totalPph21Deduction += $employeePph21;
                    $totalBpjsTkEmployee += $bpjsTkEmployee;
                    $totalBpjsKesEmployee += (float) $item->bpjs_kesehatan_employee;
                    $totalPrivateInsurance += (float) $item->private_insurance_nominal;
                    $totalKasbon += (float) $item->kasbon_deduction;
                    $totalDenda += (float) $item->denda_deduction;
                    $totalUnpaidLeave += (float) $item->unpaid_leave_deduction;
                    $totalDeductions += (float) $item->deductions_total;
                    $totalNetSalary += (float) $item->net_salary;
                }

                $totalsRow = [
                    'TOTAL',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    (int) round($totalBaseSalary),
                ];

                foreach ($fixedAllowanceNames as $allowanceName) {
                    $totalsRow[] = (int) round($totalAllowancesByName[$allowanceName]);
                }

                $totalsRow[] = (int) round($totalAllowancesReceived);
                $totalsRow[] = round($totalOvertimeHours, 2);
                $totalsRow[] = (int) round($totalOvertimePay);
                $totalsRow[] = (int) round($totalBpjsTkCompany);
                $totalsRow[] = (int) round($totalBpjsKesCompany);
                $totalsRow[] = (int) round($totalPph21Allowance);
                $totalsRow[] = (int) round($totalPph21Deduction);
                $totalsRow[] = (int) round($totalBpjsTkEmployee);
                $totalsRow[] = (int) round($totalBpjsKesEmployee);
                $totalsRow[] = (int) round($totalPrivateInsurance);
                $totalsRow[] = (int) round($totalKasbon);
                $totalsRow[] = (int) round($totalDenda);
                $totalsRow[] = (int) round($totalUnpaidLeave);
                $totalsRow[] = (int) round($totalDeductions);
                $totalsRow[] = (int) round($totalNetSalary);

                // Baris Total di atas nama table header
                fputcsv($out, $totalsRow);

                // Baris Header
                fputcsv($out, $headers);

                $no = 1;
                foreach ($items as $item) {
                    $employee = $item->employee;
                    $bank = $employee?->bankAccounts->first();
                    $bpjsTkCompany = round((float) $item->bpjs_jkk_company + (float) $item->bpjs_jkm_company + (float) $item->bpjs_jht_company + (float) $item->bpjs_jp_company, 2);
                    $bpjsTkEmployee = round((float) $item->bpjs_jht_employee + (float) $item->bpjs_jp_employee, 2);
                    $employeePph21 = $item->pph21_method === 'gross_up' ? 0.0 : (float) $item->pph21_deduction;

                    $row = [
                        $no++,
                        $employee?->employee_code ?? '',
                        $employee?->full_name ?? '-',
                        $employee?->ktp_number ? "'".$employee->ktp_number : '-',
                        $employee?->npwp_number ? "'".$employee->npwp_number : '-',
                        $employee?->ptkp_category ?? '-',
                        $employee?->subCompany?->name ?? 'Internal',
                        $employee?->division?->name ?? '-',
                        $employee?->position?->name ?? '-',
                        $employee?->employment_status ?? '-',
                        strtoupper($bank?->bank_name ?? ''),
                        $bank?->account_number ?? '',
                        $bank?->account_holder_name ?? '',
                        (int) round((float) $item->base_salary),
                    ];

                    $allowanceBreakdown = $item->allowance_breakdown ?? [];
                    foreach ($fixedAllowanceNames as $allowanceName) {
                        $row[] = (int) round((float) ($allowanceBreakdown[$allowanceName] ?? 0));
                    }

                    $row[] = (int) round((float) $item->allowances_total);
                    $row[] = (float) $item->overtime_hours;
                    $row[] = (int) round((float) $item->overtime_pay);

                    // Benefit (Ditanggung Perusahaan)
                    $row[] = (int) round((float) $bpjsTkCompany);
                    $row[] = (int) round((float) $item->bpjs_kesehatan_company);
                    $row[] = (int) round((float) $item->pph21_allowance);

                    // Potongan (Mengurangi gaji karyawan)
                    $row[] = (int) round($employeePph21);
                    $row[] = (int) round((float) $bpjsTkEmployee);
                    $row[] = (int) round((float) $item->bpjs_kesehatan_employee);
                    $row[] = (int) round((float) $item->private_insurance_nominal);
                    $row[] = (int) round((float) $item->kasbon_deduction);
                    $row[] = (int) round((float) $item->denda_deduction);
                    $row[] = (int) round((float) $item->unpaid_leave_deduction);
                    $row[] = (int) round((float) $item->deductions_total);
                    $row[] = (int) round((float) $item->net_salary);

                    fputcsv($out, $row);
                }
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Export full payroll records to Excel (XLSX).
     */
    public function exportExcel(PayrollRun $payrollRun, Request $request): StreamedResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_if((int) $payrollRun->user_id !== $ownerId, 403);

        $payrollRun->loadMissing([
            'items.employee:id,employee_code,first_name,last_name,sub_company_id,division_id,position_id,employment_status,ktp_number,npwp_number,ptkp_category',
            'items.employee.subCompany:id,code,name',
            'items.employee.division:id,name',
            'items.employee.position:id,name',
            'items.employee.bankAccounts' => fn ($q) => $q->where('is_primary', true)->limit(1),
        ]);

        $subCompanyId = $request->integer('sub_company_id') ?: null;
        $items = $payrollRun->items
            ->when($subCompanyId !== null, fn ($collection) => $collection->filter(
                fn ($item) => (int) ($item->employee?->sub_company_id ?? 0) === (int) $subCompanyId
            ))
            ->values();

        $isThr = $payrollRun->type === 'thr';
        $prefix = $isThr ? 'thr_' : 'payroll_';
        $statusSuffix = $payrollRun->is_saved ? '' : '_draft';
        $filename = $prefix.$payrollRun->period.$statusSuffix.'.xlsx';

        $fixedAllowanceNames = $items
            ->flatMap(fn ($item) => array_keys($item->allowance_breakdown ?? []))
            ->unique()
            ->values()
            ->all();

        return response()->streamDownload(function () use ($items, $isThr, $fixedAllowanceNames): void {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($isThr ? 'THR' : 'Payroll');

            $dataRowCount = $items->count();
            $lastDataRow = $dataRowCount > 0 ? (2 + $dataRowCount) : 3;

            if ($isThr) {
                $headers = [
                    'No',
                    'NIK',
                    'Nama Karyawan',
                    'No. KTP',
                    'No. NPWP',
                    'Status Pajak',
                    'Perusahaan / Entitas',
                    'Divisi',
                    'Jabatan',
                    'Status Karyawan',
                    'Bank',
                    'No Rekening',
                    'Atas Nama',
                    'Gaji Pokok',
                    'Masa Kerja (Bulan)',
                    'Nominal THR',
                    'PPh 21',
                    'Total THR Bersih',
                ];

                // Baris 1: TOTAL DI ATAS HEADER
                $sheet->setCellValue('A1', 'TOTAL');
                $sheet->setCellValue('N1', "=SUM(N3:N{$lastDataRow})");
                $sheet->setCellValue('P1', "=SUM(P3:P{$lastDataRow})");
                $sheet->setCellValue('Q1', "=SUM(Q3:Q{$lastDataRow})");
                $sheet->setCellValue('R1', "=SUM(R3:R{$lastDataRow})");

                $sheet->getStyle('A1:R1')->getFont()->setBold(true);
                $sheet->getStyle('A1:R1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE2E8F0');
                $sheet->getStyle('N1:R1')->getNumberFormat()->setFormatCode('#,##0');

                // Baris 2: TABLE HEADERS
                foreach ($headers as $colIdx => $header) {
                    $colLetter = Coordinate::stringFromColumnIndex($colIdx + 1);
                    $sheet->setCellValue("{$colLetter}2", $header);
                }
                $sheet->getStyle('A2:R2')->getFont()->setBold(true);
                $sheet->getStyle('A2:R2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF1F5F9');

                // Baris 3..N: DATA ROWS
                $currentRow = 3;
                $no = 1;
                foreach ($items as $item) {
                    $employee = $item->employee;
                    $bank = $employee?->bankAccounts->first();

                    $sheet->setCellValue("A{$currentRow}", $no++);
                    $sheet->setCellValueExplicit("B{$currentRow}", (string) ($employee?->employee_code ?? ''), DataType::TYPE_STRING);
                    $sheet->setCellValue("C{$currentRow}", $employee?->full_name ?? '-');
                    $sheet->setCellValueExplicit("D{$currentRow}", (string) ($employee?->ktp_number ?? '-'), DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit("E{$currentRow}", (string) ($employee?->npwp_number ?? '-'), DataType::TYPE_STRING);
                    $sheet->setCellValue("F{$currentRow}", $employee?->ptkp_category ?? '-');
                    $sheet->setCellValue("G{$currentRow}", $employee?->subCompany?->name ?? 'Internal');
                    $sheet->setCellValue("H{$currentRow}", $employee?->division?->name ?? '-');
                    $sheet->setCellValue("I{$currentRow}", $employee?->position?->name ?? '-');
                    $sheet->setCellValue("J{$currentRow}", $employee?->employment_status ?? '-');
                    $sheet->setCellValue("K{$currentRow}", strtoupper($bank?->bank_name ?? ''));
                    $sheet->setCellValueExplicit("L{$currentRow}", (string) ($bank?->account_number ?? ''), DataType::TYPE_STRING);
                    $sheet->setCellValue("M{$currentRow}", $bank?->account_holder_name ?? '');
                    $sheet->setCellValue("N{$currentRow}", (int) round((float) $item->base_salary));
                    $sheet->setCellValue("O{$currentRow}", (int) ($item->thr_months_of_service ?? 0));
                    $sheet->setCellValue("P{$currentRow}", (int) round((float) ($item->thr_amount ?: $item->net_salary)));
                    $sheet->setCellValue("Q{$currentRow}", (int) round((float) $item->pph21_deduction));
                    $sheet->setCellValue("R{$currentRow}", (int) round((float) $item->net_salary));

                    $sheet->getStyle("N{$currentRow}:R{$currentRow}")->getNumberFormat()->setFormatCode('#,##0');
                    $currentRow++;
                }

                for ($col = 1; $col <= count($headers); $col++) {
                    $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($col))->setAutoSize(true);
                }
            } else {
                $headers = [
                    'No',
                    'NIK',
                    'Nama Karyawan',
                    'No. KTP',
                    'No. NPWP',
                    'Status Pajak',
                    'Perusahaan / Entitas',
                    'Divisi',
                    'Jabatan',
                    'Status Karyawan',
                    'Bank',
                    'No Rekening',
                    'Atas Nama',
                    'Gaji Pokok',
                ];

                foreach ($fixedAllowanceNames as $allowanceName) {
                    $headers[] = str_starts_with(strtolower($allowanceName), 'tunjangan')
                        ? $allowanceName
                        : 'Tunjangan '.$allowanceName;
                }

                $headers[] = 'Total Tunjangan Diterima';
                $headers[] = 'Jam Lembur';
                $headers[] = 'Uang Lembur';
                $headers[] = 'Benefit - BPJS TK Perusahaan';
                $headers[] = 'Benefit - BPJS Kes Perusahaan';
                $headers[] = 'Benefit - Tunjangan PPh 21';
                $headers[] = 'Potongan PPh 21';
                $headers[] = 'BPJS TK Karyawan';
                $headers[] = 'BPJS Kes Karyawan';
                $headers[] = 'Asuransi Swasta';
                $headers[] = 'Potongan Kasbon';
                $headers[] = 'Potongan Denda';
                $headers[] = 'Potongan Unpaid Leave';
                $headers[] = 'Total Potongan';
                $headers[] = 'Gaji Bersih';

                $totalCols = count($headers);
                $lastColLetter = Coordinate::stringFromColumnIndex($totalCols);

                // Baris 1: TOTAL DI ATAS HEADER
                $sheet->setCellValue('A1', 'TOTAL');

                // Isi SUM untuk setiap kolom nominal (mulai kolom 14 = Gaji Pokok hingga kolom terakhir)
                for ($colIdx = 14; $colIdx <= $totalCols; $colIdx++) {
                    $colLetter = Coordinate::stringFromColumnIndex($colIdx);
                    $sheet->setCellValue("{$colLetter}1", "=SUM({$colLetter}3:{$colLetter}{$lastDataRow})");
                }

                $sheet->getStyle("A1:{$lastColLetter}1")->getFont()->setBold(true);
                $sheet->getStyle("A1:{$lastColLetter}1")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE2E8F0');
                $sheet->getStyle("N1:{$lastColLetter}1")->getNumberFormat()->setFormatCode('#,##0');

                // Baris 2: TABLE HEADERS
                foreach ($headers as $colIdx => $header) {
                    $colLetter = Coordinate::stringFromColumnIndex($colIdx + 1);
                    $sheet->setCellValue("{$colLetter}2", $header);
                }
                $sheet->getStyle("A2:{$lastColLetter}2")->getFont()->setBold(true);
                $sheet->getStyle("A2:{$lastColLetter}2")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF1F5F9');

                // Baris 3..N: DATA ROWS
                $currentRow = 3;
                $no = 1;
                foreach ($items as $item) {
                    $employee = $item->employee;
                    $bank = $employee?->bankAccounts->first();
                    $bpjsTkCompany = round((float) $item->bpjs_jkk_company + (float) $item->bpjs_jkm_company + (float) $item->bpjs_jht_company + (float) $item->bpjs_jp_company, 2);
                    $bpjsTkEmployee = round((float) $item->bpjs_jht_employee + (float) $item->bpjs_jp_employee, 2);
                    $employeePph21 = $item->pph21_method === 'gross_up' ? 0.0 : (float) $item->pph21_deduction;
                    $allowanceBreakdown = $item->allowance_breakdown ?? [];

                    $colNum = 1;
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $no++);
                    $sheet->setCellValueExplicit(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (string) ($employee?->employee_code ?? ''), DataType::TYPE_STRING);
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $employee?->full_name ?? '-');
                    $sheet->setCellValueExplicit(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (string) ($employee?->ktp_number ?? '-'), DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (string) ($employee?->npwp_number ?? '-'), DataType::TYPE_STRING);
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $employee?->ptkp_category ?? '-');
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $employee?->subCompany?->name ?? 'Internal');
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $employee?->division?->name ?? '-');
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $employee?->position?->name ?? '-');
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $employee?->employment_status ?? '-');
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", strtoupper($bank?->bank_name ?? ''));
                    $sheet->setCellValueExplicit(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (string) ($bank?->account_number ?? ''), DataType::TYPE_STRING);
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", $bank?->account_holder_name ?? '');
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->base_salary));

                    foreach ($fixedAllowanceNames as $allowanceName) {
                        $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) ($allowanceBreakdown[$allowanceName] ?? 0)));
                    }

                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->allowances_total));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (float) $item->overtime_hours);
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->overtime_pay));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $bpjsTkCompany));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->bpjs_kesehatan_company));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->pph21_allowance));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round($employeePph21));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $bpjsTkEmployee));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->bpjs_kesehatan_employee));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->private_insurance_nominal));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->kasbon_deduction));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->denda_deduction));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->unpaid_leave_deduction));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->deductions_total));
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colNum++)."{$currentRow}", (int) round((float) $item->net_salary));

                    $sheet->getStyle("N{$currentRow}:{$lastColLetter}{$currentRow}")->getNumberFormat()->setFormatCode('#,##0');
                    $currentRow++;
                }

                for ($col = 1; $col <= $totalCols; $col++) {
                    $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($col))->setAutoSize(true);
                }
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
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
