<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Hris\GeneratePayrollRequest;
use App\Models\PayrollRun;
use App\Models\User;
use App\Services\PayrollGenerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PayrollController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function preview(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'period' => ['nullable', 'date_format:Y-m'],
        ]);

        $period = $validated['period'] ?? now()->format('Y-m');

        $run = PayrollRun::query()
            ->with('items.employee:id,employee_code,first_name,last_name')
            ->where('period', $period)
            ->first();

        return $this->success($this->payload($period, $run, $user));
    }

    public function generate(GeneratePayrollRequest $request, PayrollGenerationService $payrolls): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $period = $request->validated('period');
        $run = $payrolls->generateForPeriod($ownerId, $period, $request->user()?->id);

        $run->load('items.employee:id,employee_code,first_name,last_name');

        return $this->success($this->payload($period, $run, $request->user()), 'Payroll berhasil di-generate.');
    }

    public function save(PayrollRun $payrollRun, Request $request): JsonResponse
    {
        $payrollRun->update([
            'is_saved' => true,
            'saved_at' => now(),
            'saved_by' => $request->user()?->id,
        ]);

        $payrollRun->load('items.employee:id,employee_code,first_name,last_name');

        return $this->success($this->payload($payrollRun->period, $payrollRun, $request->user()), 'Payroll berhasil disimpan.');
    }

    /**
     * Get payroll history (slip gaji bulan-bulan sebelumnya).
     */
    public function history(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $year = $request->input('year', now()->year);

        // Ambil semua payroll run tahun ini yang sudah saved (is_saved = true)
        $payrolls = PayrollRun::query()
            ->with([
                'items' => fn ($q) => $q
                    ->where('employee_id', $employee->id)
                    ->select(['id', 'payroll_run_id', 'employee_id', 'base_salary', 'allowances_total', 'deductions_total', 'net_salary']),
            ])
            ->where('user_id', $user->accountOwnerId())
            ->where('type', 'regular') // Hanya regular payroll, bukan THR
            ->whereYear('period_start', $year)
            ->where('is_saved', true)
            ->orderByDesc('period')
            ->get();

        $items = $payrolls->map(function ($payroll) {
            $item = $payroll->items->first();

            return [
                'period' => $payroll->period,
                'period_label' => Carbon::createFromFormat('Y-m', $payroll->period)->locale('id')->translatedFormat('F Y'),
                'period_start' => $payroll->period_start?->toDateString(),
                'period_end' => $payroll->period_end?->toDateString(),
                'base_salary' => (float) ($item?->base_salary ?? 0),
                'allowances_total' => (float) ($item?->allowances_total ?? 0),
                'deductions_total' => (float) ($item?->deductions_total ?? 0),
                'net_salary' => (float) ($item?->net_salary ?? 0),
                'generated_at' => $payroll->generated_at?->toDateTimeString(),
                'can_export' => true,
            ];
        })->values();

        return $this->success([
            'year' => $year,
            'items' => $items,
        ], 'Payroll history retrieved successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $period, ?PayrollRun $run, ?User $user = null): array
    {
        $items = $run?->items ?? collect();

        if ($run && $user && $this->isSelfServiceUser($user)) {
            $employee = $this->resolveRequiredSelfServiceEmployee($user);
            $items = $items->where('employee_id', $employee->id)->values();
        }

        return [
            'period' => $period,
            'run' => $run ? [
                'id' => $run->id,
                'period' => $run->period,
                'period_start' => $run->period_start?->format('Y-m-d'),
                'period_end' => $run->period_end?->format('Y-m-d'),
                'generated_at' => $run->generated_at?->toDateTimeString(),
                'generated_by' => $run->generated_by,
                'is_saved' => $run->is_saved,
                'saved_at' => $run->saved_at?->toDateTimeString(),
                'saved_by' => $run->saved_by,
                'employees_count' => $run->employees_count,
                'total_base_salary' => $run->total_base_salary,
                'total_allowances' => $run->total_allowances,
                'total_deductions' => $run->total_deductions,
                'total_net_salary' => $run->total_net_salary,
            ] : null,
            'items' => $run
                ? $items->map(fn ($item) => [
                    'id' => $item->id,
                    'employee_id' => $item->employee_id,
                    'employee_label' => $item->employee
                        ? $item->employee->employee_code.' - '.$item->employee->full_name
                        : '-',
                    'base_salary' => $item->base_salary,
                    'allowances_total' => $item->allowances_total,
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
                ])->values()
                : [],
        ];
    }
}
