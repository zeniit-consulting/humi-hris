<?php

namespace Tests\Feature;

use Tests\TestCase;

class MobileGuestRedirectTest extends TestCase
{
    public function test_mobile_guest_visiting_public_page_is_redirected_to_employee_login(): void
    {
        $this->withHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148')
            ->get('/')
            ->assertRedirect(route('portal.login'));
    }

    public function test_employee_login_page_does_not_redirect_itself_on_mobile(): void
    {
        $this->withoutVite();

        $this->withHeader('User-Agent', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile')
            ->get(route('portal.login'))
            ->assertOk();
    }
}
