<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('slug');
            $table->unsignedBigInteger('team_id');
            $table->boolean('is_private')->default(false);
            $table->timestamps();
            
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->unique(['team_id', 'slug']);
            $table->index(['team_id', 'is_private']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
