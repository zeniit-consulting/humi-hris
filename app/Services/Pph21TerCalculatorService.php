<?php

namespace App\Services;

class Pph21TerCalculatorService
{
    /**
     * Resolve TER Category ('A', 'B', 'C') from employee's PTKP category.
     * Default to 'A' if not set or unrecognized.
     */
    public function getCategoryByPtkp(?string $ptkpCategory): string
    {
        if (! $ptkpCategory) {
            return 'A';
        }

        $mapping = config('pph21_ter.ptkp_mapping', []);

        return $mapping[strtoupper(trim($ptkpCategory))] ?? 'A';
    }

    /**
     * Get monthly TER rate percentage (e.g. 0.0, 0.25, 5.0, etc.) for a category and gross income.
     */
    public function getMonthlyRate(string $category, float $grossIncome): float
    {
        $category = strtoupper(trim($category));
        $rates = config("pph21_ter.rates.{$category}", []);

        if (empty($rates) || $grossIncome <= 0) {
            return 0.0;
        }

        foreach ($rates as [$min, $max, $rate]) {
            if ($max === null) {
                if ($grossIncome > $min) {
                    return (float) $rate;
                }
            } else {
                if ($grossIncome > $min && $grossIncome <= $max) {
                    return (float) $rate;
                }
                // Handle the 0 bracket where grossIncome <= max and min == 0
                if ($min === 0 && $grossIncome <= $max) {
                    return (float) $rate;
                }
            }
        }

        return 0.0;
    }

    /**
     * Calculate monthly PPh 21 TER based on PTKP category and gross income.
     *
     * @param string $ptkpCategory Status PTKP (e.g. 'TK/0', 'K/1', 'K/3')
     * @param float $grossIncome Penghasilan bruto sebulan
     * @param string $method 'ter_bulanan' (Gross), 'ter_bulanan_net' (Net), or 'ter_bulanan_gross_up' (Gross Up)
     * @return array{
     *     ptkp_category: string,
     *     ter_category: string,
     *     tax_rate_percent: float,
     *     tax_amount: float,
     *     allowance: float,
     *     deduction: float,
     *     company_borne: float,
     *     gross_income: float,
     *     taxable_gross: float
     * }
     */
    public function calculateMonthly(string $ptkpCategory, float $grossIncome, string $method = 'ter_bulanan'): array
    {
        $terCategory = $this->getCategoryByPtkp($ptkpCategory);
        $cleanGross = max(round($grossIncome, 2), 0.0);

        if ($method === 'ter_bulanan_gross_up' || $method === 'gross_up') {
            return $this->calculateMonthlyGrossUp($ptkpCategory, $terCategory, $cleanGross);
        }

        $ratePercent = $this->getMonthlyRate($terCategory, $cleanGross);
        $taxAmount = round($cleanGross * ($ratePercent / 100), 2);

        $isNet = in_array($method, ['ter_bulanan_net', 'net'], true);

        return [
            'ptkp_category' => $ptkpCategory,
            'ter_category' => $terCategory,
            'tax_rate_percent' => $ratePercent,
            'tax_amount' => $taxAmount,
            'allowance' => 0.0,
            'deduction' => $isNet ? 0.0 : $taxAmount,
            'company_borne' => $isNet ? $taxAmount : 0.0,
            'gross_income' => $cleanGross,
            'taxable_gross' => $cleanGross,
        ];
    }

