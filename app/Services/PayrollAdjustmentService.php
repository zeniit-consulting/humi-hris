<?php

namespace App\Services;

use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayrollAdjustmentService
{
    public function initializeAdditional(PayrollItem $item): void
    {
        foreach ($item->getCasts() as $field => $cast) {
            if (str_starts_with($cast, 'decimal:')) {
                $item->$field = 0;
            }
        }
        $item->forceFill([
            'is_prorated' => false, 'proration_factor' => 1,
            'proration_payable_days' => null, 'proration_working_days' => null,
            'allowance_breakdown' => [], 'variable_allowance_breakdown' => [],
            'bonus_breakdown' => [], 'denda_breakdown' => [], 'manual_deduction_breakdown' => [],
            'calculation_basis' => ['base_salary' => 0, 'fixed_allowances' => [], 'monthly' => false],
            'tax_reviewed' => false,
        ]);
        $this->calculateTax($item);
    }

    public function update(PayrollItem $item, array $input): void
    {
        DB::transaction(function () use ($item, $input): void {
            $run = PayrollRun::query()->lockForUpdate()->findOrFail($item->payroll_run_id);
            if ($run->isReleased() || $run->is_saved) {
                throw ValidationException::withMessages(['payroll' => 'Payroll yang sudah dirilis tidak bisa diedit.']);
            }
            $item->refresh();
            if (! empty($input['reset_overrides'])) {
                if ($run->is_locked) {
                    throw ValidationException::withMessages(['payroll' => 'Unlock draft sebelum mengembalikan nilai otomatis.']);
                }
                $item->forceFill(['manual_overrides' => null, 'calculation_basis' => null])->save();
                app(PayrollGenerationService::class)->recalculateRun($run);

                return;
            }
            // Inertia submits the full form. Only changed values become overrides.
            $changes = [];
            foreach ($input as $key => $value) {
                if (in_array($key, ['fixed_allowances', 'variable_allowances', 'bonuses', 'manual_deductions'], true)) {
                    $field = ['fixed_allowances' => 'allowance_breakdown', 'variable_allowances' => 'variable_allowance_breakdown', 'bonuses' => 'bonus_breakdown', 'manual_deductions' => 'manual_deduction_breakdown'][$key];
                    $current = $key === 'fixed_allowances' ? ($item->calculation_basis['fixed_allowances'] ?? $item->$field ?? []) : ($item->$field ?? []);
                    if ($this->breakdown($value ?? []) != $current) {
                        $changes[$key] = $value ?? [];
                    }
                } elseif (is_array($value)) {
                    if ($value != $item->$key) {
                        $changes[$key] = $value;
                    }
                } elseif ($key === 'reset_overrides' || $key === 'tax_reviewed' || (string) $item->$key !== (string) $value && (! is_numeric($value) || (float) $item->$key !== (float) $value)) {
                    $changes[$key] = $value;
                }
            }
            if (isset($changes['base_salary'])) {
                $factor = $item->proration_working_days > 0 && $item->proration_payable_days !== null
                    ? $item->proration_payable_days / $item->proration_working_days : (float) ($item->proration_factor ?? 1);
                if ($factor <= 0) {
                    throw ValidationException::withMessages(['base_salary' => 'Ubah pembilang prorate dari nol sebelum mengedit gaji pokok.']);
                }
                $changes['base_salary_basis'] = round($changes['base_salary'] / $factor, 2);
                unset($changes['base_salary']);
            }
            $overrides = array_replace($item->manual_overrides ?? [], $changes);
            unset($overrides['reset_overrides']);
            if (array_intersect(['fixed_allowances', 'variable_allowances', 'bonuses', 'proration_payable_days', 'allowances_total'], array_keys($changes))) {
                unset($overrides['legacy_allowances_total']);
            }
            $this->apply($item, $overrides);
            $item->manual_overrides = $overrides;
            $item->save();
            $this->refreshTotals($run);
        });
    }

    public function apply(PayrollItem $item, array $input): void
    {
        $basis = $item->calculation_basis;
        if (! $basis) {
            $factor = (float) $item->proration_factor;
            $basis = [
                'base_salary' => $factor > 0 ? round((float) $item->base_salary / $factor, 2) : (float) $item->employee?->base_salary,
                'fixed_allowances' => collect($item->allowance_breakdown ?? [])->map(fn ($v) => $factor > 0 ? round($v / $factor, 2) : 0)->all(),
                'monthly' => $item->employee?->employment_type !== 'DW' && $item->payrollRun->type !== 'thr',
            ];
        }
        $run = $item->payrollRun;
        if (isset($input['base_salary_basis'])) {
            $basis['base_salary'] = (float) $input['base_salary_basis'];
            $factor = $item->proration_working_days > 0 && $item->proration_payable_days !== null ? $item->proration_payable_days / $item->proration_working_days : (float) ($item->proration_factor ?? 1);
            $item->base_salary = round($basis['base_salary'] * $factor, 2);
        }
        if (isset($input['proration_payable_days']) && (! ($basis['monthly'] ?? false) || $run->batch_purpose === 'additional')) {
            throw ValidationException::withMessages(['proration_payable_days' => 'Prorate hanya berlaku untuk gaji bulanan reguler.']);
        }
        if (isset($input['proration_payable_days'])) {
            $days = (int) $input['proration_payable_days'];
            $denominator = (int) $item->proration_working_days;
            if ($denominator < 1 || $days < 0 || $days > $denominator) {
                throw ValidationException::withMessages(['proration_payable_days' => 'Pembilang harus antara 0 dan jumlah hari kerja aktif.']);
            }
            $item->proration_payable_days = $days;
            $item->proration_factor = round($days / $denominator, 6);
            $item->is_prorated = $days < $denominator;
            $item->base_salary = round($basis['base_salary'] * $days / $denominator, 2);
        }
        if (array_key_exists('base_salary', $input) && $input['base_salary'] !== null) {
            $item->base_salary = $input['base_salary'];
        }
        $fixedBasis = isset($input['fixed_allowances']) ? $this->breakdown($input['fixed_allowances']) : ($basis['fixed_allowances'] ?? []);
        $basis['fixed_allowances'] = $fixedBasis;
        $item->calculation_basis = $basis;
        if (isset($input['fixed_allowances']) || isset($input['proration_payable_days'])) {
            $factor = ($basis['monthly'] ?? false) && $item->proration_working_days > 0
                ? $item->proration_payable_days / $item->proration_working_days : 1;
            $item->allowance_breakdown = collect($fixedBasis)->map(fn ($v) => round($v * $factor, 2))->all();
        }
        foreach (['variable_allowances' => 'variable_allowance_breakdown', 'bonuses' => 'bonus_breakdown', 'manual_deductions' => 'manual_deduction_breakdown'] as $key => $field) {
            if (array_key_exists($key, $input)) {
                $item->$field = $this->breakdown($input[$key] ?? []);
            }
        }
        $item->manual_deduction_total = round(array_sum($item->manual_deduction_breakdown ?? []), 2);
        if (array_intersect(['fixed_allowances', 'proration_payable_days', 'variable_allowances', 'bonuses'], array_keys($input))) {
            $item->allowances_total = round(array_sum($item->allowance_breakdown ?? []) + array_sum($item->variable_allowance_breakdown ?? []) + array_sum($item->bonus_breakdown ?? []), 2);
        } elseif (isset($input['allowances_total'])) {
            $item->allowances_total = $input['allowances_total'];
        }
        if (isset($input['legacy_allowances_total'])) {
            $item->allowances_total = $input['legacy_allowances_total'];
        }
        foreach ($input as $key => $value) {
            if (in_array($key, $item->getFillable(), true) && ! in_array($key, ['base_salary', 'allowances_total', 'proration_payable_days', 'tax_reviewed'], true)) {
                $item->$key = $value;
            }
        }
        if ($run->batch_purpose === 'additional') {
            foreach (['kasbon_deduction', 'denda_deduction', 'unpaid_leave_deduction', 'private_insurance_nominal', 'bpjs_kesehatan_company', 'bpjs_kesehatan_employee', 'bpjs_jkk_company', 'bpjs_jkm_company', 'bpjs_jht_company', 'bpjs_jht_employee', 'bpjs_jp_company', 'bpjs_jp_employee'] as $field) {
                $item->$field = 0;
            }
        }
        if ($run->batch_purpose !== 'additional' && ($basis['unpaid_days'] ?? 0) > 0 && $item->proration_working_days > 0) {
            $item->unpaid_leave_deduction = round((($basis['base_salary'] + array_sum($fixedBasis)) / $item->proration_working_days) * $basis['unpaid_days'], 2);
        }
        $taxFields = array_intersect_key($input, array_flip(['pph21_allowance', 'pph21_deduction', 'pph21_company_borne', 'pph21_rate']));
        $this->calculateTax($item);
        foreach ($taxFields as $key => $value) {
            $item->$key = $value ?? 0;
        }
        if ($taxFields || array_key_exists('tax_reviewed', $input)) {
            $item->tax_reviewed = (bool) ($input['tax_reviewed'] ?? true);
        }
        $this->itemTotals($item);
    }

    private function breakdown(array $rows): array
    {
        $result = [];
        foreach ($rows as $key => $row) {
            $name = is_array($row) ? trim($row['name']) : $key;
            $amount = is_array($row) ? (float) $row['amount'] : (float) $row;
            $result[$name] = round(($result[$name] ?? 0) + $amount, 2);
        }

        return $result;
    }

    private function previousItems(PayrollItem $item)
    {
        $run = $item->payrollRun;

        return PayrollItem::query()->where('user_id', $run->user_id)->where('employee_id', $item->employee_id)
            ->where('payroll_run_id', '!=', $run->id)
            ->whereHas('payrollRun', fn ($q) => $q->where('user_id', $run->user_id)->where('period', $run->period)->where('type', 'regular')->released())
            ->orderBy('id')->get();
    }

    public function calculateTax(PayrollItem $item): void
    {
        $method = $item->pph21_method;
        $additional = $item->payrollRun->batch_purpose === 'additional';
        $previous = $item->payrollRun->type === 'regular' ? $this->previousItems($item) : collect();
        $item->tax_basis_hash = hash('sha256', $previous->map(fn ($row) => $row->getAttributes())->toJson());
        if ($method === 'none') {
            $item->pph21_rate = $item->pph21_allowance = $item->pph21_deduction = $item->pph21_company_borne = 0;
            $item->tax_reviewed = true;

            return;
        }
        if (! in_array($method, ['ter_bulanan', 'ter_bulanan_net', 'ter_bulanan_gross_up'], true)) {
            if ($additional) {
                $item->tax_reviewed = false;
            }

            return;
        }
        $gross = fn ($row) => (float) $row->base_salary + (float) $row->allowances_total + (float) $row->overtime_pay
            + (float) $row->bpjs_jkk_company + (float) $row->bpjs_jkm_company + (float) $row->bpjs_kesehatan_company;
        $result = app(Pph21TerCalculatorService::class)->calculateMonthly(
            ($item->calculation_basis['ptkp_category'] ?? $item->employee?->ptkp_category) ?: 'TK/0', $gross($item) + $previous->sum($gross), $method,
        );
        $item->pph21_rate = $result['tax_rate_percent'];
        foreach (['allowance', 'deduction', 'company_borne'] as $key) {
            $field = 'pph21_'.$key;
            $item->$field = round(max(0, $result[$key] - (float) $previous->sum($field)), 2);
        }
        $item->tax_reviewed = true;
    }

    public function itemTotals(PayrollItem $item): void
    {
        $item->bpjs_total_company = round((float) $item->bpjs_kesehatan_company + (float) $item->bpjs_jkk_company + (float) $item->bpjs_jkm_company + (float) $item->bpjs_jht_company + (float) $item->bpjs_jp_company, 2);
        $item->bpjs_total_employee = round((float) $item->bpjs_kesehatan_employee + (float) $item->bpjs_jht_employee + (float) $item->bpjs_jp_employee + (float) $item->private_insurance_nominal, 2);
        $item->deductions_total = round((float) $item->pph21_deduction + (float) $item->kasbon_deduction + (float) $item->denda_deduction + (float) $item->unpaid_leave_deduction + (float) $item->manual_deduction_total + (float) $item->bpjs_total_employee, 2);
        $grossUp = in_array($item->pph21_method, ['gross_up', 'ter_bulanan_gross_up'], true);
        $item->net_salary = round(max(0, (float) $item->base_salary + (float) $item->allowances_total + (float) $item->overtime_pay - (float) $item->deductions_total + ($grossUp ? (float) $item->pph21_deduction : 0)), 2);
    }

    public function refreshTotals(PayrollRun $run): void
    {
        $items = $run->items()->get();
        $run->update([
            'employees_count' => $items->count(),
            'total_base_salary' => $items->sum('base_salary'), 'total_allowances' => $items->sum('allowances_total'),
            'total_deductions' => $items->sum('deductions_total'), 'total_net_salary' => $items->sum('net_salary'),
        ]);
    }

    public function release(PayrollRun $run, ?int $actorId, bool $requireLock = true): void
    {
        DB::transaction(function () use ($run, $actorId, $requireLock): void {
            // Serialize releases across this account, including different batches of the same employee.
            User::query()->whereKey($run->user_id)->lockForUpdate()->firstOrFail();
            $run = PayrollRun::query()->lockForUpdate()->findOrFail($run->id);
            if ($run->isReleased() || $run->is_saved) {
                return;
            }
            if ($requireLock && ! $run->is_locked) {
                throw ValidationException::withMessages(['payroll' => 'Kunci draft payroll terlebih dahulu.']);
            }
            foreach ($run->items()->with('employee')->get() as $item) {
                $previous = $this->previousItems($item);
                if ($run->type === 'regular' && $run->batch_purpose === 'regular' && $previous->contains(fn ($old) => $old->payrollRun->batch_purpose === 'regular')) {
                    throw ValidationException::withMessages(['payroll' => 'Karyawan sudah menerima payroll reguler periode ini. Gunakan batch tambahan.']);
                }
                if ($run->batch_purpose === 'additional' || in_array($item->pph21_method, ['ter_bulanan', 'ter_bulanan_net', 'ter_bulanan_gross_up'], true) && $item->tax_basis_hash) {
                    if (! $item->tax_reviewed || $item->tax_basis_hash !== hash('sha256', $previous->map(fn ($row) => $row->getAttributes())->toJson())) {
                        throw ValidationException::withMessages(['payroll' => 'Payroll sebelumnya berubah atau pajak tambahan belum ditinjau. Edit dan simpan kembali komponen pajak sebelum release.']);
                    }
                }
            }
            $run->update([
                'status' => 'released', 'is_saved' => true,
                'saved_at' => $run->saved_at ?? now(), 'saved_by' => $run->saved_by ?? $actorId,
                'released_at' => now(), 'released_by' => $actorId,
            ]);
        });
    }
}
