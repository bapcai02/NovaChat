#!/bin/bash

# NovaChat Mobile - Start Android Emulator and Expo
# This script starts the Android emulator and then launches Expo

echo "🚀 Starting NovaChat Mobile App..."
echo ""

# Function to check if emulator is running
check_emulator() {
    adb devices | grep -q "emulator.*device"
}

# Function to wait for emulator to be ready
wait_for_emulator() {
    echo "⏳ Waiting for emulator to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if check_emulator; then
            echo "✅ Emulator is ready!"
            return 0
        fi
        echo "⏳ Attempt $((attempt + 1))/$max_attempts - Waiting for emulator..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ Emulator failed to start after $max_attempts attempts"
    return 1
}

# Set Android environment variables
export PATH=$HOME/Android/Sdk/emulator:$HOME/Android/Sdk/platform-tools:$PATH
export ANDROID_HOME=$HOME/Android/Sdk

# Check if emulator is already running
if check_emulator; then
    echo "✅ Android emulator is already running"
else
    echo "📱 Starting Android emulator..."
    
    # List available AVDs
    echo "Available AVDs:"
    ~/Android/Sdk/emulator/emulator -list-avds
    echo ""
    
    # Start emulator in background
    ~/Android/Sdk/emulator/emulator -avd Medium_Phone_API_36.1 &
    
    # Wait for emulator to be ready
    if ! wait_for_emulator; then
        echo "❌ Failed to start emulator. Please check your AVD configuration."
        exit 1
    fi
fi

echo ""
echo "🔧 Starting Expo development server..."
echo "📱 Press 'a' to open on Android emulator"
echo "🌐 Press 'w' to open on web browser"
echo "📱 Press 'r' to reload app"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Start Expo
npx expo start
