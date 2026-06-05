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
        Schema::create('savings', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('details')->nullable();
            $table->double('amount');
            $table->unsignedBigInteger('budget_id')->nullable();
            $table->unsignedBigInteger('income_id')->nullable();
            $table->string('saving_for')->nullable();
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('savings');
    }
};
