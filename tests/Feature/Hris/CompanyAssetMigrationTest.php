<?php

namespace Tests\Feature\Hris;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CompanyAssetMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_procurement_migration_can_reconcile_an_existing_table(): void
    {
        Schema::table('company_assets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('procurement_request_id');
        });

        $this->assertTrue(Schema::hasTable('comp_ast_proc_requests'));
        $this->assertFalse(Schema::hasColumn('company_assets', 'procurement_request_id'));

        $migration = require database_path(
            'migrations/2026_07_06_000001_create_comp_ast_proc_requests_table.php',
        );

        $migration->up();

        $this->assertTrue(Schema::hasColumn('company_assets', 'procurement_request_id'));
    }
}
