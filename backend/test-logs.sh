#!/bin/bash

# Script to test the logging system
echo "🧪 Testing NovaChat Logging System"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd backend && ./test-logs.sh"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker and try again"
    exit 1
fi

echo "🔄 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📝 Testing log generation..."

# Test API logging
echo "Testing API logging..."
docker-compose exec app php artisan tinker --execute="
use App\Services\LogService;
use Illuminate\Support\Facades\Log;

\$logService = new LogService();

// Test different log channels
\$logService->log('api', 'info', 'Test API request', ['user_id' => 1, 'endpoint' => '/api/test']);
\$logService->log('auth', 'info', 'User login successful', ['user_id' => 1, 'ip' => '127.0.0.1']);
\$logService->log('chat', 'info', 'Message sent', ['user_id' => 1, 'conversation_id' => 1]);
\$logService->log('security', 'warning', 'Suspicious activity detected', ['user_id' => 1, 'ip' => '192.168.1.100']);
\$logService->log('performance', 'info', 'Slow query detected', ['query' => 'SELECT * FROM users', 'duration' => 2.5]);

echo 'Log entries created successfully!';
"

echo ""
echo "🔍 Testing log viewing commands..."

# Test log viewer command
echo "Testing LogViewer command..."
docker-compose exec app php artisan log:view api --lines=10

echo ""
echo "📊 Testing log analyzer..."
docker-compose exec app php artisan log:analyze

echo ""
echo "🎯 Testing log scorer..."
docker-compose exec app php artisan log:score

echo ""
echo "🧹 Testing log cleanup..."
docker-compose exec app php artisan log:cleanup --days=1

echo ""
echo "✅ Log system test completed!"
echo ""
echo "📋 What was tested:"
echo "   ✓ Log generation (API, Auth, Chat, Security, Performance)"
echo "   ✓ Log viewing command"
echo "   ✓ Log analysis"
echo "   ✓ Log scoring"
echo "   ✓ Log cleanup"
echo ""
echo "🌐 Frontend access:"
echo "   - User logs: http://localhost:3000/logs"
echo "   - Admin logs: http://localhost:3000/admin/logs"
echo ""
echo "🔗 API endpoints:"
echo "   - GET /api/logs (view logs)"
echo "   - GET /api/logs/channels (list channels)"
echo "   - GET /api/logs/stats (admin only)"
echo "   - GET /api/logs/score (admin only)"
echo "   - POST /api/logs/cleanup (admin only)"
echo ""
echo "📝 To stop containers: docker-compose down"
