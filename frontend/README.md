# NovaChat Frontend

Modern chat application frontend built with Next.js, TypeScript, Tailwind CSS, and Redux Toolkit.

## Features

- **Modern UI/UX**: Clean, minimalist design inspired by Rocket.Chat and Slack
- **Real-time Chat**: Message threading, reactions, and real-time updates
- **Authentication**: Secure login/register with JWT tokens
- **Theme Support**: Dark/light mode with custom themes
- **Advanced Features**: 
  - Voice messages with waveform visualization
  - Message formatting (bold, italic, code, links)
  - Emoji picker and reactions
  - Keyboard shortcuts
  - Advanced search
  - Message analytics
  - Custom themes
  - Notifications
- **Responsive Design**: Works on desktop and mobile devices
- **State Management**: Redux Toolkit for predictable state management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Authentication**: JWT with Laravel Passport

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat application
│   ├── login/             # Authentication pages
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout with Redux Provider
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── store/                 # Redux store configuration
│   ├── slices/            # Redux Toolkit slices
│   ├── provider.tsx       # Redux Provider
│   └── index.ts           # Store configuration
├── services/              # API services
│   ├── api.ts             # Axios configuration
│   ├── authService.ts     # Authentication API
│   ├── channelService.ts  # Channel management API
│   ├── messageService.ts  # Message API
│   └── userService.ts     # User management API
├── hooks/                 # Custom React hooks
│   ├── useAppDispatch.ts  # Typed dispatch hook
│   └── useAppSelector.ts  # Typed selector hook
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions
```

## Redux Store Structure

### Auth Slice
- User authentication state
- Login/logout functionality
- Token management
- User profile data

### Channel Slice
- Channel list and current channel
- Channel creation and management
- Member management
- Channel permissions

### Message Slice
- Message list and current message
- Message sending and editing
- Reactions and replies
- Message search

### User Slice
- User list and current user
- User profiles and status
- Online users
- User search

### UI Slice
- Theme management
- Modal states
- Sidebar states
- Notifications
- Loading states

## API Integration

The frontend uses a structured API service layer:

### Base API Configuration (`api.ts`)
- Axios instance with interceptors
- Automatic token management
- Error handling
- Request/response transformation

### Domain Services
- **AuthService**: Login, register, logout, token verification
- **ChannelService**: Channel CRUD operations, member management
- **MessageService**: Message operations, reactions, search
- **UserService**: User management, profiles, status

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Storage**: JWT token stored in localStorage
3. **API Requests**: Token automatically included in headers
4. **Token Verification**: Automatic token validation on app load
5. **Logout**: Token revoked and cleared from storage

## State Management Patterns

### Async Operations
```typescript
// Using Redux Toolkit async thunks
const dispatch = useAppDispatch()
const { isLoading, error } = useAppSelector(state => state.auth)

const handleLogin = async (credentials) => {
  try {
    await dispatch(login(credentials)).unwrap()
    // Success handling
  } catch (error) {
    // Error handling
  }
}
```

### Real-time Updates
```typescript
// Subscribe to state changes
const messages = useAppSelector(state => state.messages.messages)
const channels = useAppSelector(state => state.channels.channels)
```

## Component Patterns

### Protected Routes
```typescript
// Using AuthGuard component
<AuthGuard requireAuth={true}>
  <ProtectedComponent />
</AuthGuard>
```

### Loading States
```typescript
const { isLoading } = useAppSelector(state => state.auth)

if (isLoading) {
  return <LoadingSpinner />
}
```

## API Error Handling

The application includes comprehensive error handling:

1. **Network Errors**: Automatic retry and user notification
2. **Authentication Errors**: Automatic logout and redirect
3. **Validation Errors**: Display field-specific error messages
4. **Server Errors**: User-friendly error messages

## Performance Optimizations

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Redux state persistence
- **Lazy Loading**: Component and route lazy loading

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
1. Build the application: `npm run build`
2. Start production server: `npm run start`
3. Configure reverse proxy for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
