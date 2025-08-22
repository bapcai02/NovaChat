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
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->string('domain')->unique()->nullable(); // Custom domain
            $table->json('settings')->nullable(); // Team settings
            $table->boolean('is_public')->default(true);
            $table->boolean('is_archived')->default(false);
            $table->unsignedBigInteger('owner_id');
            $table->timestamps();
            
            $table->index(['is_public', 'is_archived']);
            $table->index('owner_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
