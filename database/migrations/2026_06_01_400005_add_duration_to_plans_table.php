<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // How long a subscription lasts after activation.
            // NULL duration_value = lifetime (never expires).
            $table->unsignedSmallInteger('duration_value')->nullable()->after('trial_days');
            $table->enum('duration_unit', ['days', 'months', 'years'])->default('months')->after('duration_value');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['duration_value', 'duration_unit']);
        });
    }
};
