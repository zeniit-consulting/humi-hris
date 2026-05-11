<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingAbTest extends TestCase
{
    public function test_landing_variant_can_be_forced_to_original(): void
    {
        $this->withoutVite();

        $this->get('/?landing_variant=original')
            ->assertOk()
            ->assertCookie('landing_variant', 'original')
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('landingVariant', 'original')
            );
    }

    public function test_landing_variant_can_be_forced_to_workable(): void
    {
        $this->withoutVite();

        $this->get('/?landing_variant=workable')
            ->assertOk()
            ->assertCookie('landing_variant', 'workable')
            ->assertInertia(fn (Assert $page) => $page
                ->component('landing/workable')
                ->where('landingVariant', 'workable')
            );
    }

    public function test_existing_landing_variant_cookie_is_reused(): void
    {
        $this->withoutVite();

        $this->withCookie('landing_variant', 'workable')
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('landing/workable')
                ->where('landingVariant', 'workable')
            );
    }

    public function test_workable_landing_has_direct_url(): void
    {
        $this->withoutVite();

        $this->get(route('landing.workable'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('landing/workable')
                ->where('landingVariant', 'workable')
            );
    }
}
