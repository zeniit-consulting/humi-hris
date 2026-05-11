<?php

namespace App\Support;

class PayrollTax
{
    public static function getPtkp(string $status): int
    {
        return match ($status) {
            'TK/0' => 54_000_000,
            'TK/1' => 58_500_000,
            'TK/2' => 63_000_000,
            'TK/3' => 67_500_000,
            'K/0' => 58_500_000,
            'K/1' => 63_000_000,
            'K/2' => 67_500_000,
            'K/3' => 72_000_000,
            default => 54_000_000,
        };
    }

    public static function calculateProgressiveTax(float $pkp): float
    {
        $tax = 0;

        if ($pkp > 5_000_000_000) {
            $tax += ($pkp - 5_000_000_000) * 0.35;
            $pkp = 5_000_000_000;
        }

        if ($pkp > 500_000_000) {
            $tax += ($pkp - 500_000_000) * 0.30;
            $pkp = 500_000_000;
        }

        if ($pkp > 250_000_000) {
            $tax += ($pkp - 250_000_000) * 0.25;
            $pkp = 250_000_000;
        }

        if ($pkp > 60_000_000) {
            $tax += ($pkp - 60_000_000) * 0.15;
            $pkp = 60_000_000;
        }

        if ($pkp > 0) {
            $tax += $pkp * 0.05;
        }

        return $tax;
    }

    /**
     * @return array<string, int|string>
     */
    public static function calculateMonthlyPph21(
        float $grossMonthly,
        string $ptkpStatus = 'TK/0',
        float $deductibleBpjsMonthly = 0,
    ): array {
        $biayaJabatan = min($grossMonthly * 0.05, 500_000);

        $netMonthly = $grossMonthly - $biayaJabatan - $deductibleBpjsMonthly;
        $netAnnual = $netMonthly * 12;
        $ptkp = self::getPtkp($ptkpStatus);
        $pkp = max($netAnnual - $ptkp, 0);
        $pkpRounded = floor($pkp / 1000) * 1000;
        $annualTax = self::calculateProgressiveTax($pkpRounded);
        $monthlyTax = $annualTax / 12;

        return [
            'gross_monthly' => (int) round($grossMonthly),
            'biaya_jabatan' => (int) round($biayaJabatan),
            'deductible_bpjs_monthly' => (int) round($deductibleBpjsMonthly),
            'net_monthly' => (int) round($netMonthly),
            'net_annual' => (int) round($netAnnual),
            'ptkp_status' => $ptkpStatus,
            'ptkp' => $ptkp,
            'pkp' => (int) $pkpRounded,
            'pph21_annual' => (int) round($annualTax),
            'pph21_monthly' => (int) round($monthlyTax),
        ];
    }
}
