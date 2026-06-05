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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['cash', 'bank', 'savings', 'credit', 'investment'])->default('cash');
            $table->string('currency', 10)->default('BDT');
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->boolean('is_default')->default(false);
            $table->string('color', 20)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
