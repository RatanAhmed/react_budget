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
        Schema::create('task_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('task_id')
                  ->constrained('tasks')
                  ->cascadeOnDelete();

            $table->enum('interval_type', ['daily', 'weekly', 'monthly', 'yearly']);

            $table->unsignedTinyInteger('interval_value')->default(1);
            // every N days / weeks / months / years

            $table->json('week_days')->nullable();
            // ["sun","mon","tue"] → weekly routine

            $table->unsignedTinyInteger('month_day')->nullable();
            // 1–31 → monthly / yearly

            $table->unsignedTinyInteger('month')->nullable();
            // 1–12 → yearly

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_schedules');
    }
};
