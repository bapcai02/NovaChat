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
        Schema::create('message_edits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('edited_by');
            $table->text('old_content');
            $table->text('new_content');
            $table->json('old_metadata')->nullable();
            $table->json('new_metadata')->nullable();
            $table->text('edit_reason')->nullable();
            $table->timestamps();
            
            $table->index('message_id');
            $table->index('edited_by');
            $table->index(['message_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_edits');
    }
};
