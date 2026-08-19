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
    ): array {
        $calculationBase = max($calculationBase, 0);

        // 1. BPJS Kesehatan (4% Perusahaan, 1% Karyawan, Cap Rp 12.000.000)
        $kesBase = min($calculationBase, $kesWageCap);
        $bpjsKesCompany = 0.0;
        $bpjsKesEmployee = 0.0;

        if ($bpjsKesEnabled && $empBpjsKesEnabled) {
            $bpjsKesCompany = round($kesBase * 0.04, 2);
            $bpjsKesEmployee = round($kesBase * 0.01, 2);
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
            $bpjsJkkCompany = round($calculationBase * ($jkkRate / 100), 2);

            // JKM (0.3% Pemberi Kerja)
            $bpjsJkmCompany = round($calculationBase * 0.003, 2);

            // JHT (3.7% Pemberi Kerja, 2% Karyawan)
            $bpjsJhtCompany = round($calculationBase * 0.037, 2);
            $bpjsJhtEmployee = round($calculationBase * 0.020, 2);

            // JP (2% Pemberi Kerja, 1% Karyawan, Cap JP)
            if ($empBpjsJpEnabled) {
                $jpBase = min($calculationBase, $jpWageCap);
                $bpjsJpCompany = round($jpBase * 0.020, 2);
                $bpjsJpEmployee = round($jpBase * 0.010, 2);
            }
        }

        $totalCompany = round(
            $bpjsKesCompany + $bpjsJkkCompany + $bpjsJkmCompany + $bpjsJhtCompany + $bpjsJpCompany,
            2
        );

        $totalEmployee = round(
            $bpjsKesEmployee + $bpjsJhtEmployee + $bpjsJpEmployee,
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
            'bpjs_total_company' => $totalCompany,
            'bpjs_total_employee' => $totalEmployee,
            'deductible_for_tax' => $deductibleForTax,
            'taxable_additions' => $taxableAdditions,
        ];
    }
}
