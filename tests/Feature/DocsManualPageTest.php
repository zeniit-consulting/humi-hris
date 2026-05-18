<?php

namespace Tests\Feature;

use Tests\TestCase;

class DocsManualPageTest extends TestCase
{
    public function test_docs_manual_page_is_available_on_docs_subdomain(): void
    {
        $this->withoutVite();
        $domain = config('docs.domain');

        $this->get('http://'.$domain)
            ->assertOk()
            ->assertSee('Manual Book Admin HRIS')
            ->assertSee('Dashboard')
            ->assertSee('Pengaturan Profil');
    }

    public function test_docs_manual_page_is_available_on_local_preview_path(): void
    {
        $this->withoutVite();

        $this->get('/docs')
            ->assertOk()
            ->assertSee('Manual Book Admin HRIS')
            ->assertSee('Sub Company')
            ->assertSee('Payroll');
    }
}
