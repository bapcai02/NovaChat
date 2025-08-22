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
        Schema::create('channel_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('channel_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('role', ['owner', 'admin', 'moderator', 'member', 'guest', 'banned'])->default('member');
            $table->enum('status', ['active', 'invited', 'pending', 'suspended', 'left'])->default('active');
            $table->boolean('is_muted')->default(false);
            $table->boolean('is_pinned')->default(false); // Pin channel for user
            $table->boolean('is_favorite')->default(false); // Favorite channel
            $table->boolean('is_hidden')->default(false); // Hide channel from list
            $table->timestamp('joined_at')->nullable(); // When user joined
            $table->timestamp('last_read_at')->nullable(); // Last read timestamp
            $table->timestamp('last_activity_at')->nullable(); // Last activity in channel
            $table->integer('message_count')->default(0); // Messages sent in this channel
            $table->integer('reaction_count')->default(0); // Reactions given in this channel
            $table->json('permissions')->nullable(); // Channel-specific permissions for this user
            $table->json('preferences')->nullable(); // User preferences for this channel
            $table->json('settings')->nullable(); // User-specific channel settings
            $table->json('metadata')->nullable(); // Additional member data
            $table->string('nickname')->nullable(); // Custom nickname in this channel
            $table->string('avatar')->nullable(); // Custom avatar for this channel
            $table->text('bio')->nullable(); // Custom bio for this channel
            $table->unsignedBigInteger('invited_by')->nullable(); // Who invited this user
            $table->timestamp('invited_at')->nullable(); // When user was invited
            $table->timestamp('muted_until')->nullable(); // Mute expiration
            $table->string('mute_reason')->nullable(); // Reason for muting
            $table->unsignedBigInteger('muted_by')->nullable(); // Who muted this user
            $table->timestamp('banned_at')->nullable(); // When user was banned
            $table->string('ban_reason')->nullable(); // Reason for ban
            $table->unsignedBigInteger('banned_by')->nullable(); // Who banned this user
            $table->boolean('is_deleted')->default(false); // Soft delete flag
            $table->timestamp('deleted_at')->nullable(); // Soft delete timestamp
            $table->timestamps();
            
            // Indexes
            $table->unique(['channel_id', 'user_id']);
            $table->index(['user_id', 'last_read_at']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'is_pinned']);
            $table->index(['user_id', 'is_favorite']);
            $table->index(['user_id', 'is_hidden']);
            $table->index(['channel_id', 'role']);
            $table->index(['channel_id', 'status']);
            $table->index(['channel_id', 'is_muted']);
            $table->index(['channel_id', 'last_activity_at']);
            $table->index(['invited_by', 'invited_at']);
            $table->index(['muted_by', 'muted_until']);
            $table->index(['banned_by', 'banned_at']);
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('channel_members');
    }
};
