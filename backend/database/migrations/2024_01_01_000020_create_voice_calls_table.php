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
        Schema::create('voice_calls', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('channel_id')->nullable();
            $table->unsignedBigInteger('initiator_id');
            $table->enum('type', ['voice', 'video', 'screen_share'])->default('voice');
            $table->enum('status', ['ringing', 'active', 'ended', 'missed', 'declined'])->default('ringing');
            $table->string('call_id')->unique(); // Unique call identifier
            $table->json('participants')->nullable(); // Current participants
            $table->string('recording_url')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration')->nullable(); // Duration in seconds
            $table->json('metadata')->nullable(); // Additional call data
            $table->timestamps();
            
            $table->index('channel_id');
            $table->index('initiator_id');
            $table->index(['status', 'created_at']);
            $table->index('call_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voice_calls');
    }
};
