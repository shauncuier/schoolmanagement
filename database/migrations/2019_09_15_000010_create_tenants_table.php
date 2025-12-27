<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();

            // School Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();

            // Address
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('Bangladesh');
            $table->string('postal_code')->nullable();

            // Theme & Branding
            $table->string('primary_color')->default('#3b82f6');
            $table->string('secondary_color')->default('#1e40af');
            $table->enum('theme', ['light', 'dark', 'system'])->default('system');

            // Subscription & Status
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending'])->default('pending');
            $table->string('subscription_plan')->default('free');
            $table->timestamp('subscription_ends_at')->nullable();

            // Settings (JSON)
            $table->json('settings')->nullable();
            $table->json('data')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}
