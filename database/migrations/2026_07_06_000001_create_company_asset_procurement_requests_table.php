<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_asset_procurement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_by_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('request_number', 50);
            $table->string('item_name', 150);
            $table->string('category', 80)->nullable();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('estimated_unit_price', 15, 2)->default(0);
            $table->decimal('actual_unit_price', 15, 2)->nullable();
            $table->date('needed_by')->nullable();
            $table->string('priority', 30)->default('normal');
            $table->string('status', 30)->default('pending');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'request_number']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'priority']);
        });

        Schema::table('company_assets', function (Blueprint $table) {
            $table
                ->foreignId('procurement_request_id')
                ->nullable()
                ->after('user_id')
                ->constrained('company_asset_procurement_requests')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('company_assets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('procurement_request_id');
        });

        Schema::dropIfExists('company_asset_procurement_requests');
    }
};
