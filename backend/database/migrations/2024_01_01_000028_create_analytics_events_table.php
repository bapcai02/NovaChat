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
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // null = anonymous
            $table->unsignedBigInteger('team_id')->nullable();
            $table->string('event_type'); // login, message_sent, file_upload, etc.
            $table->string('event_category')->nullable(); // user, message, file, etc.
            $table->unsignedBigInteger('resource_id')->nullable(); // message_id, file_id, etc.
            $table->string('resource_type')->nullable(); // Message, File, etc.
            $table->json('properties')->nullable(); // Additional event data
            $table->string('session_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('context')->nullable(); // Device, location, etc.
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('team_id');
            $table->index(['event_type', 'created_at']);
            $table->index(['event_category', 'created_at']);
            $table->index(['resource_type', 'resource_id']);
            $table->index('session_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
