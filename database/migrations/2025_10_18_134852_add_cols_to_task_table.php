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
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('task_categories_id')->nullable()->after('status');
            $table->foreign('task_categories_id')->references('id')->on('task_categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task', function (Blueprint $table) {
            $table->dropForeign(['task_categories_id']);
            $table->dropColumn(['task_categories_id']);
        });
    }
};
