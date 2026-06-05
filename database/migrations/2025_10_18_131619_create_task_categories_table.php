<?php

use App\Traits\AuditableColumns;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use AuditableColumns;

    public function up(): void
    {
        Schema::create('task_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('status')->default(true);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });

        // Now that task_categories exists, add the FK on tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('task_categories_id')->references('id')->on('task_categories');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['task_categories_id']);
        });

        Schema::dropIfExists('task_categories');
    }
};
