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
        // Guardians (Parents)
        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('occupation')->nullable();
            $table->string('workplace')->nullable();
            $table->decimal('annual_income', 15, 2)->nullable();
            $table->enum('relation_type', ['father', 'mother', 'guardian', 'other'])->default('guardian');
            $table->boolean('is_primary_contact')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Students
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Admission Info
            $table->string('admission_no')->nullable();
            $table->date('admission_date')->nullable();
            $table->string('roll_number')->nullable();
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('academic_year_id')->nullable()->constrained()->onDelete('set null');
            
            // Personal Info
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('religion')->nullable();
            $table->string('nationality')->default('Bangladeshi');
            $table->string('national_id')->nullable();
            $table->string('birth_certificate_no')->nullable();
            
            // Contact Info
            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();
            
            // Previous School
            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            
            // Documents
            $table->string('photo')->nullable();
            $table->json('documents')->nullable(); // Array of document paths
            
            // Status
            $table->enum('status', ['active', 'inactive', 'graduated', 'transferred', 'dropout'])->default('active');
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'admission_no'], 'student_admission_unique');
        });

        // Student Guardian Relationship
        Schema::create('student_guardian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('guardian_id')->constrained()->onDelete('cascade');
            $table->enum('relationship', ['father', 'mother', 'guardian', 'sibling', 'other'])->default('guardian');
            $table->boolean('is_emergency_contact')->default(false);
            $table->boolean('can_pickup')->default(true);
            $table->timestamps();

            $table->unique(['student_id', 'guardian_id']);
        });

        // Student Promotions/Transfers History
        Schema::create('student_class_history', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_class_id')->nullable()->constrained('classes')->onDelete('set null');
            $table->foreignId('from_section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->foreignId('to_class_id')->nullable()->constrained('classes')->onDelete('set null');
            $table->foreignId('to_section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['admission', 'promotion', 'demotion', 'transfer', 'section_change']);
            $table->text('remarks')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_class_history');
        Schema::dropIfExists('student_guardian');
        Schema::dropIfExists('students');
        Schema::dropIfExists('guardians');
    }
};
