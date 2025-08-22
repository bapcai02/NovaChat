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
        Schema::create('data_retention_policies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->string('name'); // Policy name
            $table->text('description')->nullable();
            $table->string('type'); // messages, files, audit_logs, etc.
            $table->integer('retention_period'); // Days to retain
            $table->enum('action', ['delete', 'archive', 'anonymize'])->default('delete');
            $table->json('conditions')->nullable(); // Specific conditions
            $table->json('exceptions')->nullable(); // Exceptions to the policy
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_executed_at')->nullable();
            $table->integer('items_processed')->default(0); // Items processed in last run
            $table->unsignedBigInteger('created_by');
            $table->json('schedule')->nullable(); // Execution schedule
            $table->timestamps();
            
            $table->index('team_id');
            $table->index(['type', 'is_active']);
            $table->index('created_by');
            $table->index('last_executed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_retention_policies');
    }
};
