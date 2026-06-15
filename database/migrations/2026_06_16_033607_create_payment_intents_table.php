<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('student_fee_allocation_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('gateway'); // sandbox, bkash, nagad, rocket
            $table->string('reference')->unique(); // our reference, sent to the gateway
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('BDT');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'expired'])->default('pending');
            $table->string('gateway_transaction_id')->nullable();
            $table->json('payload')->nullable();
            $table->foreignId('fee_payment_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Record which gateway settled an online payment.
        Schema::table('fee_payments', function (Blueprint $table) {
            $table->string('gateway')->nullable()->after('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('fee_payments', function (Blueprint $table) {
            $table->dropColumn('gateway');
        });
        Schema::dropIfExists('payment_intents');
    }
};
