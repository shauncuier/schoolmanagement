<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Academic Years
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name'); // 2024-2025
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->enum('status', ['active', 'completed', 'upcoming'])->default('upcoming');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Classes (Grades)
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name'); // Class 1, Grade 10, etc.
            $table->string('numeric_name')->nullable(); // 1, 2, 3...
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Sections
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->string('name'); // A, B, C or Morning, Day
            $table->integer('capacity')->default(40);
            $table->foreignId('class_teacher_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('room_number')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['theory', 'practical', 'both'])->default('theory');
            $table->boolean('is_optional')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Class Subjects (which subjects are taught in which class)
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->integer('full_marks')->default(100);
            $table->integer('pass_marks')->default(33);
            $table->decimal('credit_hours', 4, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['class_id', 'subject_id', 'academic_year_id'], 'class_subject_year_unique');
        });

        // Teachers
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_id')->nullable();
            $table->string('designation')->nullable();
            $table->string('department')->nullable();
            $table->date('joining_date')->nullable();
            $table->string('qualification')->nullable();
            $table->text('specialization')->nullable();
            $table->decimal('salary', 12, 2)->nullable();
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'substitute'])->default('full-time');
            $table->json('subjects_can_teach')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Teacher Subject Assignments
        Schema::create('teacher_subject_assignments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['teacher_id', 'class_subject_id', 'section_id', 'academic_year_id'], 'teacher_subject_section_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_subject_assignments');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('class_subjects');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('academic_years');
    }
};
