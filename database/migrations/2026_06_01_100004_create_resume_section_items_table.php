<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_section_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resume_section_id')->constrained('resume_sections')->cascadeOnDelete();

            // Shared fields
            $table->string('title');                    // Job title / Degree / Cert name / Project name
            $table->string('subtitle')->nullable();     // Company / Institution / Issuer
            $table->string('location')->nullable();
            $table->string('start_date')->nullable();   // stored as string for flexibility "Jan 2020"
            $table->string('end_date')->nullable();     // "Present" or "Dec 2023"
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();    // rich text / bullet points
            $table->string('url')->nullable();          // project URL, cert URL, etc.
            $table->json('extra')->nullable();          // flexible extra fields per section type
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_section_items');
    }
};
