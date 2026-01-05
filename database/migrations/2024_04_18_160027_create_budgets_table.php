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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description')->nullable();
            $table->double('amount');
            $table->boolean('status')->default(1);
            $table->tinyInteger('type')->default(1)->comment('0=Once, 1=Mandatory, 2=Monthly');
            $table->tinyInteger('priority')->default(0);
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
        Schema::dropIfExists('budgets');
    }
};
