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
        Schema::create('team_analytics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->date('date'); // Date of analytics
            $table->integer('active_users')->default(0); // Daily active users
            $table->integer('messages_sent')->default(0); // Messages sent
            $table->integer('files_uploaded')->default(0); // Files uploaded
            $table->bigInteger('storage_used')->default(0); // Storage in bytes
            $table->integer('voice_calls')->default(0); // Voice calls made
            $table->integer('video_calls')->default(0); // Video calls made
            $table->integer('total_call_duration')->default(0); // Total call duration in seconds
            $table->integer('new_users')->default(0); // New users joined
            $table->integer('channels_created')->default(0); // New channels created
            $table->json('metrics')->nullable(); // Additional metrics
            $table->json('breakdown')->nullable(); // Hourly/detailed breakdown
            $table->timestamps();
            
            $table->unique(['team_id', 'date']);
            $table->index('team_id');
            $table->index('date');
            $table->index(['team_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_analytics');
    }
};
