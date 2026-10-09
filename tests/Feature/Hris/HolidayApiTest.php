<?php

namespace Tests\Feature\Hris;

use App\Models\PublicHoliday;
use App\Models\User;
use App\Services\HolidayApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HolidayApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_holiday_service_fetches_latest_holidays(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/holidays/latest' => Http::response([
                'metadata' => [
                    'version' => '1.0.0',
                    'year' => 2026,
                ],
                'data' => [
                    [
                        'date' => '2026-01-01',
                        'name' => 'Tahun Baru 2026 Masehi',
                        'is_civic' => true,
                        'is_religious' => false,
                        'is_cuti_bersama' => false,
                    ],
                    [
                        'date' => '2026-02-16',
                        'name' => 'Tahun Baru Imlek 2577 Kongzili',
                        'is_civic' => false,
                        'is_religious' => true,
                        'is_cuti_bersama' => true,
                    ],
                ],
            ]),
        ]);

        /** @var HolidayApiService $service */
        $service = app(HolidayApiService::class);
        $holidays = $service->getLatestHolidays();

        $this->assertCount(2, $holidays);
        $this->assertSame('2026-01-01', $holidays[0]['date']);
        $this->assertSame('Tahun Baru 2026 Masehi', $holidays[0]['name']);
        $this->assertFalse($holidays[0]['is_cuti_bersama']);
        $this->assertTrue($holidays[1]['is_cuti_bersama']);
    }

    public function test_holiday_service_fetches_holidays_by_year(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/holidays/2026.json' => Http::response([
                'metadata' => ['year' => 2026],
                'data' => [
                    [
                        'date' => '2026-08-17',
                        'name' => 'Proklamasi Kemerdekaan',
                        'is_civic' => true,
                        'is_religious' => false,
                        'is_cuti_bersama' => false,
                    ],
                ],
            ]),
        ]);

        /** @var HolidayApiService $service */
        $service = app(HolidayApiService::class);
        $holidays = $service->getHolidaysByYear(2026);

        $this->assertCount(1, $holidays);
        $this->assertSame('2026-08-17', $holidays[0]['date']);
        $this->assertSame('Proklamasi Kemerdekaan', $holidays[0]['name']);
    }

    public function test_holiday_service_falls_back_to_latest_when_year_endpoint_returns_404(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/holidays/2027.json' => Http::response(['message' => 'Not Found'], 404),
            'https://api.kemendesa.link/libur-nasional/api/holidays/latest' => Http::response([
                'metadata' => ['year' => 2026],
                'data' => [
                    [
                        'date' => '2026-08-17',
                        'name' => 'Proklamasi Kemerdekaan',
                        'is_cuti_bersama' => false,
                    ],
                ],
            ]),
        ]);

        /** @var HolidayApiService $service */
        $service = app(HolidayApiService::class);
        $holidays = $service->getHolidaysByYear(2027);

        $this->assertCount(1, $holidays);
        $this->assertSame('2026-08-17', $holidays[0]['date']);
    }

    public function test_holiday_service_check_is_holiday_identifies_holiday_and_non_holiday(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/is-holiday?date=2026-08-17' => Http::response([
                'success' => true,
                'query' => ['date' => '2026-08-17'],
                'data' => [
                    'date' => '2026-08-17',
                    'name' => 'Proklamasi Kemerdekaan',
                    'is_civic' => true,
                    'is_religious' => false,
                    'is_cuti_bersama' => false,
                ],
                'is_holiday' => true,
            ]),
            'https://api.kemendesa.link/libur-nasional/api/is-holiday?date=2026-08-18' => Http::response([
                'success' => true,
                'query' => ['date' => '2026-08-18'],
                'data' => null,
                'is_holiday' => false,
            ]),
        ]);

        /** @var HolidayApiService $service */
        $service = app(HolidayApiService::class);

        $holidayCheck = $service->checkIsHoliday('2026-08-17');
        $this->assertTrue($holidayCheck['is_holiday']);
        $this->assertSame('Proklamasi Kemerdekaan', $holidayCheck['name']);
        $this->assertSame('national', $holidayCheck['holiday_type']);
        $this->assertFalse($holidayCheck['is_cuti_bersama']);

        $nonHolidayCheck = $service->checkIsHoliday('2026-08-18');
        $this->assertFalse($nonHolidayCheck['is_holiday']);
        $this->assertNull($nonHolidayCheck['name']);
    }

    public function test_admin_can_check_holiday_via_controller_endpoint(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/is-holiday?date=2026-08-17' => Http::response([
                'success' => true,
                'query' => ['date' => '2026-08-17'],
                'data' => [
                    'date' => '2026-08-17',
                    'name' => 'Proklamasi Kemerdekaan',
                    'is_cuti_bersama' => false,
                ],
                'is_holiday' => true,
            ]),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->getJson(route('hris.schedules.holidays.check', [
            'date' => '2026-08-17',
        ]));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('date', '2026-08-17')
            ->assertJsonPath('is_holiday', true)
            ->assertJsonPath('name', 'Proklamasi Kemerdekaan')
            ->assertJsonPath('holiday_type', 'national');
    }

    public function test_admin_can_get_latest_and_year_holidays_via_controller_endpoints(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/holidays/latest' => Http::response([
                'metadata' => ['year' => 2026],
                'data' => [
                    ['date' => '2026-01-01', 'name' => 'Tahun Baru 2026 Masehi', 'is_cuti_bersama' => false],
                ],
            ]),
            'https://api.kemendesa.link/libur-nasional/api/holidays/2026.json' => Http::response([
                'metadata' => ['year' => 2026],
                'data' => [
                    ['date' => '2026-08-17', 'name' => 'Proklamasi Kemerdekaan', 'is_cuti_bersama' => false],
                ],
            ]),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $latestResponse = $this->actingAs($admin)->getJson(route('hris.schedules.holidays.latest'));
        $latestResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('count', 1);

        $yearResponse = $this->actingAs($admin)->getJson(route('hris.schedules.holidays.year', ['year' => 2026]));
        $yearResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('year', 2026)
            ->assertJsonPath('count', 1);
    }

    public function test_sync_holidays_works_without_employee_id(): void
    {
        Http::fake([
            'https://api.kemendesa.link/libur-nasional/api/holidays/2026.json' => Http::response([
                'metadata' => ['year' => 2026],
                'data' => [
                    [
                        'date' => '2026-05-01',
                        'name' => 'Hari Buruh Internasional',
                        'is_cuti_bersama' => false,
                    ],
                    [
                        'date' => '2026-05-15',
                        'name' => 'Kenaikan Yesus Kristus (Cuti Bersama)',
                        'is_cuti_bersama' => true,
                    ],
                ],
            ]),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('hris.schedules.holidays.sync'), [
            'month' => '2026-05',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('public_holidays', [
            'user_id' => $admin->id,
            'date' => '2026-05-01',
            'name' => 'Hari Buruh Internasional',
            'is_national_holiday' => true,
            'holiday_type' => 'national',
        ]);

        $this->assertDatabaseHas('public_holidays', [
            'user_id' => $admin->id,
            'date' => '2026-05-15',
            'name' => 'Kenaikan Yesus Kristus (Cuti Bersama)',
            'is_national_holiday' => false,
            'holiday_type' => 'joint_leave',
        ]);
    }
}
