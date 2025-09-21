#!/bin/bash

echo "=== NovaChat 10 Processes Seeder ==="
echo "This script will run SimpleDataSeeder 10 times in parallel"
echo ""

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Starting 10 parallel processes..."
echo ""

# Start time
START_TIME=$(date +%s)

# Create a function to run a single seeder
run_seeder() {
    local process_id=$1
    
    echo "Process $process_id starting..."
    
    # Run the seeder and show output in real-time
    cd /home/hadv/Documents/NovaChat/backend && docker-compose exec -T app php artisan db:seed --class=SimpleDataSeeder 2>&1 | while IFS= read -r line; do
        # Show all lines that contain numbers or important info
        if echo "$line" | grep -q -E "([0-9]|created|INSERT|Users|Teams|Channels|Conversations|Messages|Total)"; then
            echo "[Process $process_id] $line"
        fi
    done
    
    echo "✅ Process $process_id completed"
}

# Run 10 processes in parallel
echo "🚀 Starting 10 parallel processes..."
for i in {1..10}; do
    run_seeder $i &
    
    # Small delay to prevent overwhelming
    sleep 1
done

# Wait for all background jobs to complete
echo "⏳ Waiting for all processes to complete..."
wait

# End time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

echo ""
echo "🎉 === FINAL RESULTS ==="
echo "✅ Completed 10 parallel processes in $((TOTAL_TIME / 60)) minutes and $((TOTAL_TIME % 60)) seconds"
echo "⚡ Average time per process: $((TOTAL_TIME / 10)) seconds"

echo ""
echo "📊 Final database totals:"
cd /home/hadv/Documents/NovaChat/backend && docker-compose exec -T app php artisan tinker --execute="
    echo 'Users: ' . App\Models\User::count();
    echo 'Teams: ' . App\Models\Team::count();
    echo 'Channels: ' . App\Models\Channel::count();
    echo 'Conversations: ' . App\Models\Conversation::count();
    echo 'Channel Members: ' . DB::table('channel_members')->count();
    echo 'Team Members: ' . DB::table('team_members')->count();
    echo 'Conversation Members: ' . DB::table('conversation_members')->count();
    echo 'Messages: ' . DB::table('messages')->count();
"

echo ""
echo "🎯 Data seeding completed successfully!"