<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class PortalEmailOtpLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_employee_otp_routes_are_not_available(): void
    {
        $this->assertFalse(Route::has('portal.login.send-otp'));
        $this->assertFalse(Route::has('portal.login.verify-otp'));
    }
}
