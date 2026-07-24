<?php

namespace App\Support;

final class FixedAllowanceAmount
{
    public const MAX = 99_999_999;

    public static function normalize(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $raw = trim((string) $value);

        if (preg_match('/^\d+\.\d{2}$/', $raw) === 1) {
            $raw = strstr($raw, '.', true);
        }

        $digits = preg_replace('/[^\d]/', '', $raw);

        return $digits === '' ? null : $digits;
    }
}
