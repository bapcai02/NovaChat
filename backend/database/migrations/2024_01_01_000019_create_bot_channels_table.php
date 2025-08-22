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
        Schema::create('bot_channels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bot_id');
            $table->unsignedBigInteger('channel_id');
            $table->json('permissions')->nullable(); // What the bot can do in this channel
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('added_by');
            $table->timestamps();
            
            $table->unique(['bot_id', 'channel_id']);
            $table->index('bot_id');
            $table->index('channel_id');
            $table->index('added_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_channels');
    }
};
