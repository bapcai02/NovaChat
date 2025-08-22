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
        Schema::create('file_shares', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Who uploaded the file
            $table->unsignedBigInteger('message_id')->nullable(); // Associated message
            $table->unsignedBigInteger('channel_id')->nullable(); // Associated channel
            $table->unsignedBigInteger('team_id')->nullable(); // Associated team
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type');
            $table->bigInteger('size'); // File size in bytes
            $table->string('path'); // Storage path
            $table->string('disk')->default('local'); // Storage disk
            $table->boolean('is_public')->default(false); // Public access
            $table->integer('download_count')->default(0); // Download tracking
            $table->timestamp('expires_at')->nullable(); // For temporary files
            $table->boolean('password_protected')->default(false);
            $table->string('password_hash')->nullable();
            $table->string('preview_url')->nullable(); // Preview/thumbnail URL
            $table->string('thumbnail_url')->nullable();
            $table->json('metadata')->nullable(); // Dimensions, duration, etc.
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('message_id');
            $table->index('channel_id');
            $table->index('team_id');
            $table->index(['mime_type', 'created_at']);
            $table->index(['is_public', 'is_deleted']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_shares');
    }
};
