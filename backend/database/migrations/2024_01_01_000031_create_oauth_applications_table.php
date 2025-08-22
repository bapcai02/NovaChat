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
        Schema::create('oauth_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Application owner
            $table->string('name'); // Application name
            $table->string('client_id')->unique();
            $table->string('client_secret');
            $table->text('redirect_uri'); // Allowed redirect URIs
            $table->json('scopes')->nullable(); // OAuth scopes
            $table->boolean('is_confidential')->default(true); // Public or confidential client
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->string('website_url')->nullable();
            $table->json('settings')->nullable(); // Additional settings
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('client_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oauth_applications');
    }
};
