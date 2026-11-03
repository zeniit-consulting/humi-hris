<?php

namespace App\Support;

use App\Models\JobVacancy;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SeoMetadata
{
    public const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    public static function forRequest(Request $request): array
    {
        $path = '/'.trim($request->path(), '/');
        $pages = config('seo.pages');
        if (isset($pages[$path])) {
            $seo = self::page($path, $pages[$path]);
            if ($path === '/careers') {
                if ($request->filled('search') || $request->filled('employment_type')) {
                    $seo['robots'] = 'noindex, follow';
                } elseif (($page = (int) $request->query('page', 1)) > 1) {
                    $seo['canonicalUrl'] .= '?page='.$page;
                    $seo['title'] = 'Lowongan Kerja & Karier - Halaman '.$page.' | Humi HRIS';
                }
            }

            return $seo;
        }

        if ($request->routeIs('landing-v2')) {
            return [...self::page('/', $pages['/']), 'robots' => 'noindex, follow'];
        }

        return ['robots' => 'noindex, nofollow'];
    }

    public static function page(string $path, array $metadata): array
    {
        $base = rtrim(config('app.url'), '/');
        $url = $base.($path === '/' ? '' : $path);
        $seo = [
            ...$metadata,
            'canonicalUrl' => $url,
            'imageUrl' => $base.config('seo.image'),
            'type' => 'website',
            'robots' => self::INDEX,
            'structuredData' => [[
                '@context' => 'https://schema.org',
                '@type' => $path === '/berita' ? 'CollectionPage' : 'WebPage',
                'name' => $metadata['title'],
                'description' => $metadata['description'],
                'url' => $url,
                'inLanguage' => 'id-ID',
                'isPartOf' => ['@type' => 'WebSite', '@id' => $base.'/#website', 'name' => 'Humi HRIS', 'url' => $base],
            ]],
        ];

        if ($path === '/') {
            $seo['structuredData'][] = [
                '@context' => 'https://schema.org', '@type' => 'Organization',
                '@id' => $base.'/#organization', 'name' => 'Humi', 'url' => $base,
                'logo' => $base.'/logo.png',
            ];
        } else {
            $seo['structuredData'][] = [
                '@context' => 'https://schema.org', '@type' => 'BreadcrumbList',
                'itemListElement' => [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Beranda', 'item' => $base],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => $metadata['title'], 'item' => $url],
                ],
            ];
        }

        return $seo;
    }

    public static function article(array $article): array
    {
        $seo = self::page('/berita/'.$article['slug'], [
            'title' => $article['title'].' | Humi',
            'description' => $article['description'],
            'keywords' => $article['keywords'],
        ]);
        $seo['type'] = 'article';
        $seo['publishedTime'] = $article['published_at'];
        $seo['modifiedTime'] = $article['updated_at'];
        $seo['structuredData'][0] = [
            '@context' => 'https://schema.org', '@type' => 'Article',
            'headline' => $article['title'], 'description' => $article['description'],
            'datePublished' => $article['published_at'], 'dateModified' => $article['updated_at'],
            'mainEntityOfPage' => $seo['canonicalUrl'], 'image' => [$seo['imageUrl']], 'inLanguage' => 'id-ID',
            'author' => ['@type' => 'Organization', 'name' => 'Humi', 'url' => rtrim(config('app.url'), '/')],
            'publisher' => ['@type' => 'Organization', 'name' => 'Humi', 'logo' => ['@type' => 'ImageObject', 'url' => rtrim(config('app.url'), '/').'/logo.png']],
        ];
        $seo['structuredData'][1]['itemListElement'][1] = ['@type' => 'ListItem', 'position' => 2, 'name' => 'Panduan HRIS', 'item' => rtrim(config('app.url'), '/').'/berita'];
        $seo['structuredData'][1]['itemListElement'][] = ['@type' => 'ListItem', 'position' => 3, 'name' => $article['title'], 'item' => $seo['canonicalUrl']];
        if (! empty($article['faqs'])) {
            $seo['structuredData'][] = [
                '@context' => 'https://schema.org', '@type' => 'FAQPage',
                'mainEntity' => array_map(fn (array $faq): array => [
                    '@type' => 'Question', 'name' => $faq['question'],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $faq['answer']],
                ], $article['faqs']),
            ];
        }

        return $seo;
    }

    public static function vacancy(JobVacancy $vacancy): array
    {
        return self::page('/careers/'.$vacancy->slug, [
            'title' => $vacancy->title.' | Lowongan Kerja Humi HRIS',
            'description' => Str::limit(Str::squish(html_entity_decode(strip_tags($vacancy->description ?? ''), ENT_QUOTES, 'UTF-8')), 160),
            'keywords' => implode(', ', array_filter([$vacancy->title, $vacancy->location, 'lowongan kerja'])),
        ]);
    }
}
