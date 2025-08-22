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
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('name'); // Key name/description
            $table->string('key_hash'); // Hashed API key
            $table->string('key_prefix', 8); // First 8 chars for identification
            $table->json('permissions')->nullable(); // API permissions
            $table->json('scopes')->nullable(); // OAuth scopes
            $table->timestamp('last_used_at')->nullable();
            $table->string('last_ip_address')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('key_prefix');
            $table->index(['is_active', 'expires_at']);
            $table->index('last_used_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};
