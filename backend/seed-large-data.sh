#!/bin/bash

# Script to seed large data for NovaChat using Docker
# This will create 10k users and 1M messages for testing

echo "🚀 NovaChat Large Data Seeder (Docker)"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd backend && ./seed-large-data.sh"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker and try again"
    exit 1
fi

echo "📋 This will create:"
echo "   - 10,000 users"
echo "   - 1,000,000 messages"
echo "   - 50 teams"
echo "   - 200 channels"
echo "   - Related conversation data"
echo ""

# Ask for confirmation
read -p "⚠️  This may take several minutes. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting Docker containers..."

# Start Docker containers
echo "📦 Starting Docker services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

echo ""
echo "🔄 Starting database seeding..."

# Run migrations first
echo "📦 Running migrations..."
docker-compose exec app php artisan migrate --force

# Run the seeder
echo "🌱 Seeding data (10k users, 1M messages)..."
docker-compose exec app php artisan db:seed --class=SimpleDataSeeder

echo ""
echo "✅ Large data seeding completed!"
echo ""
echo "📊 You can now test your application with:"
echo "   - 10,000 users"
echo "   - 1,000,000 messages"
echo "   - Realistic conversation data"
echo ""
echo "🔗 Access your app at: http://localhost:8000"
echo "📱 Mobile preview: cd ../mobile && npm run web"
echo "🗄️  Database admin: http://localhost:8080 (phpMyAdmin)"
echo ""
echo "📝 To stop containers: docker-compose down"
