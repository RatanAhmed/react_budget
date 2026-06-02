<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resume_template_id')->constrained('resume_templates')->restrictOnDelete();
            $table->string('title');                                 // "My Software Engineer Resume"
            $table->string('slug')->unique();                        // shareable public URL slug

            // Personal Info
            $table->string('full_name');
            $table->string('job_title')->nullable();                 // "Sr. Software Engineer"
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('website')->nullable();
            $table->string('photo')->nullable();                     // profile photo path

            // Summary
            $table->text('summary')->nullable();

            // Meta
            $table->string('status')->default('draft');              // draft|published|archived
            $table->boolean('is_public')->default(false);            // shareable public link
            $table->json('custom_style')->nullable();                // user overrides on template style

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resumes');
    }
};
