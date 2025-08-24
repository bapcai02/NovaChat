#!/bin/bash

echo "🚀 Setting up NovaChat Backend with Passport Authentication..."

# Check if Docker containers are running
echo "📦 Checking Docker containers..."
if ! docker-compose ps | grep -q "laravel_app.*Up"; then
    echo "❌ Laravel container is not running. Please start Docker containers first:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "✅ Docker containers are running"

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec app php artisan migrate:fresh

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✅ Migrations completed"

# Install Passport
echo "🔐 Installing Laravel Passport..."
docker-compose exec app php artisan passport:install

if [ $? -ne 0 ]; then
    echo "❌ Passport installation failed"
    exit 1
fi

echo "✅ Passport installed successfully"

# Run seeders
echo "🌱 Running database seeders..."
docker-compose exec app php artisan db:seed

if [ $? -ne 0 ]; then
    echo "❌ Seeding failed"
    exit 1
fi

echo "✅ Seeding completed"

# Clear caches
echo "🧹 Clearing application caches..."
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear

echo "✅ Caches cleared"

echo ""
echo "🎉 NovaChat Backend setup completed with Passport Authentication!"
echo ""
echo "📋 Demo Credentials:"
echo "   Admin: admin@novachat.com / password123"
echo "   User:  john@example.com / password123"
echo ""
echo "🌐 API Base URL: http://localhost:8000/api"
echo "📚 API Documentation: backend/API_DOCUMENTATION.md"
echo ""
echo "🔐 Passport OAuth Clients:"
echo "   Personal Access Client ID: 1"
echo "   Password Grant Client ID: 2"
echo ""
echo "🚀 You can now start the frontend and login!"
