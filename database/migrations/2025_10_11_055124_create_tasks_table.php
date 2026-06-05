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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('time')->nullable();
            $table->date('end_date')->nullable();
            $table->time('end_time')->nullable();
            $table->string('details');
            $table->tinyInteger('priority')->default(0);
            $table->tinyInteger('status')->default(0)->comment('0=Pending,1=Done,2=Processing');
            $table->string('remarks')->nullable();
            // FK to task_categories added after that table is created (see create_task_categories_table)
            $table->unsignedBigInteger('task_categories_id')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
