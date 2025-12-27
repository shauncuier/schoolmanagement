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
        // Fee Categories (Tuition, Transport, Library, etc.)
        Schema::create('fee_categories', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->enum('frequency', ['one_time', 'monthly', 'quarterly', 'half_yearly', 'yearly'])->default('monthly');
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Fee Structures (amount per class/category)
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('fee_category_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->date('due_date')->nullable();
            $table->decimal('late_fee', 10, 2)->default(0);
            $table->integer('late_fee_grace_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Discounts
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('value', 10, 2); // percentage or fixed amount
            $table->foreignId('fee_category_id')->nullable()->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Student Fee Allocations
        Schema::create('student_fee_allocations', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_structure_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('discount_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('original_amount', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('due_amount', 12, 2);
            $table->date('due_date');
            $table->enum('status', ['pending', 'partial', 'paid', 'overdue', 'waived'])->default('pending');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Fee Payments
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_fee_allocation_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->decimal('amount', 12, 2);
            $table->decimal('late_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'online', 'cheque', 'mobile_banking'])->default('cash');
            $table->string('transaction_id')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('cheque_date')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->text('remarks')->nullable();
            $table->foreignId('collected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('paid_at');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Fee Refunds
        Schema::create('fee_refunds', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('fee_payment_id')->constrained()->onDelete('cascade');
            $table->decimal('refund_amount', 12, 2);
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'completed', 'rejected'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_refunds');
        Schema::dropIfExists('fee_payments');
        Schema::dropIfExists('student_fee_allocations');
        Schema::dropIfExists('discounts');
        Schema::dropIfExists('fee_structures');
        Schema::dropIfExists('fee_categories');
    }
};
