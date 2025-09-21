#!/bin/bash

# NovaChat Logging Setup Script

echo "🚀 Setting up NovaChat Logging System"
echo "====================================="

# Create log directories
echo "📁 Creating log directories..."
mkdir -p storage/logs
mkdir -p storage/logs/archive

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage/logs
chown -R www-data:www-data storage/logs 2>/dev/null || true

# Create logrotate configuration
echo "📋 Creating logrotate configuration..."
cat > /etc/logrotate.d/novachat << EOF
/home/hadv/Documents/NovaChat/backend/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        docker-compose exec app php artisan log:cleanup --days=30
    endscript
}
EOF

echo "✅ Logrotate configuration created"

# Create log monitoring script
echo "📊 Creating log monitoring script..."
cat > storage/logs/monitor.sh << 'EOF'
#!/bin/bash

# NovaChat Log Monitor
LOG_DIR="/home/hadv/Documents/NovaChat/backend/storage/logs"

echo "📊 NovaChat Log Monitor"
echo "======================"

# Show log file sizes
echo "📁 Log File Sizes:"
ls -lh $LOG_DIR/*.log 2>/dev/null | awk '{print $5, $9}' | sort -hr

echo ""

# Show recent errors
echo "🚨 Recent Errors (last 10):"
find $LOG_DIR -name "*.log" -exec grep -l "ERROR" {} \; | head -1 | xargs tail -n 100 | grep "ERROR" | tail -10

echo ""

# Show log statistics
echo "📈 Log Statistics:"
for log in $LOG_DIR/*.log; do
    if [ -f "$log" ]; then
        filename=$(basename "$log")
        lines=$(wc -l < "$log")
        errors=$(grep -c "ERROR" "$log" 2>/dev/null || echo "0")
        warnings=$(grep -c "WARNING" "$log" 2>/dev/null || echo "0")
        echo "$filename: $lines lines, $errors errors, $warnings warnings"
    fi
done
EOF

chmod +x storage/logs/monitor.sh

echo "✅ Log monitoring script created"

# Create log cleanup cron job
echo "⏰ Setting up log cleanup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd /home/hadv/Documents/NovaChat/backend && php artisan log:cleanup --days=30") | crontab -

echo "✅ Cron job created for daily log cleanup at 2 AM"

# Test logging
echo "🧪 Testing logging system..."
cd /home/hadv/Documents/NovaChat/backend
php artisan tinker --execute="
use App\Services\LogService;
LogService::auth('test_login', ['test' => true]);
LogService::api('GET', '/test', 200, 0.1, ['test' => true]);
LogService::chat('test_message', ['test' => true]);
echo 'Test logs created successfully';
"

echo ""
echo "🎉 Logging system setup complete!"
echo ""
echo "📋 Available commands:"
echo "  php artisan log:view [channel] [--lines=50] [--follow]"
echo "  php artisan log:analyze [channel] [--date=today]"
echo "  php artisan log:cleanup [--days=30] [--dry-run]"
echo ""
echo "📊 Monitor logs:"
echo "  ./storage/logs/monitor.sh"
echo ""
echo "🌐 API endpoints (admin only):"
echo "  GET /api/logs - View logs"
echo "  GET /api/logs/channels - List log channels"
echo "  GET /api/logs/stats - Get log statistics"
