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
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('session_id')->unique();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('device_info')->nullable(); // Device type, OS, browser
            $table->json('location_info')->nullable(); // Country, city, timezone
            $table->timestamp('last_activity_at');
            $table->boolean('is_active')->default(true);
            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable(); // Additional session data
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['user_id', 'is_active']);
            $table->index(['last_activity_at', 'is_active']);
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
