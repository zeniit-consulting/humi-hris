<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class AttendancePhoto
{
    /**
     * Validate base64 photo data to ensure it is a real, non-blank, non-corrupted image.
     *
     * @return array{valid: bool, error: ?string, binary: ?string, mime: ?string, ext: ?string}
     */
    public static function validate(string $base64Data): array
    {
        if (empty($base64Data) || ! str_starts_with($base64Data, 'data:image/')) {
            return [
                'valid' => false,
                'error' => 'Format foto tidak valid.',
                'binary' => null,
                'mime' => null,
                'ext' => null,
            ];
        }

        $parts = explode(';base64,', $base64Data);
        if (count($parts) !== 2) {
            return [
                'valid' => false,
                'error' => 'Data base64 foto tidak lengkap.',
                'binary' => null,
                'mime' => null,
                'ext' => null,
            ];
        }

        $mime = str_replace('data:', '', $parts[0]);
        $typeAux = explode('image/', $parts[0]);
        $ext = $typeAux[1] ?? 'jpg';
        $binary = base64_decode($parts[1], true);

        if ($binary === false || strlen($binary) < 500) {
            return [
                'valid' => false,
                'error' => 'Ukuran file foto terlalu kecil atau tidak valid.',
                'binary' => null,
                'mime' => null,
                'ext' => null,
            ];
        }

        $imageInfo = @getimagesizefromstring($binary);
        if (! $imageInfo || $imageInfo[0] < 50 || $imageInfo[1] < 50) {
            return [
                'valid' => false,
                'error' => 'Dimensi gambar tidak valid atau gambar rusak.',
                'binary' => null,
                'mime' => null,
                'ext' => null,
            ];
        }

        // Check if image is blank / all black / solid flat monochrome
        if (self::isBlank($binary, (int) $imageInfo[0], (int) $imageInfo[1])) {
            return [
                'valid' => false,
                'error' => 'Foto presensi terdeteksi kosong/blank atau terlalu gelap. Pastikan pencahayaan cukup dan wajah terlihat jelas.',
                'binary' => null,
                'mime' => null,
                'ext' => null,
            ];
        }

        return [
            'valid' => true,
            'error' => null,
            'binary' => $binary,
            'mime' => $mime,
            'ext' => $ext,
        ];
    }

    /**
     * Check if image binary is completely black or monochrome blank.
     */
    public static function isBlank(string $binary, int $width, int $height): bool
    {
        if (! extension_loaded('gd')) {
            return false;
        }

        $img = @imagecreatefromstring($binary);
        if (! $img) {
            return true;
        }

        $sampleSteps = 16;
        $stepX = max(1, (int) ($width / $sampleSteps));
        $stepY = max(1, (int) ($height / $sampleSteps));
        $totalLum = 0;
        $minLum = 255;
        $maxLum = 0;
        $count = 0;

        for ($x = 0; $x < $width; $x += $stepX) {
            for ($y = 0; $y < $height; $y += $stepY) {
                $rgb = imagecolorat($img, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $lum = 0.299 * $r + 0.587 * $g + 0.114 * $b;
                $totalLum += $lum;
                if ($lum < $minLum) {
                    $minLum = $lum;
                }
                if ($lum > $maxLum) {
                    $maxLum = $lum;
                }
                $count++;
            }
        }

        imagedestroy($img);

        if ($count === 0) {
            return true;
        }

        $avgLum = $totalLum / $count;

        // Extremely dark (avg lum < 8) or solid flat monochrome with low contrast
        return $avgLum < 8 || ($maxLum - $minLum < 3 && ($avgLum < 15 || $avgLum > 240));
    }

    /**
     * Store validated photo to R2 or public disk and return public URL.
     */
    public static function storePhoto(string $binary, string $prefix, int $employeeId, string $ext = 'jpg'): ?string
    {
        $filename = 'attendances/'.$prefix.'_'.$employeeId.'_'.time().'.'.$ext;

        if (R2Storage::isConfigured()) {
            R2Storage::disk()->put($filename, $binary);

            return R2Storage::url($filename);
        }

        Storage::disk('public')->put($filename, $binary);

        return Storage::disk('public')->url($filename);
    }
}
