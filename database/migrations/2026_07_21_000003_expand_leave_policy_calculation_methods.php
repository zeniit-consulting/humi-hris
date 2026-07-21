<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_policies', function (Blueprint $table) {
            $table->string('policy_type', 30)->change();
            $table->unsignedSmallInteger('waiting_period_months')->default(0)->after('yearly_days');
        });

        DB::table('leave_policies')->where('policy_type', 'lump_sum')->update(['policy_type' => 'annual']);
        DB::table('leave_policies')->where('policy_type', 'accrual')->update(['policy_type' => 'monthly_accrual']);

        Schema::table('employee_leave_balances', function (Blueprint $table) {
            $table->date('period_start')->nullable()->after('year');
            $table->date('period_end')->nullable()->after('period_start');
        });

        DB::table('employee_leave_balances')->where('policy_type', 'lump_sum')->update(['policy_type' => 'annual']);
        DB::table('employee_leave_balances')->where('policy_type', 'accrual')->update(['policy_type' => 'monthly_accrual']);
    }

    public function down(): void
    {
        DB::table('leave_policies')->whereIn('policy_type', ['annual', 'prorated', 'anniversary'])->update(['policy_type' => 'lump_sum']);
        DB::table('leave_policies')->where('policy_type', 'monthly_accrual')->update(['policy_type' => 'accrual']);
        DB::table('employee_leave_balances')->whereIn('policy_type', ['annual', 'prorated', 'anniversary'])->update(['policy_type' => 'lump_sum']);
        DB::table('employee_leave_balances')->where('policy_type', 'monthly_accrual')->update(['policy_type' => 'accrual']);

        Schema::table('employee_leave_balances', function (Blueprint $table) {
            $table->dropColumn(['period_start', 'period_end']);
        });

        Schema::table('leave_policies', function (Blueprint $table) {
            $table->dropColumn('waiting_period_months');
            $table->enum('policy_type', ['lump_sum', 'accrual'])->change();
        });
    }
};
