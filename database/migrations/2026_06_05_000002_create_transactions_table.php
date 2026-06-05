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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->enum('type', [
                'income',
                'expense',
                'transfer',
                'lend',
                'borrow',
                'lend_repayment',
                'borrow_repayment',
                'saving',
            ]);
            // credit = money comes in, debit = money goes out
            $table->enum('direction', ['credit', 'debit']);
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->tinyInteger('month');   // stored for fast monthly filtering
            $table->smallInteger('year');
            $table->string('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('budget_id')->nullable()->constrained('budgets')->nullOnDelete();
            // Polymorphic reference — e.g. loan_id, saving_goal_id
            $table->string('reference_type')->nullable();  // 'loan', 'saving_goal', 'transfer'
            $table->unsignedBigInteger('reference_id')->nullable();
            // For account-to-account transfers: points to the paired transaction
            $table->foreignId('transfer_pair_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
