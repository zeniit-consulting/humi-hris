<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasIndex('payroll_runs', 'payroll_runs_user_id_period_type_index')) {
            Schema::table('payroll_runs', fn (Blueprint $table) => $table->index(['user_id', 'period', 'type']));
        }
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropUnique('payroll_runs_user_id_period_type_unique');
            $table->string('code')->nullable()->unique();
            $table->string('batch_purpose')->default('regular');
            $table->json('selected_employee_ids')->nullable();
        });
        DB::table('payroll_runs')->orderBy('id')->each(function ($run) {
            DB::table('payroll_runs')->where('id', $run->id)->update([
                'selected_employee_ids' => json_encode(DB::table('payroll_items')->where('payroll_run_id', $run->id)->where('user_id', $run->user_id)->pluck('employee_id')->all()),
                'code' => ($run->type === 'thr' ? 'THR' : 'PAY').'-'.str_replace('-', '', $run->period).'-'.str_pad($run->id, 6, '0', STR_PAD_LEFT),
            ]);
        });
        Schema::table('payroll_items', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->text('company_details')->nullable();
            $table->json('calculation_basis')->nullable();
            $table->json('manual_overrides')->nullable();
            $table->boolean('tax_reviewed')->default(false);
            $table->string('tax_basis_hash', 64)->nullable();
        });
        DB::table('payroll_items')->orderBy('id')->each(function ($item) {
            $employee = DB::table('employees')->where('user_id', $item->user_id)->where('id', $item->employee_id)->first();
            $sub = $employee?->sub_company_id ? DB::table('sub_companies')->where('user_id', $item->user_id)->where('id', $employee->sub_company_id)->first() : null;
            $company = DB::table('company_settings')->where('user_id', $item->user_id)->first();
            $factor = (float) ($item->proration_factor ?? 1);
            $fixed = json_decode($item->allowance_breakdown ?: '{}', true) ?: [];
            $fullFixed = array_map(fn ($amount) => $factor > 0 ? round($amount / $factor, 2) : 0, $fixed);
            $run = DB::table('payroll_runs')->where('id', $item->payroll_run_id)->first();
            $overrides = [];
            if ($run && ! $run->is_saved && $run->status !== 'released') {
                foreach (['base_salary', 'allowances_total', 'overtime_hours', 'overtime_pay', 'pph21_rate', 'pph21_allowance', 'pph21_deduction', 'pph21_company_borne', 'kasbon_deduction', 'denda_deduction', 'bpjs_kesehatan_company', 'bpjs_kesehatan_employee', 'bpjs_jkk_company', 'bpjs_jkm_company', 'bpjs_jht_company', 'bpjs_jht_employee', 'bpjs_jp_company', 'bpjs_jp_employee', 'private_insurance_name', 'private_insurance_nominal'] as $field) {
                    $overrides[$field] = $item->$field;
                }
                $overrides['base_salary_basis'] = $factor > 0 ? round($item->base_salary / $factor, 2) : (float) ($employee?->base_salary ?? 0);
                unset($overrides['base_salary']);
                $overrides['fixed_allowances'] = $fullFixed;
                $overrides['denda_breakdown'] = json_decode($item->denda_breakdown ?: '[]', true) ?: [];
                foreach (['variable_allowances' => 'variable_allowance_breakdown', 'bonuses' => 'bonus_breakdown', 'manual_deductions' => 'manual_deduction_breakdown'] as $key => $field) {
                    $overrides[$key] = json_decode($item->$field ?: '{}', true) ?: [];
                }
                $componentTotal = array_sum($fixed) + array_sum($overrides['variable_allowances']) + array_sum($overrides['bonuses']);
                if (abs((float) $item->allowances_total - $componentTotal) > 0.01) {
                    $overrides['legacy_allowances_total'] = (float) $item->allowances_total;
                }
                if ($item->proration_payable_days !== null && $employee?->employment_type !== 'DW' && $run->type !== 'thr') {
                    $overrides['proration_payable_days'] = $item->proration_payable_days;
                }
            }
            DB::table('payroll_items')->where('id', $item->id)->update([
                'manual_overrides' => $overrides ? json_encode($overrides) : null,
                'company_name' => $sub?->name ?: ($company?->name ?: 'Perusahaan'),
                'company_details' => $sub ? $sub->address : $company?->details,
                'calculation_basis' => json_encode([
                    'base_salary' => $factor > 0 ? round($item->base_salary / $factor, 2) : (float) ($employee?->base_salary ?? 0),
                    'fixed_allowances' => $fullFixed,
                    'monthly' => $employee && $employee->employment_type !== 'DW' && $run?->type !== 'thr',
                    'ptkp_category' => $employee?->ptkp_category ?: 'TK/0',
                ]),
            ]);
        });
    }

    public function down(): void
    {
        if (DB::table('payroll_runs')->select('user_id', 'period', 'type')->groupBy('user_id', 'period', 'type')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Rollback dibatalkan: beberapa batch memakai periode sama. Pertahankan data dan rekonsiliasi batch terlebih dahulu.');
        }
        Schema::table('payroll_runs', fn (Blueprint $table) => $table->unique(['user_id', 'period', 'type'], 'payroll_runs_user_id_period_type_unique'));
        Schema::table('payroll_items', fn (Blueprint $table) => $table->dropColumn([
            'company_name', 'company_details', 'calculation_basis', 'manual_overrides', 'tax_reviewed', 'tax_basis_hash',
        ]));
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'batch_purpose', 'selected_employee_ids']);
            $table->dropIndex(['user_id', 'period', 'type']);
        });
    }
};
