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
}
