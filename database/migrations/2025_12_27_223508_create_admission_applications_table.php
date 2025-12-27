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
        Schema::create('admission_applications', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('application_no')->unique();
            
            // Student Information
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('religion')->nullable();
            $table->string('nationality')->default('Bangladeshi');
            
            // Academic Info Applying For
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            
            // Previous School Info
            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            $table->decimal('previous_marks_percentage', 5, 2)->nullable();
            
            // Guardian Information
            $table->string('guardian_name');
            $table->string('guardian_relation');
            $table->string('guardian_email')->nullable();
            $table->string('guardian_phone');
            $table->string('guardian_occupation')->nullable();
            $table->text('address')->nullable();
            
            // Workflow Status
            $table->enum('status', ['pending', 'under_review', 'interview_scheduled', 'approved', 'rejected'])->default('pending');
            $table->date('interview_date')->nullable();
            $table->text('admin_remarks')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Metadata
            $table->json('documents')->nullable(); // JSON array of document paths
            $table->string('photo')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_applications');
    }
};
