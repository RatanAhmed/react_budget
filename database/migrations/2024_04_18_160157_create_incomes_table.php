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
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('details')->nullable();
            $table->double('amount');
            $table->enum('status',[0,1])->default(1);
            $table->enum('type',[0,1,2])->default(1)->comment('0=Others, 1=Salary, 2=Partial');
            $table->tinyInteger('serial')->default(0);
            $table->tinyInteger('month')->default(0);
            $table->tinyInteger('year')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
