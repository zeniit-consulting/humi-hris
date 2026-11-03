<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\JobVacancy;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoInfrastructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_metadata_is_available_without_javascript_or_ssr(): void
    {
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false, 'app.url' => 'https://humi.test']);

        foreach (['/', '/features', '/contact', '/software-hris', '/hris-outsourcing', '/hris-retail-fnb', '/hris-manufaktur-shift', '/berita', '/careers'] as $path) {
            $response = $this->get($path.'?utm_source=seo-test')->assertOk();
            $html = new \DOMDocument;
            @$html->loadHTML($response->getContent());
            $xpath = new \DOMXPath($html);
            $this->assertCount(1, $xpath->query('//title'));
            $this->assertCount(1, $xpath->query('//meta[@name="description"]'));
            $this->assertCount(1, $xpath->query('//link[@rel="canonical"]'));
            $canonical = 'https://humi.test'.($path === '/' ? '' : $path);
            $this->assertSame($canonical, $xpath->evaluate('string(//link[@rel="canonical"]/@href)'));
            $this->assertSame($canonical, $xpath->evaluate('string(//meta[@property="og:url"]/@content)'));
            $this->assertStringContainsString('index, follow', $xpath->evaluate('string(//meta[@name="robots"]/@content)'));
            $this->assertNotEmpty($xpath->evaluate('string(//meta[@name="description"]/@content)'));
            $this->assertNotEmpty($xpath->query('//script[@type="application/ld+json"]')->length);
        }
    }

    public function test_article_metadata_matches_inertia_props_and_has_valid_schema(): void
    {
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false, 'app.url' => 'https://humi.test']);
        $path = '/berita/apa-itu-hris-cara-memilih-software-hris-indonesia';
        $response = $this->get($path)->assertOk();
        $html = new \DOMDocument;
        @$html->loadHTML($response->getContent());
        $xpath = new \DOMXPath($html);
        $page = json_decode($xpath->evaluate('string(//*[@id="app"]/@data-page)'), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame($page['props']['seo']['title'], $xpath->evaluate('string(//title)'));
        $schema = json_decode($xpath->evaluate('string(//script[@type="application/ld+json"])'), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('Article', $schema[0]['@type']);
        $this->assertSame('2026-07-08', $schema[0]['dateModified']);
    }

    public function test_verification_tags_are_optional_and_configurable(): void
    {
        $this->withoutVite();
        config(['seo.google_site_verification' => 'google-test-token', 'seo.bing_site_verification' => 'bing-test-token']);
        $this->get('/')->assertOk()
            ->assertSee('name="google-site-verification" content="google-test-token"', false)
            ->assertSee('name="msvalidate.01" content="bing-test-token"', false);
    }

    public function test_private_pages_and_filtered_careers_are_not_indexable(): void
    {
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false]);
        $this->get('/login')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get('/careers?search=HR')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow');
        $this->get('/landing-v2')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow');
    }

    public function test_static_sitemap_dates_do_not_change_on_each_request(): void
    {
        $this->travelTo(now()->startOfDay());
        $first = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->travel(1)->hours();
        $second = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertSame($first, $second);
    }

    public function test_ssr_head_does_not_duplicate_fallback_metadata(): void
    {
        $this->withoutVite();
        $gateway = $this->mock(\Inertia\Ssr\Gateway::class);
        $gateway->shouldReceive('dispatch')->once()->andReturn(new \Inertia\Ssr\Response(
            '<title inertia>SSR title</title><meta inertia="description" name="description" content="SSR description">',
            '<div id="app">Rendered page</div>',
        ));
        $response = $this->get('/')->assertOk();
        $html = new \DOMDocument;
        @$html->loadHTML($response->getContent());
        $xpath = new \DOMXPath($html);
        $this->assertCount(1, $xpath->query('//title'));
        $this->assertCount(1, $xpath->query('//meta[@name="description"]'));
        $this->assertSame('SSR title', $xpath->evaluate('string(//title)'));
    }

    public function test_career_pagination_keeps_its_own_canonical_url(): void
    {
        $this->withoutVite();
        config(['app.url' => 'https://humi.test', 'inertia.ssr.enabled' => false]);
        $this->get('/careers?page=2&utm_source=test')->assertOk()
            ->assertSee('rel="canonical" href="https://humi.test/careers?page=2"', false);
    }

    public function test_seo_check_detects_broken_configuration(): void
    {
        config(['app.url' => 'https://humi.test']);
        $this->artisan('seo:check')->assertSuccessful();
        config(['seo.image' => '/missing-og-image.png']);
        $this->artisan('seo:check')->assertFailed();
    }

    public function test_vacancy_metadata_is_escaped_and_shared_with_the_client(): void
    {
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false]);
        $vacancy = JobVacancy::factory()->create([
            'title' => 'HR & Operations <Team>', 'slug' => 'hr-operations',
            'description' => '<p>Kelola SDM &amp; operasional.</p>',
            'status' => 'published', 'closing_date' => now()->addMonth(),
        ]);
        $response = $this->get('/careers/'.$vacancy->slug)->assertOk()->assertHeaderMissing('X-Robots-Tag');
        $html = new \DOMDocument;
        @$html->loadHTML($response->getContent());
        $xpath = new \DOMXPath($html);
        $this->assertSame('HR & Operations <Team> | Lowongan Kerja Humi HRIS', $xpath->evaluate('string(//title)'));
        $this->assertSame('Kelola SDM & operasional.', $xpath->evaluate('string(//meta[@name="description"]/@content)'));
        json_decode($xpath->evaluate('string(//script[@type="application/ld+json"])'), true, flags: JSON_THROW_ON_ERROR);
    }

    public function test_robots_txt_points_crawlers_to_sitemap_and_blocks_private_routes(): void
    {
        config(['app.url' => 'https://humi.test']);

        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('User-agent: *', false)
            ->assertSee('User-agent: Googlebot', false)
            ->assertSee('User-agent: GPTBot', false)
            ->assertSee('User-agent: OAI-SearchBot', false)
            ->assertSee('User-agent: PerplexityBot', false)
            ->assertSee('User-agent: ClaudeBot', false)
            ->assertSee('Allow: /', false)
            ->assertSee('Allow: /features', false)
            ->assertSee('Allow: /contact', false)
            ->assertSee('Allow: /berita', false)
            ->assertSee('Allow: /careers', false)
            ->assertSee('Disallow: /portal', false)
            ->assertSee('Disallow: /login', false)
            ->assertSee('Sitemap: https://humi.test/sitemap.xml', false);
    }

    public function test_sitemap_includes_public_pages_and_active_job_vacancies(): void
    {
        config(['app.url' => 'https://humi.test']);

        $user = User::factory()->create();
        $division = Division::factory()->create([
            'user_id' => $user->id,
        ]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
        ]);

        JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'HR Operations Specialist',
            'slug' => 'hr-operations-specialist',
            'status' => 'published',
            'closing_date' => now()->addMonth(),
        ]);

        JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'Expired Vacancy',
            'slug' => 'expired-vacancy',
            'status' => 'published',
            'closing_date' => now()->subDay(),
        ]);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml')
            ->assertSee('<loc>https://humi.test</loc>', false)
            ->assertSee('<loc>https://humi.test/features</loc>', false)
            ->assertSee('<loc>https://humi.test/contact</loc>', false)
            ->assertSee('<loc>https://humi.test/berita</loc>', false)
            ->assertSee(
                '<loc>https://humi.test/berita/apa-itu-hris-cara-memilih-software-hris-indonesia</loc>',
                false,
            )
            ->assertSee('<loc>https://humi.test/careers</loc>', false)
            ->assertSee(
                '<loc>https://humi.test/careers/hr-operations-specialist</loc>',
                false,
            )
            ->assertDontSee('expired-vacancy', false);
    }

    public function test_llms_txt_describes_public_product_sources_without_private_routes(): void
    {
        config(['app.url' => 'https://humi.test']);

        $this->get('/llms.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('# Humi HRIS', false)
            ->assertSee('https://humi.test/features', false)
            ->assertSee('https://humi.test/hris-outsourcing', false)
            ->assertSee('https://humi.test/berita', false)
            ->assertSee('bersifat privat', false)
            ->assertDontSee('/api/mobile/v1', false)
            ->assertDontSee('/dashboard', false);
    }
}
