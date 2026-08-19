<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->json('overtime_events')->nullable()->after('overtime_multiplier_subsequent');
        });

        Schema::table('overtime_requests', function (Blueprint $table) {
            $table->boolean('is_event')->default(false)->after('total_hours');
            $table->string('event_name')->nullable()->after('is_event');
            $table->decimal('event_nominal', 15, 2)->nullable()->after('event_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
