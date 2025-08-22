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
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->string('token')->unique();
            $table->enum('type', ['team', 'channel', 'direct'])->default('team');
            $table->unsignedBigInteger('invitable_id'); // team_id or channel_id
            $table->string('invitable_type'); // Team or Channel
            $table->unsignedBigInteger('invited_by');
            $table->string('email');
            $table->string('name')->nullable();
            $table->enum('role', ['owner', 'admin', 'member', 'guest'])->default('member');
            $table->enum('status', ['pending', 'accepted', 'expired', 'cancelled'])->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();
            
            $table->index(['type', 'invitable_id']);
            $table->index(['email', 'status']);
            $table->index('invited_by');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
