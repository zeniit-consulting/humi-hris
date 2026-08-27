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
        Schema::table('reimbursement_requests', function (Blueprint $table) {
            $table->string('category', 50)->default('Others')->after('employee_id');
            $table->foreignId('employee_bank_account_id')->nullable()->after('category')->constrained('employee_bank_accounts')->nullOnDelete();
            $table->string('bank_name', 100)->nullable()->after('employee_bank_account_id');
            $table->string('account_number', 50)->nullable()->after('bank_name');
            $table->string('account_holder_name', 150)->nullable()->after('account_number');

            $table->index(['user_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reimbursement_requests', function (Blueprint $table) {
            $table->dropForeign(['employee_bank_account_id']);
            $table->dropIndex(['user_id', 'category']);
            $table->dropColumn([
                'category',
                'employee_bank_account_id',
                'bank_name',
                'account_number',
                'account_holder_name',
            ]);
        });
    }
};
