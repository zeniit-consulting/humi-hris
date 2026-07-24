<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const MAX_FIXED_ALLOWANCE = 99_999_999;

    /**
     * Repair values multiplied by 100 when decimal values were remasked.
     */
    public function up(): void
    {
        $this->repairTable('employee_allowances', 'amount');

        if (Schema::hasColumn('employee_bank_accounts', 'fixed_allowance_amount')) {
            $this->repairTable('employee_bank_accounts', 'fixed_allowance_amount');
        }
    }

    public function down(): void
    {
        // Corrected monetary data must not be multiplied again on rollback.
    }

    private function repairTable(string $table, string $column): void
    {
        DB::table($table)
            ->where($column, '>', self::MAX_FIXED_ALLOWANCE)
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($table, $column): void {
                foreach ($rows as $row) {
                    $amount = (float) $row->{$column};

                    while ($amount > self::MAX_FIXED_ALLOWANCE) {
                        $amount /= 100;
                    }

                    DB::table($table)
                        ->where('id', $row->id)
                        ->update([$column => round($amount, 2)]);
                }
            });
    }
};
