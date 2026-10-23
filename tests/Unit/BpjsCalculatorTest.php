<?php

namespace Tests\Unit;

use App\Support\BpjsCalculator;
use PHPUnit\Framework\TestCase;

class BpjsCalculatorTest extends TestCase
{
    public function test_standard_gross_salary_calculation(): void
    {
        $res = BpjsCalculator::calculate(
            calculationBase: 10_000_000,
            bpjsKesEnabled: true,
            bpjsTkEnabled: true,
            empBpjsKesEnabled: true,
            empBpjsTkEnabled: true,
            empBpjsJpEnabled: true,
            jkkRate: 0.24,
            isNetSalary: false,
        );

        // BPJS Kes: 4% company, 1% employee
        $this->assertEquals(400_000.00, $res['bpjs_kesehatan_company']);
        $this->assertEquals(100_000.00, $res['bpjs_kesehatan_employee']);

        // JKK: 0.24% company
        $this->assertEquals(24_000.00, $res['bpjs_jkk_company']);

        // JKM: 0.3% company
        $this->assertEquals(30_000.00, $res['bpjs_jkm_company']);

        // JHT: 3.7% company, 2% employee
        $this->assertEquals(370_000.00, $res['bpjs_jht_company']);
        $this->assertEquals(200_000.00, $res['bpjs_jht_employee']);

        // JP: 2% company, 1% employee
        $this->assertEquals(200_000.00, $res['bpjs_jp_company']);
        $this->assertEquals(100_000.00, $res['bpjs_jp_employee']);

        // Totals
        $this->assertEquals(1_024_000.00, $res['bpjs_total_company']);
        $this->assertEquals(400_000.00, $res['bpjs_total_employee']);
    }

    public function test_net_salary_calculation_borne_by_company(): void
    {
        $res = BpjsCalculator::calculate(
            calculationBase: 10_000_000,
            bpjsKesEnabled: true,
            bpjsTkEnabled: true,
            empBpjsKesEnabled: true,
            empBpjsTkEnabled: true,
            empBpjsJpEnabled: true,
            jkkRate: 0.24,
            isNetSalary: true,
        );

        // For net salary: employee portions (1% Kes, 2% JHT, 1% JP) are shifted to company (0% deduction for employee)
        // BPJS Kes: 5% company, 0% employee
        $this->assertEquals(500_000.00, $res['bpjs_kesehatan_company']);
        $this->assertEquals(0.00, $res['bpjs_kesehatan_employee']);

        // JKK: 0.24% company
        $this->assertEquals(24_000.00, $res['bpjs_jkk_company']);

        // JKM: 0.3% company
        $this->assertEquals(30_000.00, $res['bpjs_jkm_company']);

        // JHT: 5.7% company, 0% employee
        $this->assertEquals(570_000.00, $res['bpjs_jht_company']);
        $this->assertEquals(0.00, $res['bpjs_jht_employee']);

        // JP: 3% company, 0% employee
        $this->assertEquals(300_000.00, $res['bpjs_jp_company']);
        $this->assertEquals(0.00, $res['bpjs_jp_employee']);

        // Totals: company pays 500k + 24k + 30k + 570k + 300k = 1,424,000; employee = 0
        $this->assertEquals(1_424_000.00, $res['bpjs_total_company']);
        $this->assertEquals(0.00, $res['bpjs_total_employee']);
    }

    public function test_custom_bpjs_kesehatan_reported_wage(): void
    {
        // Actual wage = 10,000,000, but reported wage for BPJS Kesehatan is 5,000,000
        $res = BpjsCalculator::calculate(
            calculationBase: 10_000_000,
            bpjsKesEnabled: true,
            bpjsTkEnabled: true,
            empBpjsKesEnabled: true,
            empBpjsTkEnabled: true,
            empBpjsJpEnabled: true,
            jkkRate: 0.24,
            isNetSalary: false,
            kesCalculationBase: 5_000_000,
        );

        // BPJS Kes calculated based on 5,000,000
        $this->assertEquals(200_000.00, $res['bpjs_kesehatan_company']); // 4% of 5M
        $this->assertEquals(50_000.00, $res['bpjs_kesehatan_employee']);  // 1% of 5M

        // BPJS TK calculated based on full calculationBase (10,000,000)
        $this->assertEquals(24_000.00, $res['bpjs_jkk_company']);
        $this->assertEquals(30_000.00, $res['bpjs_jkm_company']);
        $this->assertEquals(370_000.00, $res['bpjs_jht_company']);
        $this->assertEquals(200_000.00, $res['bpjs_jht_employee']);
    }
}
