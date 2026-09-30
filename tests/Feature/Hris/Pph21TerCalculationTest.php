<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\User;
use App\Services\Pph21TerCalculatorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Pph21TerCalculationTest extends TestCase
{
    use RefreshDatabase;

    private Pph21TerCalculatorService $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new Pph21TerCalculatorService();
    }

    public function test_ptkp_to_ter_category_mapping(): void
    {
        // Category A: TK/0, TK/1, K/0
        $this->assertEquals('A', $this->calculator->getCategoryByPtkp('TK/0'));
        $this->assertEquals('A', $this->calculator->getCategoryByPtkp('TK/1'));
        $this->assertEquals('A', $this->calculator->getCategoryByPtkp('K/0'));

        // Category B: TK/2, TK/3, K/1, K/2
        $this->assertEquals('B', $this->calculator->getCategoryByPtkp('TK/2'));
        $this->assertEquals('B', $this->calculator->getCategoryByPtkp('TK/3'));
        $this->assertEquals('B', $this->calculator->getCategoryByPtkp('K/1'));
        $this->assertEquals('B', $this->calculator->getCategoryByPtkp('K/2'));

        // Category C: K/3
        $this->assertEquals('C', $this->calculator->getCategoryByPtkp('K/3'));

        // Fallback default is A
        $this->assertEquals('A', $this->calculator->getCategoryByPtkp(null));
        $this->assertEquals('A', $this->calculator->getCategoryByPtkp('UNKNOWN'));
    }

    public function test_ter_a_monthly_calculation(): void
    {
        // <= 5.400.000 -> 0%
        $result1 = $this->calculator->calculateMonthly('TK/0', 5000000);
        $this->assertEquals('A', $result1['ter_category']);
        $this->assertEquals(0.0, $result1['tax_rate_percent']);
        $this->assertEquals(0.0, $result1['tax_amount']);

        // 5.950.000 s.d. 6.300.000 -> 0.75%
        $result2 = $this->calculator->calculateMonthly('TK/0', 6000000);
        $this->assertEquals(0.75, $result2['tax_rate_percent']);
        $this->assertEquals(45000.0, $result2['tax_amount']);
        $this->assertEquals(45000.0, $result2['deduction']);
        $this->assertEquals(0.0, $result2['allowance']);

        // 9.650.000 s.d. 10.050.000 -> 2.0%
        $result3 = $this->calculator->calculateMonthly('TK/0', 10000000);
        $this->assertEquals(2.0, $result3['tax_rate_percent']);
        $this->assertEquals(200000.0, $result3['tax_amount']);
    }

    public function test_ter_b_monthly_calculation(): void
    {
        // <= 6.200.000 -> 0%
        $result1 = $this->calculator->calculateMonthly('K/1', 6000000);
        $this->assertEquals('B', $result1['ter_category']);
        $this->assertEquals(0.0, $result1['tax_rate_percent']);
        $this->assertEquals(0.0, $result1['tax_amount']);

        // 9.200.000 s.d. 10.750.000 -> 1.5%
        $result2 = $this->calculator->calculateMonthly('K/1', 10000000);
        $this->assertEquals(1.5, $result2['tax_rate_percent']);
        $this->assertEquals(150000.0, $result2['tax_amount']);
    }

    public function test_ter_c_monthly_calculation(): void
    {
        // <= 6.600.000 -> 0%
        $result1 = $this->calculator->calculateMonthly('K/3', 6500000);
        $this->assertEquals('C', $result1['ter_category']);
        $this->assertEquals(0.0, $result1['tax_rate_percent']);
        $this->assertEquals(0.0, $result1['tax_amount']);

        // 14.150.000 s.d. 15.550.000 -> 5.0%
        $result2 = $this->calculator->calculateMonthly('K/3', 15000000);
        $this->assertEquals(5.0, $result2['tax_rate_percent']);
        $this->assertEquals(750000.0, $result2['tax_amount']);

        // 35.400.000 s.d. 38.900.000 -> 14.0%
        $result3 = $this->calculator->calculateMonthly('K/3', 36000000);
        $this->assertEquals(14.0, $result3['tax_rate_percent']);
        $this->assertEquals(5040000.0, $result3['tax_amount']);
    }

    public function test_ter_monthly_net_and_gross_up(): void
    {
        // Net method: Company bears the tax, deduction is 0, company_borne equals tax
        $net = $this->calculator->calculateMonthly('TK/0', 6000000, 'ter_bulanan_net');
        $this->assertEquals(45000.0, $net['tax_amount']);
        $this->assertEquals(0.0, $net['deduction']);
        $this->assertEquals(45000.0, $net['company_borne']);

        // Gross Up method: Allowance is added to cover the tax
        $grossUp = $this->calculator->calculateMonthly('TK/0', 6000000, 'ter_bulanan_gross_up');
        $this->assertGreaterThan(0.0, $grossUp['allowance']);
        $this->assertEquals($grossUp['allowance'], $grossUp['deduction']);
    }

    public function test_pasal17_annual_calculation(): void
    {
        // PKP 50.000.000 (all in 5% bracket)
        $this->assertEquals(2500000.0, $this->calculator->calculatePasal17(50000000));

        // PKP 100.000.000 (60jt x 5% = 3jt, 40jt x 15% = 6jt -> 9jt)
        $this->assertEquals(9000000.0, $this->calculator->calculatePasal17(100000000));
    }

    public function test_daily_ter_calculation(): void
    {
        // Upah harian <= 450.000 -> 0%
        $daily0 = $this->calculator->calculateDaily(400000, 5);
        $this->assertEquals(0.0, $daily0['tax_rate_percent']);
        $this->assertEquals(0.0, $daily0['tax_amount']);

        // Upah harian > 450.000 s.d. 2.500.000 -> 0.5%
        $dailyHalf = $this->calculator->calculateDaily(600000, 10);
        $this->assertEquals(0.5, $dailyHalf['tax_rate_percent']);
        $this->assertEquals(3000.0, $dailyHalf['tax_per_day']);
        $this->assertEquals(30000.0, $dailyHalf['tax_amount']);
    }

    public function test_payroll_generation_with_ter_bulanan_category_a_gross(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 10_000_000,
            'ptkp_category' => 'TK/0', // Category A
            'pph21_enabled' => true,
            'pph21_method' => 'ter_bulanan',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ]);

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-02')->firstOrFail();
        $item = PayrollItem::query()->where('payroll_run_id', $run->id)->where('employee_id', $employee->id)->firstOrFail();

        // Gross Rp 10.000.000 in TER A (9.650.000 - 10.050.000) rate is 2.0% -> 200.000
        $this->assertEquals(2.0, (float) $item->pph21_rate);
        $this->assertEquals(200000.0, (float) $item->pph21_deduction);
        $this->assertEquals(0.0, (float) $item->pph21_allowance);
        $this->assertEquals(0.0, (float) $item->pph21_company_borne);
        $this->assertEquals(9800000.0, (float) $item->net_salary);
    }

    public function test_payroll_generation_with_ter_bulanan_category_b_net(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 10_000_000,
            'ptkp_category' => 'K/1', // Category B
            'pph21_enabled' => true,
            'pph21_method' => 'ter_bulanan_net',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ]);

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-02')->firstOrFail();
        $item = PayrollItem::query()->where('payroll_run_id', $run->id)->where('employee_id', $employee->id)->firstOrFail();

        // Gross Rp 10.000.000 in TER B (9.200.000 - 10.750.000) rate is 1.5% -> 150.000 borne by company
        $this->assertEquals(1.5, (float) $item->pph21_rate);
        $this->assertEquals(0.0, (float) $item->pph21_deduction);
        $this->assertEquals(150000.0, (float) $item->pph21_company_borne);
        $this->assertEquals(10000000.0, (float) $item->net_salary);
    }

    public function test_payroll_generation_with_ter_bulanan_category_c_gross_up(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 15_000_000,
            'ptkp_category' => 'K/3', // Category C
            'pph21_enabled' => true,
            'pph21_method' => 'ter_bulanan_gross_up',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ]);

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-02')->firstOrFail();
        $item = PayrollItem::query()->where('payroll_run_id', $run->id)->where('employee_id', $employee->id)->firstOrFail();

        // In Gross Up, allowance equals deduction and take home pay is preserved
        $this->assertGreaterThan(0.0, (float) $item->pph21_allowance);
        $this->assertEquals((float) $item->pph21_allowance, (float) $item->pph21_deduction);
        $this->assertEquals(15000000.0, (float) $item->net_salary);
    }
}
