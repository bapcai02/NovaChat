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
        Schema::create('bots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('created_by');
            $table->string('name');
            $table->string('username')->unique();
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->string('webhook_url')->nullable();
            $table->string('api_token')->unique();
            $table->json('capabilities')->nullable(); // What the bot can do
            $table->json('settings')->nullable(); // Bot configuration
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
            
            $table->index('created_by');
            $table->index('is_active');
            $table->index('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bots');
    }
};
