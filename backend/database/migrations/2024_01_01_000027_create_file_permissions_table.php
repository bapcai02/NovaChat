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
        Schema::create('file_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('file_id');
            $table->unsignedBigInteger('user_id')->nullable(); // null = team permission
            $table->unsignedBigInteger('team_id')->nullable(); // null = user permission
            $table->enum('permission', ['view', 'download', 'edit', 'delete', 'share'])->default('view');
            $table->timestamp('expires_at')->nullable(); // Permission expiration
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('granted_by'); // Who granted the permission
            $table->text('notes')->nullable(); // Notes about the permission
            $table->timestamps();
            
            $table->unique(['file_id', 'user_id', 'team_id', 'permission']);
            $table->index('file_id');
            $table->index('user_id');
            $table->index('team_id');
            $table->index(['permission', 'is_active']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_permissions');
    }
};
