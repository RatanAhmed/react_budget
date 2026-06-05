<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('txn_id')->unique();              // internal transaction ID
            $table->string('gateway_slug', 50);                 // bkash | nagad | card | cash
            $table->foreignId('gateway_id')->constrained('payment_gateways')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Polymorphic: link to any payable model (invoice, order, subscription, etc.)
            $table->nullableMorphs('payable');

            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('BDT');
            $table->string('status', 20)->default('pending');   // pending | completed | failed | refunded | cancelled
            $table->string('gateway_txn_id')->nullable();    // gateway's own transaction ID
            $table->string('gateway_ref')->nullable();       // payment reference / trxID
            $table->string('phone')->nullable();             // mobile number for bKash/Nagad
            $table->text('note')->nullable();
            $table->json('gateway_response')->nullable();    // raw response from gateway
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'gateway_slug']);
            $table->index('txn_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
