<?php

namespace App\Support;

class BpjsCalculator
{
    /**
     * Calculate BPJS components for an employee.
     *
     * @param float $calculationBase Wage base (normally base salary + fixed allowances)
     * @param bool $bpjsKesEnabled Company setting for BPJS Kesehatan
     * @param bool $bpjsTkEnabled Company setting for BPJS Ketenagakerjaan
     * @param bool $empBpjsKesEnabled Employee enrollment for BPJS Kesehatan
     * @param bool $empBpjsTkEnabled Employee enrollment for BPJS Ketenagakerjaan
     * @param bool $empBpjsJpEnabled Employee enrollment for JP (Jaminan Pensiun)
     * @param float $jkkRate JKK rate percentage (e.g. 0.24 for 0.24%)
     * @param float $kesWageCap Max wage for BPJS Kesehatan (default 12,000,000)
     * @param float $jpWageCap Max wage for BPJS Ketenagakerjaan JP (default 10,042,300)
     * @param bool $empBpjsJkkEnabled Employee enrollment for JKK
     * @param bool $empBpjsJkmEnabled Employee enrollment for JKM
     * @param bool $empBpjsJhtEnabled Employee enrollment for JHT
     * @param bool $privateInsuranceEnabled Whether private insurance is enabled
     * @param float $privateInsuranceNominal Employee deduction / premium for private insurance
     * @param bool $isNetSalary Whether employee salary is net (company bears employee BPJS contributions)
     * @param float|null $kesCalculationBase Reported wage specifically for BPJS Kesehatan (if set, overrides $calculationBase)
     * @return array<string, float>
     */
    public static function calculate(
        float $calculationBase,
        bool $bpjsKesEnabled = true,
        bool $bpjsTkEnabled = true,
        bool $empBpjsKesEnabled = true,
        bool $empBpjsTkEnabled = true,
        bool $empBpjsJpEnabled = true,
        float $jkkRate = 0.240,
        float $kesWageCap = 12_000_000,
        float $jpWageCap = 10_042_300,
        bool $empBpjsJkkEnabled = true,
        bool $empBpjsJkmEnabled = true,
        bool $empBpjsJhtEnabled = true,
        bool $privateInsuranceEnabled = false,
        float $privateInsuranceNominal = 0.0,
        bool $isNetSalary = false,
        ?float $kesCalculationBase = null,
    ): array {
        $calculationBase = max($calculationBase, 0);

        // 1. BPJS Kesehatan (4% Perusahaan, 1% Karyawan, Cap Rp 12.000.000)
        // Jika gaji yang dilaporkan diisi (> 0), gunakan nilai tersebut sebagai dasar BPJS Kes.
        $actualKesBase = ($kesCalculationBase !== null && $kesCalculationBase > 0)
            ? max($kesCalculationBase, 0)
            : $calculationBase;
        $kesBase = min($actualKesBase, $kesWageCap);

        $bpjsKesCompany = 0.0;
        $bpjsKesEmployee = 0.0;

        if ($bpjsKesEnabled && $empBpjsKesEnabled) {
            if ($isNetSalary) {
                // Jika salary nett, 1% ditanggung perusahaan (total 5% menjadi beban perusahaan)
                $bpjsKesCompany = round($kesBase * 0.05, 2);
                $bpjsKesEmployee = 0.0;
            } else {
                $bpjsKesCompany = round($kesBase * 0.04, 2);
                $bpjsKesEmployee = round($kesBase * 0.01, 2);
            }
        }

        // 2. BPJS Ketenagakerjaan
        $bpjsJkkCompany = 0.0;
        $bpjsJkmCompany = 0.0;
        $bpjsJhtCompany = 0.0;
        $bpjsJhtEmployee = 0.0;
        $bpjsJpCompany = 0.0;
        $bpjsJpEmployee = 0.0;

        if ($bpjsTkEnabled && $empBpjsTkEnabled) {
            // JKK (% Pemberi Kerja)
            if ($empBpjsJkkEnabled) {
                $bpjsJkkCompany = round($calculationBase * ($jkkRate / 100), 2);
            }

            // JKM (0.3% Pemberi Kerja)
            if ($empBpjsJkmEnabled) {
                $bpjsJkmCompany = round($calculationBase * 0.003, 2);
            }

            // JHT (Normal: 3.7% Perusahaan, 2% Karyawan. Nett: 5.7% Perusahaan, 0% Karyawan)
            if ($empBpjsJhtEnabled) {
                if ($isNetSalary) {
                    $bpjsJhtCompany = round($calculationBase * 0.057, 2);
                    $bpjsJhtEmployee = 0.0;
                } else {
                    $bpjsJhtCompany = round($calculationBase * 0.037, 2);
                    $bpjsJhtEmployee = round($calculationBase * 0.020, 2);
                }
            }

            // JP (Normal: 2% Perusahaan, 1% Karyawan. Nett: 3% Perusahaan, 0% Karyawan, Cap JP)
            if ($empBpjsJpEnabled) {
                $jpBase = min($calculationBase, $jpWageCap);
                if ($isNetSalary) {
                    $bpjsJpCompany = round($jpBase * 0.030, 2);
                    $bpjsJpEmployee = 0.0;
                } else {
                    $bpjsJpCompany = round($jpBase * 0.020, 2);
                    $bpjsJpEmployee = round($jpBase * 0.010, 2);
                }
            }
        }

        $privateInsuranceDeduction = 0.0;
        if ($privateInsuranceEnabled && $privateInsuranceNominal > 0) {
            $privateInsuranceDeduction = round($privateInsuranceNominal, 2);
        }

        $totalCompany = round(
            $bpjsKesCompany + $bpjsJkkCompany + $bpjsJkmCompany + $bpjsJhtCompany + $bpjsJpCompany,
            2
        );

        $totalEmployee = round(
            $bpjsKesEmployee + $bpjsJhtEmployee + $bpjsJpEmployee + $privateInsuranceDeduction,
            2
        );

        // Deductible for PPh 21 calculation (JHT Karyawan + JP Karyawan)
        $deductibleForTax = round($bpjsJhtEmployee + $bpjsJpEmployee, 2);

        // Taxable additions from employer-borne premiums (JKK, JKM, BPJS Kes Perusahaan)
        $taxableAdditions = round($bpjsKesCompany + $bpjsJkkCompany + $bpjsJkmCompany, 2);

        return [
            'bpjs_kesehatan_company' => $bpjsKesCompany,
            'bpjs_kesehatan_employee' => $bpjsKesEmployee,
            'bpjs_jkk_company' => $bpjsJkkCompany,
            'bpjs_jkm_company' => $bpjsJkmCompany,
            'bpjs_jht_company' => $bpjsJhtCompany,
            'bpjs_jht_employee' => $bpjsJhtEmployee,
            'bpjs_jp_company' => $bpjsJpCompany,
            'bpjs_jp_employee' => $bpjsJpEmployee,
            'private_insurance_deduction' => $privateInsuranceDeduction,
            'bpjs_total_company' => $totalCompany,
            'bpjs_total_employee' => $totalEmployee,
            'deductible_for_tax' => $deductibleForTax,
            'taxable_additions' => $taxableAdditions,
        ];
    }
}
