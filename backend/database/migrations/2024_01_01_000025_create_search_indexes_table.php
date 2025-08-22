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
        Schema::create('search_indexes', function (Blueprint $table) {
            $table->id();
            $table->string('searchable_type'); // Message, Channel, User, etc.
            $table->unsignedBigInteger('searchable_id');
            $table->text('content'); // Full-text search content
            $table->json('tags')->nullable(); // Searchable tags
            $table->json('categories')->nullable(); // Categories for filtering
            $table->json('metadata')->nullable(); // Additional searchable data
            $table->integer('relevance_score')->default(0); // Search relevance
            $table->timestamp('indexed_at');
            $table->timestamps();
            
            $table->unique(['searchable_type', 'searchable_id']);
            $table->index(['searchable_type', 'relevance_score']);
            $table->index('indexed_at');
            $table->fullText(['content']); // Full-text search index on content only
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_indexes');
    }
};
