<?php

$appEnv = (string) env('APP_ENV', 'production');
$appHost = parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST);
$derivedDomain = null;

if (is_string($appHost) && $appHost !== '') {
    $derivedDomain = str_starts_with($appHost, 'docs.')
        ? $appHost
        : 'docs.'.$appHost;
}

return [
    'title' => env('DOCS_TITLE', 'Manual Book Admin HRIS'),
    'domain' => env('DOCS_DOMAIN', $derivedDomain),
    'manual_path' => base_path('docs/ADMIN_MANUAL_BOOK.md'),
    'fallback_path' => env(
        'DOCS_FALLBACK_PATH',
        in_array($appEnv, ['local', 'testing'], true),
    ),
];
