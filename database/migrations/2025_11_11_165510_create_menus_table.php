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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image')->nullable();
            $table->string('description')->nullable();
            $table->double('price', 6, 2)->default(0);
            $table->boolean('available')->default(1);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
