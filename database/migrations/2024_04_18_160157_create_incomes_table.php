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
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('details')->nullable();
            $table->double('amount');
            $table->boolean('status')->default(1);
            $table->tinyInteger('type')->default(1)->comment('0=Others, 1=Salary, 2=Partial');
            $table->tinyInteger('serial')->default(0);
            $table->tinyInteger('month')->default(0);
            $table->smallInteger('year')->default(0);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
