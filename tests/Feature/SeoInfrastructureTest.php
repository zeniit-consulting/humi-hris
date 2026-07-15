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
}
