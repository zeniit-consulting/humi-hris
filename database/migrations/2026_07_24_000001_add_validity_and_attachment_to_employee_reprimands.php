<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_reprimands', function (Blueprint $table): void {
            $table->unsignedInteger('validity_months')->nullable()->after('issued_date');
            $table->string('attachment_path')->nullable()->after('resolution_notes');
            $table->string('attachment_name')->nullable()->after('attachment_path');
        });
    }

    public function down(): void
    {
        Schema::table('employee_reprimands', function (Blueprint $table): void {
            $table->dropColumn(['validity_months', 'attachment_path', 'attachment_name']);
        });
    }
};
