<?php

namespace App\Services;

use App\Models\PublicHoliday;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HolidayApiService
{
    public const BASE_URL = 'https://api.kemendesa.link/libur-nasional/api';
    public const LATEST_URL = 'https://api.kemendesa.link/libur-nasional/api/holidays/latest';
    public const YEAR_URL_TEMPLATE = 'https://api.kemendesa.link/libur-nasional/api/holidays/%d.json';
    public const IS_HOLIDAY_URL = 'https://api.kemendesa.link/libur-nasional/api/is-holiday';
    public const LEGACY_FALLBACK_URL = 'https://libur.deno.dev/api';

    /**
     * Get latest holidays (current year).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getLatestHolidays(): array
    {
        $url = (string) config('services.holiday_api.latest_url', self::LATEST_URL);
        $timeout = (int) config('services.holiday_api.timeout', 15);

        try {
            $response = Http::timeout($timeout)->get($url);
            if ($response->successful()) {
                $holidays = $this->extractHolidaysFromResponse($response->json());
                if (! empty($holidays)) {
                    return $holidays;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal mengambil data libur terbaru dari API Kemendesa', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
        }

        return $this->getLegacyFallbackHolidays();
    }

    /**
     * Get holidays for a specific year (e.g. 2026).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getHolidaysByYear(int $year): array
    {
        $urlTemplate = (string) config('services.holiday_api.year_url_template', self::YEAR_URL_TEMPLATE);
        $url = sprintf($urlTemplate, $year);
        $timeout = (int) config('services.holiday_api.timeout', 15);

        try {
            $response = Http::timeout($timeout)->get($url);
            if ($response->successful()) {
                $holidays = $this->extractHolidaysFromResponse($response->json());
                if (! empty($holidays)) {
                    return $holidays;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal mengambil data libur per tahun dari API Kemendesa', [
                'year' => $year,
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
        }

        // Fallback to latest holidays endpoint if year-specific endpoint fails
        $latest = $this->getLatestHolidays();
        if (! empty($latest)) {
            $yearFiltered = array_values(array_filter($latest, function (array $item) use ($year): bool {
                $date = (string) ($item['date'] ?? '');

                return str_starts_with($date, (string) $year);
            }));

            if (! empty($yearFiltered)) {
                return $yearFiltered;
            }

            return $latest;
        }

        return $this->getLegacyFallbackHolidays();
    }

    /**
     * Get holidays for a year or fallback to latest.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getHolidays(?int $year = null): array
    {
        if ($year !== null && $year > 0) {
            $holidays = $this->getHolidaysByYear($year);
            if (! empty($holidays)) {
                return $holidays;
            }
        }

        return $this->getLatestHolidays();
    }

    /**
     * Check whether a given date is a public holiday using Kemendesa API.
     *
     * @return array{
     *     success: bool,
     *     is_holiday: bool,
     *     date: string,
     *     name: ?string,
     *     is_cuti_bersama: bool,
     *     holiday_type: ?string,
     *     raw: ?array<string, mixed>
     * }
     */
    public function checkIsHoliday(string $date): array
    {
        $dateStr = Carbon::parse($date)->toDateString();
        $url = (string) config('services.holiday_api.is_holiday_url', self::IS_HOLIDAY_URL);
        $timeout = (int) config('services.holiday_api.timeout', 15);

        try {
            $response = Http::timeout($timeout)->get($url, [
                'date' => $dateStr,
            ]);

            if ($response->successful()) {
                $json = $response->json();
                $isHoliday = (bool) ($json['is_holiday'] ?? false);
                $data = $json['data'] ?? null;
                $isCutiBersama = is_array($data) ? (bool) ($data['is_cuti_bersama'] ?? false) : false;

                return [
                    'success' => true,
                    'is_holiday' => $isHoliday,
                    'date' => $dateStr,
                    'name' => is_array($data) ? ($data['name'] ?? null) : null,
                    'is_cuti_bersama' => $isCutiBersama,
                    'holiday_type' => $isHoliday ? ($isCutiBersama ? 'joint_leave' : 'national') : null,
                    'raw' => is_array($json) ? $json : null,
                ];
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal mengecek hari libur dari API Kemendesa', [
                'date' => $dateStr,
                'error' => $e->getMessage(),
            ]);
        }

        return [
            'success' => false,
            'is_holiday' => false,
            'date' => $dateStr,
            'name' => null,
            'is_cuti_bersama' => false,
            'holiday_type' => null,
            'raw' => null,
        ];
    }

    /**
     * Parse raw holiday items into database rows formatted for public_holidays upsert.
     *
     * @param  array<int, mixed>  $rawHolidays
     * @return Collection<int, array<string, mixed>>
     */
    public function parseHolidayRows(array $rawHolidays, int $ownerId): Collection
    {
        $now = now();

        return collect($rawHolidays)
            ->filter(fn (mixed $item): bool => is_array($item)
                && ! empty($item['date'])
                && ! empty($item['name'])
                && Carbon::hasFormat((string) $item['date'], 'Y-m-d'))
            ->map(function (array $holiday) use ($ownerId, $now): array {
                if (isset($holiday['is_cuti_bersama'])) {
                    $isCutiBersama = (bool) $holiday['is_cuti_bersama'];
                    $isNationalHoliday = ! $isCutiBersama;
                    $holidayType = $isCutiBersama ? 'joint_leave' : 'national';
                } elseif (isset($holiday['is_national_holiday'])) {
                    $isNationalHoliday = (bool) $holiday['is_national_holiday'];
                    $holidayType = $isNationalHoliday ? 'national' : 'joint_leave';
                } else {
                    $isNationalHoliday = true;
                    $holidayType = 'national';
                }

                return [
                    'user_id' => $ownerId,
                    'date' => (string) $holiday['date'],
                    'name' => (string) $holiday['name'],
                    'holiday_type' => $holidayType,
                    'is_national_holiday' => $isNationalHoliday,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })
            ->values();
    }

    /**
     * Extract array of holiday items from API JSON response.
     *
     * @return array<int, array<string, mixed>>
     */
    private function extractHolidaysFromResponse(mixed $json): array
    {
        if (! is_array($json)) {
            return [];
        }

        // Format Kemendesa API: {"metadata": {...}, "data": [...]}
        if (isset($json['data']) && is_array($json['data'])) {
            return array_values(array_filter($json['data'], fn ($item) => is_array($item)));
        }

        // Format flat array: [{...}, {...}]
        if (array_is_list($json)) {
            return array_values(array_filter($json, fn ($item) => is_array($item)));
        }

        return [];
    }

    /**
     * Fallback to legacy API if primary Kemendesa endpoints are unreachable.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getLegacyFallbackHolidays(): array
    {
        try {
            $legacyUrl = (string) config('services.holiday_api.legacy_url', self::LEGACY_FALLBACK_URL);
            $timeout = (int) config('services.holiday_api.timeout', 15);
            $response = Http::timeout($timeout)->get($legacyUrl);

            if ($response->successful()) {
                return $this->extractHolidaysFromResponse($response->json());
            }
        } catch (\Throwable) {
            // Silently ignore legacy fallback failure
        }

        return [];
    }
}
