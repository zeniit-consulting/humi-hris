<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\User;
use App\Services\MissingClockOutRequestPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MissingClockOutRequestPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_deadline_uses_the_earlier_of_h_plus_two_and_monthly_cutoff(): void
    {
        $owner = User::factory()->create();
        $setting = CompanySetting::query()->create([
            'user_id' => $owner->id,
            'name' => 'Humi',
            'missing_clock_out_request_days' => 2,
            'attendance_revision_cutoff_day' => '2',
        ]);

        $deadline = app(MissingClockOutRequestPolicy::class)
            ->deadlineFor($setting, Carbon::parse('2026-07-01', 'Asia/Makassar'));

        $this->assertSame('2026-07-02', $deadline->toDateString());
    }

    public function test_end_of_month_cutoff_uses_leap_year_february(): void
    {
        $owner = User::factory()->create();
        $setting = CompanySetting::query()->create([
            'user_id' => $owner->id,
            'name' => 'Humi',
            'missing_clock_out_request_days' => 31,
            'attendance_revision_cutoff_day' => 'end_of_month',
        ]);

        $deadline = app(MissingClockOutRequestPolicy::class)
            ->deadlineFor($setting, Carbon::parse('2028-02-01', 'Asia/Makassar'));

        $this->assertSame('2028-02-29', $deadline->toDateString());
    }
}
