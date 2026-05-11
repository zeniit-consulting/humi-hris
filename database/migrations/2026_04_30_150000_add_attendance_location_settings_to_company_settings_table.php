<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->string('location_name', 150)->nullable()->after('details');
            $table->text('location_address')->nullable()->after('location_name');
            $table->decimal('location_latitude', 10, 7)->nullable()->after('location_address');
            $table->decimal('location_longitude', 10, 7)->nullable()->after('location_latitude');
            $table->unsignedInteger('attendance_radius_meters')->default(100)->after('location_longitude');
            $table->json('attendance_locations')->nullable()->after('attendance_radius_meters');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'location_name',
                'location_address',
                'location_latitude',
                'location_longitude',
                'attendance_radius_meters',
                'attendance_locations',
            ]);
        });
    }
};
