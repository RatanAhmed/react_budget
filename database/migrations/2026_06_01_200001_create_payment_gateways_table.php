<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // e.g. bKash, Nagad, Card, Cash
            $table->string('slug')->unique();                // bkash | nagad | card | cash
            $table->string('logo')->nullable();              // image path or URL
            $table->string('color')->default('#ffffff');     // brand color for UI
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->boolean('is_sandbox')->default(true);   // sandbox / live toggle
            $table->text('credentials')->nullable();         // encrypted config (keys, secrets)
            $table->json('settings')->nullable();            // extra settings (fee %, fixed fee, etc.)
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateways');
    }
};
