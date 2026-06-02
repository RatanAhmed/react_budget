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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['lend', 'borrow']);        // lend = gave money, borrow = received money
            $table->string('person_name');
            $table->string('person_phone')->nullable();
            $table->decimal('amount', 12, 2);                // original loan amount
            $table->text('note')->nullable();
            $table->date('loan_date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
