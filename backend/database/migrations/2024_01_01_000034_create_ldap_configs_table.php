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
        Schema::create('ldap_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->string('name'); // Configuration name
            $table->text('description')->nullable();
            $table->string('server_url'); // LDAP server URL
            $table->string('bind_dn'); // Bind DN
            $table->string('bind_password'); // Bind password (encrypted)
            $table->string('base_dn'); // Base DN for search
            $table->string('search_filter')->nullable(); // Search filter
            $table->json('user_mapping')->nullable(); // Field mappings
            $table->json('group_mapping')->nullable(); // Group mappings
            $table->boolean('is_active')->default(true);
            $table->boolean('sync_on_login')->default(false); // Sync on user login
            $table->integer('sync_interval')->nullable(); // Sync interval in minutes
            $table->timestamp('last_sync_at')->nullable();
            $table->json('settings')->nullable(); // Additional LDAP settings
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            
            $table->index('team_id');
            $table->index('is_active');
            $table->index('created_by');
            $table->index('last_sync_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ldap_configs');
    }
};
