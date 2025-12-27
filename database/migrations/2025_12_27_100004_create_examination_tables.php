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
        // Exam Types (Term, Final, Unit Test, etc.)
        Schema::create('exam_types', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name'); // First Term, Midterm, Final, etc.
            $table->text('description')->nullable();
            $table->integer('weightage')->default(100); // Percentage weightage
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Grading Systems
        Schema::create('grading_systems', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name'); // GPA, CGPA, Percentage, etc.
            $table->enum('type', ['gpa', 'cgpa', 'percentage', 'grade'])->default('percentage');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Grade Points (A+, A, B+, etc.)
        Schema::create('grade_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_system_id')->constrained()->onDelete('cascade');
            $table->string('grade'); // A+, A, B+, etc.
            $table->decimal('point', 4, 2)->nullable(); // 5.0, 4.0, 3.5
            $table->decimal('min_percentage', 5, 2);
            $table->decimal('max_percentage', 5, 2);
            $table->string('remarks')->nullable(); // Outstanding, Excellent
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Exams
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->foreignId('exam_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('grading_system_id')->nullable()->constrained()->onDelete('set null');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('description')->nullable();
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->boolean('is_published')->default(false);
            $table->timestamp('result_published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Exam Schedules (for each subject)
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room')->nullable();
            $table->integer('full_marks')->default(100);
            $table->integer('pass_marks')->default(33);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Exam Results
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_schedule_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->decimal('marks_obtained', 6, 2)->nullable();
            $table->decimal('practical_marks', 6, 2)->nullable();
            $table->string('grade')->nullable();
            $table->decimal('grade_point', 4, 2)->nullable();
            $table->boolean('is_absent')->default(false);
            $table->text('remarks')->nullable();
            $table->foreignId('entered_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['exam_schedule_id', 'student_id'], 'result_schedule_student_unique');
        });

        // Student Report Cards (consolidated results)
        Schema::create('report_cards', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->decimal('total_marks', 8, 2)->nullable();
            $table->decimal('obtained_marks', 8, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->decimal('gpa', 4, 2)->nullable();
            $table->string('grade')->nullable();
            $table->integer('rank')->nullable();
            $table->integer('total_students')->nullable();
            $table->enum('result', ['pass', 'fail', 'withheld'])->default('pass');
            $table->text('remarks')->nullable();
            $table->text('teacher_comments')->nullable();
            $table->text('principal_comments')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['student_id', 'exam_id'], 'report_card_student_exam_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_cards');
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('exam_schedules');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('grade_points');
        Schema::dropIfExists('grading_systems');
        Schema::dropIfExists('exam_types');
    }
};
