<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add SMS-specific delivery metadata to the shared notification log.
     */
    public function up(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('type');
            $table->string('provider_message_id')->nullable()->after('recipient');
            $table->unsignedInteger('segments')->nullable()->after('provider_message_id');
            $table->decimal('cost', 10, 4)->nullable()->after('segments');

            // Allow ad-hoc / broadcast sends that are not tied to a single
            // in-system recipient (e.g. test sends to an arbitrary number).
            $table->string('notifiable_type')->nullable()->change();
            $table->unsignedBigInteger('notifiable_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->dropColumn(['provider', 'provider_message_id', 'segments', 'cost']);
        });
    }
};
