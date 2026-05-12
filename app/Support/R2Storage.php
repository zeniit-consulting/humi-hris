<?php

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class R2Storage
{
    public static function isConfigured(): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        $config = config('filesystems.disks.r2');

        return filled($config['key'] ?? null)
            && filled($config['secret'] ?? null)
            && filled($config['bucket'] ?? null)
            && filled($config['endpoint'] ?? null);
    }

    public static function disk(): Filesystem
    {
        if (! self::isConfigured()) {
            throw new RuntimeException('Cloudflare R2 belum dikonfigurasi lengkap.');
        }

        return Storage::disk('r2');
    }

    public static function url(?string $path): ?string
    {
        if (! $path || ! self::isConfigured()) {
            return null;
        }

        return Storage::disk('r2')->url($path);
    }
}
