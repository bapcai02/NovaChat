#!/bin/bash

# NovaChat Mobile - Environment Setup Script
# This script helps setup the development environment

echo "🔧 Setting up NovaChat Mobile Development Environment..."
echo ""

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    echo "❌ This script is designed for Ubuntu/Debian systems"
    echo "Please install dependencies manually for your system"
    exit 1
fi

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
sudo apt install -y nodejs npm

# Install watchman (for React Native)
echo "📦 Installing watchman..."
sudo apt install -y watchman

# Install Expo CLI globally
echo "📦 Installing Expo CLI..."
npm install --global @expo/cli

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if Android SDK is installed
if [ ! -d "$HOME/Android/Sdk" ]; then
    echo "⚠️  Android SDK not found at $HOME/Android/Sdk"
    echo "Please install Android Studio and Android SDK first:"
    echo "1. Download Android Studio from https://developer.android.com/studio"
    echo "2. Install Android Studio"
    echo "3. Open Android Studio → SDK Manager"
    echo "4. Install Android SDK Platform and Tools"
    echo "5. Create an AVD (Android Virtual Device)"
    echo ""
fi

# Check if bashrc has Android environment variables
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "🔧 Adding Android environment variables to ~/.bashrc..."
    echo "" >> ~/.bashrc
    echo "# Android SDK" >> ~/.bashrc
    echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.bashrc
    echo "export PATH=\$ANDROID_HOME/emulator:\$ANDROID_HOME/platform-tools:\$PATH" >> ~/.bashrc
    echo "✅ Environment variables added to ~/.bashrc"
    echo "Please run 'source ~/.bashrc' or restart your terminal"
else
    echo "✅ Android environment variables already configured"
fi

# Create useful aliases
if ! grep -q "run-emulator" ~/.bashrc; then
    echo "🔧 Adding useful aliases to ~/.bashrc..."
    echo "" >> ~/.bashrc
    echo "# NovaChat Mobile Aliases" >> ~/.bashrc
    echo "alias run-emulator='\$HOME/Android/Sdk/emulator/emulator -avd Medium_Phone_API_36.1'" >> ~/.bashrc
    echo "alias run-expo='PATH=\$HOME/Android/Sdk/emulator:\$HOME/Android/Sdk/platform-tools:\$PATH ANDROID_HOME=\$HOME/Android/Sdk npx expo start'" >> ~/.bashrc
    echo "alias mobile-start='cd $PWD && ./start-android.sh'" >> ~/.bashrc
    echo "✅ Aliases added to ~/.bashrc"
fi

# Make scripts executable
chmod +x start-android.sh
chmod +x setup-env.sh

echo ""
echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Install Android Studio and create an AVD (if not done already)"
echo "2. Run 'source ~/.bashrc' to reload environment variables"
echo "3. Run './start-android.sh' to start the app"
echo ""
echo "🚀 Quick commands:"
echo "  mobile-start    - Start the mobile app"
echo "  run-emulator    - Start Android emulator only"
echo "  run-expo        - Start Expo development server only"
echo ""


