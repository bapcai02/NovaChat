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
        Schema::create('message_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('reported_by');
            $table->enum('reason', [
                'spam', 'inappropriate', 'harassment', 'violence', 
                'misinformation', 'copyright', 'other'
            ]);
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'resolved', 'dismissed'])->default('pending');
            $table->unsignedBigInteger('moderator_id')->nullable();
            $table->text('resolution')->nullable();
            $table->enum('action_taken', [
                'none', 'warning', 'message_removed', 'user_muted', 
                'user_suspended', 'user_banned'
            ])->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->json('evidence')->nullable(); // Screenshots, links, etc.
            $table->timestamps();
            
            $table->index('message_id');
            $table->index('reported_by');
            $table->index('moderator_id');
            $table->index(['status', 'created_at']);
            $table->index('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_reports');
    }
};
