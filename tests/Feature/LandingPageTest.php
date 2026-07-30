<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    public function test_landing_page_always_uses_current_style(): void
    {
        $this->withoutVite();

        $this->get('/?landing_variant=workable')
            ->assertOk()
            ->assertCookieMissing('landing_variant')
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('canRegister', true)
                ->missing('landingVariant')
            );
    }

    public function test_landing_page_uses_reference_hero_and_dashboard_preview_asset(): void
    {
        $source = implode("\n", [
            file_get_contents(resource_path('js/pages/welcome.tsx')),
            file_get_contents(resource_path('js/components/landing-nav.tsx')),
            file_get_contents(resource_path('js/components/front-hero-typography.ts')),
        ]);

        $this->assertIsString($source);
        $this->assertStringContainsString('Kelola tim Anda', $source);
        $this->assertStringContainsString('dengan lebih sederhana', $source);
        $this->assertStringContainsString('Humi adalah HRIS terpadu', $source);
        $this->assertStringContainsString('modern. Otomatisasi', $source);
        $this->assertStringContainsString('Buka Dashboard', $source);
        $this->assertStringContainsString('Lihat Solusi', $source);
        $this->assertStringContainsString('70%', $source);
        $this->assertStringContainsString('&lt; 10 mnt', $source);
        $this->assertStringContainsString('99.9%', $source);
        $this->assertStringContainsString('/humi-dashboard-preview.webp', $source);
        $this->assertStringContainsString('rounded-[2%]', $source);
        $this->assertStringContainsString('bg-white', $source);
        $this->assertStringContainsString('/humi-wordmark.png', $source);
        $this->assertStringContainsString('fixed inset-x-0 top-0', $source);
        $this->assertStringContainsString('mx-auto flex h-18 w-full', $source);
        $this->assertStringNotContainsString('w-fit max-w-full', $source);
        $this->assertStringContainsString('text-[40px]', $source);
        $this->assertStringContainsString('leading-[56px]', $source);
        $this->assertStringContainsString('whitespace-nowrap', $source);
        $this->assertStringNotContainsString('text-[clamp(3.25rem,7.3vw,8rem)]', $source);
    }

    public function test_landing_v2_variant_is_available(): void
    {
        $this->withoutVite();

        $this->get('/landing-v2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('landing/mintlify')
                ->where('canRegister', true)
            );
    }

    public function test_industry_landing_pages_are_available(): void
    {
        $this->withoutVite();

        $pages = [
            '/hris-outsourcing' => 'outsourcing',
            '/hris-retail-fnb' => 'retail-fnb',
            '/hris-manufaktur-shift' => 'manufaktur-shift',
        ];

        foreach ($pages as $path => $slug) {
            $this->get($path)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('landing/industry')
                    ->where('industrySlug', $slug)
                    ->where('canRegister', true)
                );
        }
    }

    public function test_public_news_pages_are_available(): void
    {
        $this->withoutVite();

        $this->get('/berita')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('news/index')
                ->has('articles', 4)
            );

        $this->get('/berita/apa-itu-hris-cara-memilih-software-hris-indonesia')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('news/show')
                ->where('article.slug', 'apa-itu-hris-cara-memilih-software-hris-indonesia')
                ->has('article.faqs', 3)
                ->has('relatedArticles', 3)
            );
    }

    public function test_unknown_news_article_returns_not_found(): void
    {
        $this->withoutVite();

        $this->get('/berita/artikel-tidak-ada')->assertNotFound();
    }
}
