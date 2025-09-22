# 📱 NovaChat Mobile

React Native mobile app built with Expo for NovaChat platform.

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Run setup script (Ubuntu/Debian)
./setup-env.sh

# Or install manually
npm install
```

### 2. Start App
```bash
# Method 1: Use script (recommended)
./start-android.sh

# Method 2: Manual
npm run web          # Web version
npm run android      # Android version
npx expo start       # Development server
```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # Context providers  
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── App.tsx             # Main app
├── start-android.sh    # Android startup script
├── setup-env.sh        # Environment setup
└── SETUP.md           # Detailed setup guide
```

## ✨ Features

- 🔐 **Authentication** - Login/Register with API
- 💾 **State Management** - Context API + AsyncStorage
- 🎨 **Beautiful UI** - Matching frontend design
- 📱 **Mobile-First** - Optimized for mobile devices
- 🔄 **Auto-reload** - Hot reload during development
- 🛡️ **TypeScript** - Type safety throughout
- 🧪 **Demo Mode** - Test with demo credentials

## 🎯 Available Scripts

```bash
npm run web        # Start web version
npm run android    # Start Android version  
npm run ios        # Start iOS version (macOS only)
npx expo start     # Start development server
```

## 📖 Documentation

- [Detailed Setup Guide](SETUP.md) - Complete setup instructions
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

## 🆘 Troubleshooting

Common issues and solutions:

- **ADB not found**: `sudo ln -s ~/Android/Sdk/platform-tools/adb /usr/bin/adb`
- **Emulator issues**: Check `adb devices` and restart emulator
- **Metro bundler**: Run `npx expo start --reset-cache`
- **Node version**: Ensure Node.js 18+ is installed

## 🔗 Related

- [Frontend](../frontend/) - Next.js web application
- [Backend](../backend/) - Laravel API server