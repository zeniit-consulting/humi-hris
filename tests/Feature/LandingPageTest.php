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
                ->missing('landingVariant')
            );
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
}
