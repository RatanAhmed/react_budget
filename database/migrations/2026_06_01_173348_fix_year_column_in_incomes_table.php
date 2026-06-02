<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Change the year column from tinyInteger (max 127) to smallInteger (max 32767)
     * so it can store actual year values like 2026.
     */
    public function up(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            $table->smallInteger('year')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            $table->tinyInteger('year')->default(0)->change();
        });
    }
};