    /**
     * Calculate Gross Up for Monthly TER.
     * Iteratively finds the tax allowance T such that T = (G + T) * Rate(G + T).
     */
    public function calculateMonthlyGrossUp(string $ptkpCategory, string $terCategory, float $initialGross): array
    {
        if ($initialGross <= 0) {
            return [
                'ptkp_category' => $ptkpCategory,
                'ter_category' => $terCategory,
                'tax_rate_percent' => 0.0,
                'tax_amount' => 0.0,
                'allowance' => 0.0,
                'deduction' => 0.0,
                'company_borne' => 0.0,
                'gross_income' => $initialGross,
                'taxable_gross' => $initialGross,
            ];
        }

        $rates = config("pph21_ter.rates.{$terCategory}", []);
        $taxAllowance = 0.0;
        $finalRate = 0.0;
        $finalGross = $initialGross;

        // Find matching bracket where (initialGross + T) lands in bracket and T = (initialGross + T) * r
        // That means: T = (initialGross * r) / (1 - r)
        foreach ($rates as [$min, $max, $rate]) {
            $r = (float) $rate / 100;
            if ($r >= 1.0) {
                continue;
            }

            $candidateAllowance = $r > 0 ? round(($initialGross * $r) / (1 - $r), 2) : 0.0;
            $candidateGross = round($initialGross + $candidateAllowance, 2);

            $inBracket = false;
            if ($max === null) {
                $inBracket = $candidateGross > $min;
            } else {
                $inBracket = $min === 0 ? ($candidateGross <= $max) : ($candidateGross > $min && $candidateGross <= $max);
            }

            if ($inBracket) {
                $taxAllowance = $candidateAllowance;
                $finalRate = (float) $rate;
                $finalGross = $candidateGross;
                break;
            }
        }

        $taxAmount = round($finalGross * ($finalRate / 100), 2);

        return [
            'ptkp_category' => $ptkpCategory,
            'ter_category' => $terCategory,
            'tax_rate_percent' => $finalRate,
            'tax_amount' => $taxAmount,
            'allowance' => $taxAllowance,
            'deduction' => $taxAmount,
            'company_borne' => 0.0,
            'gross_income' => $initialGross,
            'taxable_gross' => $finalGross,
        ];
    }

    /**
     * Calculate annual progressive PPh 21 using Tarif Pasal 17 ayat (1) huruf a UU PPh.
     * 0 s.d. 60 jt: 5%
     * > 60 jt s.d. 250 jt: 15%
     * > 250 jt s.d. 500 jt: 25%
     * > 500 jt s.d. 5 M: 30%
     * > 5 M: 35%
     */
    public function calculatePasal17(float $pkp): float
    {
        if ($pkp <= 0) {
            return 0.0;
        }

        $brackets = config('pph21_ter.pasal17', []);
        $tax = 0.0;

        foreach ($brackets as [$min, $max, $rate]) {
            if ($pkp <= $min) {
                continue;
            }

            $taxableInBracket = $max === null ? ($pkp - $min) : min($pkp - $min, $max - $min);
            $tax += $taxableInBracket * ((float) $rate / 100);
        }

        return round($tax, 2);
    }

    /**
     * Get daily TER rate percentage for a daily wage.
     */
    public function getDailyRate(float $dailyWage): float
    {
        $rates = config('pph21_ter.rates.harian', []);
        foreach ($rates as [$min, $max, $rate]) {
            if ($dailyWage > $min && ($max === null || $dailyWage <= $max)) {
                return (float) $rate;
            }
            if ($min === 0 && $dailyWage <= $max) {
                return (float) $rate;
            }
        }

        return 0.0;
    }

    /**
     * Calculate daily PPh 21 TER for non-permanent workers.
     *
     * @return array{
     *     daily_wage: float,
     *     days: int,
     *     tax_rate_percent: float,
     *     tax_per_day: float,
     *     tax_amount: float,
     *     deduction: float
     * }
     */
    public function calculateDaily(float $dailyWage, int $days = 1): array
    {
        $cleanWage = max(round($dailyWage, 2), 0.0);
        $ratePercent = $this->getDailyRate($cleanWage);
        $taxPerDay = round($cleanWage * ($ratePercent / 100), 2);
        $totalTax = round($taxPerDay * max($days, 1), 2);

        return [
            'daily_wage' => $cleanWage,
            'days' => $days,
            'tax_rate_percent' => $ratePercent,
            'tax_per_day' => $taxPerDay,
            'tax_amount' => $totalTax,
            'deduction' => $totalTax,
        ];
    }
}
