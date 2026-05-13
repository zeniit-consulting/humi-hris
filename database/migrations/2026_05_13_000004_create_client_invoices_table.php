<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_invoices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sub_company_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number', 60);
            $table->string('period', 7);
            $table->date('issued_at');
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('draft');
            $table->unsignedInteger('employee_count')->default(0);
            $table->decimal('payroll_cost', 15, 2)->default(0);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'invoice_number']);
            $table->index(['user_id', 'sub_company_id', 'period']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('client_invoice_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description', 180);
            $table->decimal('quantity', 12, 2)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();

            $table->index(['user_id', 'client_invoice_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_invoice_items');
        Schema::dropIfExists('client_invoices');
    }
};
