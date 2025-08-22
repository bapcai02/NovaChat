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
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id')->nullable(); // Team this channel belongs to
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->enum('type', ['public', 'private', 'direct', 'announcement', 'support'])->default('public');
            $table->boolean('is_archived')->default(false);
            $table->boolean('is_read_only')->default(false);
            $table->boolean('is_pinned')->default(false); // Pinned channel
            $table->boolean('is_featured')->default(false); // Featured channel
            $table->boolean('is_verified')->default(false); // Verified channel
            $table->string('avatar')->nullable(); // Channel avatar/icon
            $table->string('banner')->nullable(); // Channel banner
            $table->string('topic')->nullable(); // Channel topic
            $table->string('purpose')->nullable(); // Channel purpose
            $table->json('permissions')->nullable(); // Channel-specific permissions
            $table->json('settings')->nullable(); // Channel settings
            $table->json('metadata')->nullable(); // Additional channel data
            $table->integer('member_count')->default(0); // Number of members
            $table->integer('message_count')->default(0); // Number of messages
            $table->timestamp('last_message_at')->nullable(); // Last message timestamp
            $table->unsignedBigInteger('last_message_by')->nullable(); // Last message author
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable(); // Channel owner (can be different from creator)
            $table->json('moderators')->nullable(); // List of moderator IDs
            $table->json('rules')->nullable(); // Channel rules
            $table->json('tags')->nullable(); // Channel tags
            $table->string('category')->nullable(); // Channel category
            $table->integer('sort_order')->default(0); // Sort order
            $table->boolean('is_deleted')->default(false); // Soft delete flag
            $table->timestamp('deleted_at')->nullable(); // Soft delete timestamp
            $table->timestamps();
            
            // Indexes
            $table->index(['type', 'is_archived']);
            $table->index(['team_id', 'type']);
            $table->index(['is_pinned', 'sort_order']);
            $table->index(['is_featured', 'created_at']);
            $table->index(['member_count', 'created_at']);
            $table->index(['last_message_at', 'created_at']);
            $table->index(['category', 'type']);
            $table->index(['is_verified', 'is_archived']);
            $table->index('created_by');
            $table->index('owner_id');
            $table->index('last_message_by');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
