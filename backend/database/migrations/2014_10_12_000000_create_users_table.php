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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique()->nullable(); // Username unique
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable(); // Profile picture
            $table->text('bio')->nullable(); // User bio/description
            $table->string('phone')->nullable(); // Phone number
            $table->string('timezone')->default('UTC'); // User timezone
            $table->string('language')->default('en'); // Preferred language
            $table->enum('status', ['active', 'inactive', 'suspended', 'banned'])->default('active');
            $table->enum('role', ['super_admin', 'admin', 'moderator', 'user', 'guest'])->default('user');
            $table->json('permissions')->nullable(); // Custom permissions
            $table->json('settings')->nullable(); // User settings
            $table->json('metadata')->nullable(); // Additional user data
            $table->timestamp('last_login_at')->nullable(); // Last login time
            $table->string('last_login_ip')->nullable(); // Last login IP

            $table->boolean('email_notifications')->default(true); // Email notification preference
            $table->boolean('push_notifications')->default(true); // Push notification preference
            $table->boolean('is_online')->default(false); // Online status
            $table->timestamp('last_seen_at')->nullable(); // Last seen timestamp
            $table->string('status_message')->nullable(); // Custom status message
            $table->boolean('is_verified')->default(false); // Verified user badge
            $table->boolean('is_premium')->default(false); // Premium user status
            $table->timestamp('premium_expires_at')->nullable(); // Premium expiration
            $table->json('social_links')->nullable(); // Social media links
            $table->string('website')->nullable(); // Personal website
            $table->string('location')->nullable(); // User location
            $table->date('birth_date')->nullable(); // Birth date
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            $table->string('company')->nullable(); // Company name
            $table->string('job_title')->nullable(); // Job title
            $table->boolean('is_deleted')->default(false); // Soft delete flag
            $table->timestamp('deleted_at')->nullable(); // Soft delete timestamp
            $table->rememberToken();
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'role']);
            $table->index(['is_online', 'last_seen_at']);
            $table->index(['email_verified_at', 'is_verified']);

            $table->index(['is_premium', 'premium_expires_at']);
            $table->index('username');
            $table->index('phone');
            $table->index('company');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
