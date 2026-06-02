<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('icon')->default('🔧');          // emoji or icon class
            $table->string('color')->default('blue');        // tailwind color key
            $table->string('route')->nullable();             // internal app route after login
            $table->string('category')->default('general'); // general | business | finance | utility
            $table->boolean('requires_auth')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('features')->nullable();            // list of feature bullet points
            $table->json('modules')->nullable();             // sub-modules (POS, Inventory, etc.)
            $table->string('badge')->nullable();             // e.g. "New", "Popular"
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
