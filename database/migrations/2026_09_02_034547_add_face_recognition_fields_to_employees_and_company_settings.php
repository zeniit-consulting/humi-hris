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
        Schema::table('employees', function (Blueprint $table): void {
            $table->json('face_embedding')->nullable()->after('notes');
            $table->string('face_photo_url')->nullable()->after('face_embedding');
            $table->timestamp('face_enrolled_at')->nullable()->after('face_photo_url');
        });

        Schema::table('company_settings', function (Blueprint $table): void {
            $table->boolean('require_face_recognition')->default(false)->after('attendance_radius_meters');
        });

        Schema::table('employee_attendances', function (Blueprint $table): void {
            $table->string('check_in_photo_url')->nullable()->after('check_in_longitude');
            $table->string('check_out_photo_url')->nullable()->after('check_out_longitude');
            $table->decimal('face_similarity_score', 5, 4)->nullable()->after('check_out_photo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropColumn(['face_embedding', 'face_photo_url', 'face_enrolled_at']);
        });

        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn('require_face_recognition');
        });

        Schema::table('employee_attendances', function (Blueprint $table): void {
            $table->dropColumn(['check_in_photo_url', 'check_out_photo_url', 'face_similarity_score']);
        });
    }
};
