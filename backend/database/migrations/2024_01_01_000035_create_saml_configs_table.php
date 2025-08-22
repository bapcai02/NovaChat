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
        Schema::create('saml_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->string('name'); // Configuration name
            $table->text('description')->nullable();
            $table->string('entry_point'); // SAML entry point URL
            $table->string('issuer'); // SAML issuer
            $table->text('cert'); // SAML certificate
            $table->text('private_key')->nullable(); // Private key for signing
            $table->json('attribute_mapping')->nullable(); // Attribute mappings
            $table->json('group_mapping')->nullable(); // Group mappings
            $table->boolean('is_active')->default(true);
            $table->boolean('force_authn')->default(false); // Force authentication
            $table->boolean('want_assertions_signed')->default(true);
            $table->json('settings')->nullable(); // Additional SAML settings
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            
            $table->index('team_id');
            $table->index('is_active');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saml_configs');
    }
};
