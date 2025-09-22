# 🚀 NovaChat Mobile - Setup Guide

Hướng dẫn chi tiết setup và chạy NovaChat Mobile App trên Ubuntu với Android Emulator.

---

## 📋 Prerequisites

### 1. Cài đặt Android Studio và Android SDK

```bash
# Tải Android Studio tại: https://developer.android.com/studio
# Cài đặt Android Studio, sau đó mở lên

# Trong Android Studio → SDK Manager → cài:
#   - Android SDK Platform (VD: Android 13)
#   - Android SDK Tools (Platform-tools, Emulator)

# Trong Android Studio → AVD Manager → tạo 1 máy ảo mới
# Tên AVD: Medium_Phone_API_36.1 (hoặc tên khác)
```

### 2. Cấu hình Environment Variables

```bash
# Mở file bashrc
nano ~/.bashrc

# Thêm vào cuối file:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH

# Reload bashrc
source ~/.bashrc
```

### 3. Cài đặt Dependencies

```bash
# Cài Node.js, npm, watchman
sudo apt install -y nodejs npm watchman

# Cài Expo CLI globally
npm install --global @expo/cli

# Cài dependencies cho project
cd mobile
npm install
```

---

## 🚀 Cách chạy App

### Method 1: Sử dụng Script (Recommended)

```bash
# Chạy script tự động
cd mobile
chmod +x start-android.sh
./start-android.sh
```

### Method 2: Chạy thủ công

```bash
# Terminal 1: Start Android Emulator
~/Android/Sdk/emulator/emulator -avd Medium_Phone_API_36.1

# Terminal 2: Start Expo
cd mobile
PATH=$HOME/Android/Sdk/emulator:$HOME/Android/Sdk/platform-tools:$PATH ANDROID_HOME=$HOME/Android/Sdk npx expo start
```

### Method 3: Web Version (Quick Test)

```bash
cd mobile
npm run web
# Mở http://localhost:8081
```

---

## 📱 Available Commands

```bash
# Web version
npm run web

# Android version  
npm run android

# iOS version (macOS only)
npm run ios

# Start development server
npx expo start

# Clear cache
npx expo start --clear
```

---

## 🔧 Troubleshooting

### Lỗi thường gặp:

#### 1. ADB not found
```bash
sudo ln -s ~/Android/Sdk/platform-tools/adb /usr/bin/adb
```

#### 2. Emulator already running
```bash
adb -s emulator-5554 emu kill
```

#### 3. Expo không mở Android
- Đảm bảo emulator đã chạy trước khi bấm 'a'
- Kiểm tra: `adb devices`

#### 4. Metro bundler issues
```bash
npx expo start --reset-cache
```

#### 5. Node version issues
```bash
# Kiểm tra Node version
node --version

# Nếu cần update Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/          # React components
│   │   ├── LoginForm.tsx
│   │   └── LoadingScreen.tsx
│   ├── contexts/           # Context providers
│   │   └── AuthContext.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── utils/              # Utility functions
├── App.tsx                 # Main app component
├── package.json
├── start-android.sh        # Android startup script
└── SETUP.md               # This file
```

---

## 🎯 Features

- ✅ **Login/Register** với API integration
- ✅ **State Management** với Context API
- ✅ **Persistent Storage** với AsyncStorage
- ✅ **Error Handling** toàn diện
- ✅ **Loading States** đẹp mắt
- ✅ **Demo Credentials** để test
- ✅ **TypeScript** support
- ✅ **Auto-reload** khi code thay đổi

---

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Studio](https://developer.android.com/studio)
- [Node.js](https://nodejs.org/)

---

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Android Studio đã cài đặt đúng
2. AVD đã tạo và chạy được
3. Environment variables đã set
4. Dependencies đã cài đặt đầy đủ

~/Android/Sdk/emulator/emulator -avd Medium_Phone_API_36.1
PATH=$HOME/Android/Sdk/emulator:$HOME/Android/Sdk/platform-tools:$PATH ANDROID_HOME=$HOME/Android/Sdk npx expo start


