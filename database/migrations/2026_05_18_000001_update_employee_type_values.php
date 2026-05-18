<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('employees')
            ->whereNotNull('sub_company_id')
            ->update(['employment_type' => 'OS']);

        DB::table('employees')
            ->whereNull('sub_company_id')
            ->where('employment_type', 'permanent')
            ->update(['employment_type' => 'PKWTT']);

        DB::table('employees')
            ->whereNull('sub_company_id')
            ->where('employment_type', 'contract')
            ->update(['employment_type' => 'PKWT']);

        DB::table('employees')
            ->whereNull('sub_company_id')
            ->whereIn('employment_type', ['freelance', 'internship'])
            ->update(['employment_type' => 'FL']);
    }

    public function down(): void
    {
        DB::table('employees')
            ->where('employment_type', 'PKWTT')
            ->update(['employment_type' => 'permanent']);

        DB::table('employees')
            ->whereIn('employment_type', ['PKWT', 'OS'])
            ->update(['employment_type' => 'contract']);

        DB::table('employees')
            ->where('employment_type', 'FL')
            ->update(['employment_type' => 'freelance']);
    }
};
