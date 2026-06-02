<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained('payment_transactions')->nullOnDelete();
            $table->string('format')->default('pdf');          // pdf | docx
            $table->decimal('amount_paid', 10, 2)->default(0); // 0 = free (if you add free tier later)
            $table->string('status')->default('pending');      // pending | paid | free
            $table->string('download_token')->unique()->nullable(); // one-time signed token
            $table->timestamp('token_expires_at')->nullable();
            $table->timestamp('downloaded_at')->nullable();
            $table->timestamps();

            $table->index(['resume_id', 'user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_downloads');
    }
};
