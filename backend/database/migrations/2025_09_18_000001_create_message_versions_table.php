<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('editor_id')->nullable();
            $table->string('action')->default('edit'); // edit|delete|restore
            $table->longText('old_content')->nullable();
            $table->longText('new_content')->nullable();
            $table->timestamps();

            $table->index(['message_id']);
            $table->foreign('message_id')->references('id')->on('messages')->onDelete('cascade');
            $table->foreign('editor_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_versions');
    }
};
