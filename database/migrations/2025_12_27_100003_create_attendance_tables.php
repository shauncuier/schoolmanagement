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
        // Attendance Table
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'leave', 'holiday'])->default('present');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->enum('marked_by', ['manual', 'qr_code', 'biometric', 'rfid'])->default('manual');
            $table->text('remarks')->nullable();
            $table->foreignId('marked_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['student_id', 'date'], 'student_date_attendance_unique');
            $table->index(['tenant_id', 'date']);
            $table->index(['class_id', 'section_id', 'date']);
        });

        // Leave Requests
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->morphs('requestable'); // Can be student, teacher, or staff
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->string('leave_type'); // sick, casual, earned, etc.
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days');
            $table->text('reason');
            $table->string('attachment')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->text('admin_remarks')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Teacher Attendance
        Schema::create('teacher_attendances', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'leave', 'holiday'])->default('present');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['teacher_id', 'date'], 'teacher_date_attendance_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_attendances');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('attendances');
    }
};
