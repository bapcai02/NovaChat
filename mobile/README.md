# NovaChat Mobile

React Native mobile application for NovaChat - a real-time chat platform.

## Features

- **Real-time Messaging**: WebSocket-based real-time chat
- **Authentication**: Login, register, and profile management
- **Teams & Channels**: Organize conversations by teams
- **Audio/Video Calls**: WebRTC-powered calling features
- **Push Notifications**: Real-time notifications
- **Cross-platform**: iOS and Android support

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Components**: Custom components with React Native
- **WebSocket**: Custom WebSocket service
- **WebRTC**: React Native WebRTC
- **Storage**: AsyncStorage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat-specific components
│   └── ui/             # Generic UI components
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── chat/          # Chat screens
│   ├── settings/      # Settings screens
│   └── teams/         # Team screens
├── services/          # API and WebSocket services
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v20.19.4 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platforms:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Configuration

1. Update API endpoints in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-api-url.com/api';
```

2. Update WebSocket URL in `src/services/websocket.ts`:
```typescript
constructor(url: string = 'ws://your-websocket-url.com') {
```

## Features Overview

### Authentication
- Login with email/password
- Registration with validation
- Password reset functionality
- JWT token management

### Chat
- Real-time messaging via WebSocket
- Message history loading
- Typing indicators
- Message reactions
- File attachments

### Teams & Channels
- Team management
- Channel creation and joining
- Member management
- Private/public teams

### Settings
- Profile management
- Notification preferences
- Privacy settings
- Account management

## API Integration

The mobile app integrates with the NovaChat Laravel backend API:

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/me`
- **Conversations**: `/conversations`, `/conversations/{id}/messages`
- **Teams**: `/teams`, `/teams/{id}/channels`
- **Users**: `/users/search`, `/user/profile`

## WebSocket Events

The app listens for these WebSocket events:

- `chat_message`: New message received
- `typing_start`/`typing_stop`: Typing indicators
- `message_read`: Read receipts
- `user_online`/`user_offline`: User presence
- `rtc_offer`/`rtc_answer`/`rtc_candidate`: WebRTC signaling

## Development

### Adding New Features

1. Create types in `src/types/index.ts`
2. Add Redux slice if needed in `src/store/slices/`
3. Create API methods in `src/services/api.ts`
4. Add WebSocket handlers in `src/services/websocket.ts`
5. Create components in appropriate folders
6. Add screens and navigation routes

### Code Style

- Use TypeScript for all files
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

## Building for Production

### iOS

1. Configure app in Expo dashboard
2. Build with EAS Build:
```bash
eas build --platform ios
```

### Android

1. Configure app in Expo dashboard
2. Build with EAS Build:
```bash
eas build --platform android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **iOS simulator not working**: Reset simulator or restart Xcode
3. **Android build fails**: Check Android SDK and build tools
4. **WebSocket connection fails**: Verify backend is running and URL is correct

### Debug Mode

Enable debug mode by adding to your device:
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- Select "Debug" from the developer menu

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the NovaChat platform. See the main repository for license information.
