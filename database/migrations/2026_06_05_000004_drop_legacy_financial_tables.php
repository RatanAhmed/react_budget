<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop the legacy separate-table financial records.
 * Data was already migrated to accounts + transactions in migration 000003.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('savings');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('incomes');
    }

    public function down(): void
    {
        // Restore empty table shells so that migration 000003's down()
        // can run without FK errors. The actual data lives in transactions.
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('details')->nullable();
            $table->double('amount');
            $table->tinyInteger('status')->default(1);
            $table->tinyInteger('type')->default(1);
            $table->tinyInteger('month')->default(0);
            $table->smallInteger('year')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('details')->nullable();
            $table->double('amount');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('budget_id')->nullable();
            $table->unsignedBigInteger('income_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('savings', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('details')->nullable();
            $table->double('amount');
            $table->unsignedBigInteger('budget_id')->nullable();
            $table->unsignedBigInteger('income_id')->nullable();
            $table->string('saving_for')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('loan_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('loans')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->text('note')->nullable();
            $table->date('repayment_date');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }
};
