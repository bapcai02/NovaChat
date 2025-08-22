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
        Schema::create('content_filters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id')->nullable(); // null = global
            $table->enum('type', ['word', 'pattern', 'regex'])->default('word');
            $table->string('pattern'); // Word, pattern, or regex
            $table->string('replacement')->nullable(); // What to replace with
            $table->enum('action', ['replace', 'block', 'flag', 'moderate'])->default('replace');
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority = checked first
            $table->text('description')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->json('metadata')->nullable(); // Additional filter settings
            $table->timestamps();
            
            $table->index('team_id');
            $table->index(['type', 'is_active']);
            $table->index(['priority', 'is_active']);
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_filters');
    }
};
