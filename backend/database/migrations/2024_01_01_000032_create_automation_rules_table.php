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
        Schema::create('automation_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->string('name'); // Rule name
            $table->text('description')->nullable();
            $table->string('trigger_type'); // message_sent, user_joined, file_uploaded, etc.
            $table->json('trigger_config')->nullable(); // Trigger conditions
            $table->string('action_type'); // send_message, create_channel, notify_user, etc.
            $table->json('action_config')->nullable(); // Action parameters
            $table->boolean('is_active')->default(true);
            $table->integer('execution_count')->default(0); // How many times executed
            $table->timestamp('last_executed_at')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->json('conditions')->nullable(); // Additional conditions
            $table->json('schedule')->nullable(); // For scheduled rules
            $table->timestamps();
            
            $table->index('team_id');
            $table->index(['trigger_type', 'is_active']);
            $table->index(['action_type', 'is_active']);
            $table->index('created_by');
            $table->index('last_executed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_rules');
    }
};
