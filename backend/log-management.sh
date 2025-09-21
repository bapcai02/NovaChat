#!/bin/bash

# NovaChat Log Management Script

echo "🚀 NovaChat Log Management System"
echo "================================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Function to show menu
show_menu() {
    echo ""
    echo "📋 Available Commands:"
    echo "1) View logs (real-time)"
    echo "2) Analyze logs"
    echo "3) Score log health"
    echo "4) Clean up old logs"
    echo "5) Monitor logs"
    echo "6) Export logs"
    echo "7) Open web dashboard"
    echo "8) Setup logging system"
    echo "9) Exit"
    echo ""
}

# Function to view logs
view_logs() {
    echo "📊 Available log channels:"
    ls storage/logs/*.log 2>/dev/null | sed 's/.*\///' | sed 's/\.log$//' | nl
    
    read -p "Enter channel number or name: " choice
    
    if [[ $choice =~ ^[0-9]+$ ]]; then
        channels=($(ls storage/logs/*.log 2>/dev/null | sed 's/.*\///' | sed 's/\.log$//'))
        channel=${channels[$((choice-1))]}
    else
        channel=$choice
    fi
    
    if [ -z "$channel" ]; then
        echo "❌ Invalid channel"
        return
    fi
    
    echo "📖 Viewing $channel logs (Press Ctrl+C to stop)..."
    php artisan log:view $channel --follow
}

# Function to analyze logs
analyze_logs() {
    echo "📊 Available log channels:"
    ls storage/logs/*.log 2>/dev/null | sed 's/.*\///' | sed 's/\.log$//' | nl
    
    read -p "Enter channel number or name: " choice
    
    if [[ $choice =~ ^[0-9]+$ ]]; then
        channels=($(ls storage/logs/*.log 2>/dev/null | sed 's/.*\///' | sed 's/\.log$//'))
        channel=${channels[$((choice-1))]}
    else
        channel=$choice
    fi
    
    if [ -z "$channel" ]; then
        echo "❌ Invalid channel"
        return
    fi
    
    echo "🔍 Analyzing $channel logs..."
    php artisan log:analyze $channel --top=10
}

# Function to score log health
score_logs() {
    echo "📊 Available log channels:"
    ls storage/logs/*.log 2>/dev/null | sed 's/.*\///' | sed 's/\.log$//' | nl
    
    read -p "Enter channel number or name: " choice
    
    if [[ $choice =~ ^[0-9]+$ ]]; then
        channels=($(ls storage/logs/*.log 2>/dev/null | sed 's/.*\///' | sed 's/\.log$//'))
        channel=${channels[$((choice-1))]}
    else
        channel=$choice
    fi
    
    if [ -z "$channel" ]; then
        echo "❌ Invalid channel"
        return
    fi
    
    echo "🎯 Scoring $channel log health..."
    php artisan log:score $channel --output=console
}

# Function to clean up logs
cleanup_logs() {
    echo "🧹 Cleaning up old logs..."
    read -p "Enter days to keep (default 30): " days
    days=${days:-30}
    
    echo "Cleaning logs older than $days days..."
    php artisan log:cleanup --days=$days --dry-run
    
    read -p "Continue with actual cleanup? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        php artisan log:cleanup --days=$days
        echo "✅ Cleanup completed"
    else
        echo "❌ Cleanup cancelled"
    fi
}

# Function to monitor logs
monitor_logs() {
    echo "📊 Starting log monitor..."
    if [ -f "storage/logs/monitor.sh" ]; then
        ./storage/logs/monitor.sh
    else
        echo "❌ Monitor script not found. Run setup first."
    fi
}

# Function to export logs
export_logs() {
    echo "📤 Exporting logs..."
    read -p "Enter channel name: " channel
    read -p "Enter number of lines (default 1000): " lines
    lines=${lines:-1000}
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    filename="logs_export_${channel}_${timestamp}.txt"
    
    php artisan log:view $channel --lines=$lines > $filename
    echo "✅ Logs exported to: $filename"
}

# Function to open web dashboard
open_dashboard() {
    echo "🌐 Opening web dashboard..."
    echo "Dashboard URL: http://localhost:8000/logs"
    echo "Note: You need to be logged in as admin"
    
    if command -v xdg-open > /dev/null; then
        xdg-open "http://localhost:8000/logs"
    elif command -v open > /dev/null; then
        open "http://localhost:8000/logs"
    else
        echo "Please open http://localhost:8000/logs in your browser"
    fi
}

# Function to setup logging
setup_logging() {
    echo "⚙️ Setting up logging system..."
    if [ -f "setup-logging.sh" ]; then
        ./setup-logging.sh
    else
        echo "❌ Setup script not found"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-9): " choice
    
    case $choice in
        1) view_logs ;;
        2) analyze_logs ;;
        3) score_logs ;;
        4) cleanup_logs ;;
        5) monitor_logs ;;
        6) export_logs ;;
        7) open_dashboard ;;
        8) setup_logging ;;
        9) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid choice. Please try again." ;;
    esac
    
    read -p "Press Enter to continue..."
done
