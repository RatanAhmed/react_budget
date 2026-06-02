<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');                                  // "Modern Professional"
            $table->string('slug')->unique();                        // "modern-professional"
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();                 // preview image path
            $table->string('category')->default('professional');     // professional|creative|minimal|academic|executive
            $table->string('color_scheme')->default('blue');         // primary color key
            $table->string('layout')->default('single-column');      // single-column|two-column|sidebar-left|sidebar-right
            $table->string('font_family')->default('Inter');
            $table->json('sections_config')->nullable();             // which sections are shown/hidden by default
            $table->json('style_config')->nullable();                // font sizes, spacing, accent colors
            $table->boolean('is_active')->default(true);
            $table->boolean('is_premium')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_templates');
    }
};
