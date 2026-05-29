<?php

namespace Tests\Feature;

use Tests\TestCase;

class MobileGuestRedirectTest extends TestCase
{
    public function test_mobile_guest_can_visit_public_landing_page(): void
    {
        $this->withoutVite();

        $this->withHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148')
            ->get('/')
            ->assertOk();
    }

    public function test_mobile_guest_can_visit_main_auth_page(): void
    {
        $this->withoutVite();

        $this->withHeader('User-Agent', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile')
            ->get(route('login'))
            ->assertOk();
    }

    public function test_employee_login_page_does_not_redirect_itself_on_mobile(): void
    {
        $this->withoutVite();

        $this->withHeader('User-Agent', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile')
            ->get(route('portal.login'))
            ->assertOk();
    }

    public function test_mobile_guest_visiting_protected_portal_page_uses_main_auth_redirect(): void
    {
        $this->withHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148')
            ->get(route('portal.index'))
            ->assertRedirect(route('login'));
    }
}
