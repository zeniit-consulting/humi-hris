<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sub_companies', fn (Blueprint $table) => $table->string('logo_path')->nullable());
        Schema::table('payroll_items', fn (Blueprint $table) => $table->json('company_identity')->nullable());

        DB::table('payroll_items')->orderBy('id')->each(function ($item): void {
            $employee = DB::table('employees')->where('user_id', $item->user_id)->where('id', $item->employee_id)->first();
            $sub = $employee?->sub_company_id ? DB::table('sub_companies')->where('user_id', $item->user_id)->where('id', $employee->sub_company_id)->first() : null;
            $parent = DB::table('company_settings')->where('user_id', $item->user_id)->first();
            $name = $sub?->name ?: ($parent?->name ?: 'Perusahaan');
            $identity = ['owner_id' => $item->user_id, 'sub_company_id' => $sub?->id];
            if ($item->company_name && $item->company_name !== $name) {
                $identity['unresolved'] = true;
            }
            DB::table('payroll_items')->where('id', $item->id)->update(['company_identity' => json_encode($identity)]);
        });
    }

    public function down(): void
    {
        Schema::table('payroll_items', fn (Blueprint $table) => $table->dropColumn('company_identity'));
        Schema::table('sub_companies', fn (Blueprint $table) => $table->dropColumn('logo_path'));
    }
};
