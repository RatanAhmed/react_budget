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
        Schema::create('email_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->text('password');                   // stored encrypted via Eloquent cast
            $table->json('meta')->nullable();            // { device_count, used_with, notes }
            $table->boolean('status')->default(true);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_credentials');
    }
};
