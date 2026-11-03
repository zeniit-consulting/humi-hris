<?php

namespace App\Console\Commands;

use App\Support\HumiNews;
use Illuminate\Console\Command;

class CheckSeo extends Command
{
    protected $signature = 'seo:check';

    protected $description = 'Check public SEO configuration, metadata, assets, and article links';

    public function handle(): int
    {
        $errors = [];
        $warnings = [];
        $baseUrl = config('app.url');
        if (! filter_var($baseUrl, FILTER_VALIDATE_URL)) {
            $errors[] = 'APP_URL must be an absolute URL.';
        } elseif (parse_url($baseUrl, PHP_URL_SCHEME) !== 'https') {
            $warnings[] = 'Use an HTTPS APP_URL on production so canonical and sitemap URLs agree.';
        }
        if (in_array(parse_url($baseUrl, PHP_URL_HOST), ['localhost', '127.0.0.1'], true)) {
            $warnings[] = 'APP_URL points to a local host; set the public domain before deployment.';
        }
        if (! is_file(public_path(ltrim(config('seo.image'), '/')))) {
            $errors[] = 'The configured Open Graph image is missing.';
        }

        $pages = config('seo.pages');
        $titles = [];
        $descriptions = [];
        foreach ($pages as $path => $metadata) {
            if (empty($metadata['title']) || empty($metadata['description'])) {
                $errors[] = $path.': title and description are required.';

                continue;
            }
            if (in_array($metadata['title'], $titles, true) || in_array($metadata['description'], $descriptions, true)) {
                $errors[] = $path.': duplicate title or description.';
            }
            $titles[] = $metadata['title'];
            $descriptions[] = $metadata['description'];
            if (mb_strlen($metadata['title']) > 65 || mb_strlen($metadata['description']) > 170) {
                $warnings[] = $path.': review metadata length for search snippets.';
            }
        }
        foreach (HumiNews::all() as $article) {
            foreach ($article['related_links'] as $link) {
                $path = parse_url($link['href'], PHP_URL_PATH);
                if (str_starts_with($link['href'], '/') && ! isset($pages[$path]) && ! (str_starts_with($path, '/berita/') && HumiNews::find(substr($path, 8)))) {
                    $errors[] = $article['slug'].': unknown internal link '.$link['href'];
                }
            }
        }
        foreach (['google_site_verification', 'bing_site_verification'] as $key) {
            if (! config('seo.'.$key)) {
                $warnings[] = 'Ownership verification not configured: '.$key;
            }
        }
        foreach ($warnings as $warning) {
            $this->warn($warning);
        }
        foreach ($errors as $error) {
            $this->error($error);
        }
        if ($errors !== []) {
            return self::FAILURE;
        }
        $this->info('SEO checks passed for '.count($pages).' public pages and '.HumiNews::all()->count().' articles.');
        $this->line('This checks local configuration; use Search Console and a rendered crawl to verify indexing.');

        return self::SUCCESS;
    }
}
