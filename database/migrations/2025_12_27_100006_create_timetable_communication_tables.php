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
        // Timetable Slots (period definitions)
        Schema::create('timetable_slots', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name'); // Period 1, Break, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('type', ['class', 'break', 'lunch', 'assembly', 'other'])->default('class');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Timetables
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('timetable_slot_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('day', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->string('room')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['section_id', 'timetable_slot_id', 'day', 'academic_year_id'], 'timetable_unique');
        });

        // Notices & Announcements
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('title');
            $table->longText('content');
            $table->enum('type', ['notice', 'announcement', 'circular', 'event', 'holiday', 'urgent'])->default('notice');
            $table->enum('audience', ['all', 'students', 'teachers', 'parents', 'staff', 'specific_class'])->default('all');
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('cascade'); // If specific class
            $table->string('attachment')->nullable();
            $table->date('publish_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('is_published')->default(false);
            $table->boolean('send_notification')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Messages (Internal messaging)
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->string('attachment')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('messages')->onDelete('cascade'); // For replies
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Notification Templates
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable()->index(); // null = system template
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['sms', 'email', 'push', 'all'])->default('all');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->json('variables')->nullable(); // Available variables
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Notification Logs
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->morphs('notifiable'); // User who received
            $table->foreignId('notification_template_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['sms', 'email', 'push']);
            $table->string('recipient'); // Phone/Email
            $table->string('subject')->nullable();
            $table->text('body');
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Events & Calendar
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['holiday', 'exam', 'event', 'meeting', 'activity', 'other'])->default('event');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->string('color')->default('#3b82f6');
            $table->boolean('is_all_day')->default(false);
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_rule')->nullable();
            $table->enum('audience', ['all', 'students', 'teachers', 'parents', 'staff'])->default('all');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
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
        Schema::dropIfExists('events');
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('notices');
        Schema::dropIfExists('timetables');
        Schema::dropIfExists('timetable_slots');
    }
};
