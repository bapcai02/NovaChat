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
        Schema::create('call_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('call_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('role', ['host', 'participant', 'observer'])->default('participant');
            $table->enum('status', ['invited', 'joined', 'left', 'declined'])->default('invited');
            $table->boolean('audio_enabled')->default(true);
            $table->boolean('video_enabled')->default(false);
            $table->boolean('screen_sharing')->default(false);
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->integer('duration')->nullable(); // Duration in seconds
            $table->json('device_info')->nullable(); // Device information
            $table->json('connection_info')->nullable(); // Connection quality, etc.
            $table->timestamps();
            
            $table->unique(['call_id', 'user_id']);
            $table->index('call_id');
            $table->index('user_id');
            $table->index(['status', 'joined_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_participants');
    }
};
