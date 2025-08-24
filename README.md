# NovaChat - Modern Chat Application

A modern, real-time chat application built with Laravel (Backend) and Next.js (Frontend), featuring a clean UI inspired by Rocket.Chat and Slack.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Register, login, logout with JWT tokens
- ✅ **Real-time Messaging** - Send and receive messages instantly
- ✅ **Channel Management** - Create, join, and manage public/private channels
- ✅ **Direct Messages** - Private conversations between users
- ✅ **Message Threading** - Reply to specific messages
- ✅ **Message Reactions** - React to messages with emojis
- ✅ **File Attachments** - Share files and images
- ✅ **Voice Messages** - Record and send voice messages
- ✅ **User Status** - Online, away, busy, offline status
- ✅ **Dark/Light Theme** - Toggle between themes
- ✅ **Search** - Search messages and users
- ✅ **Notifications** - Real-time notifications
- ✅ **Mobile Responsive** - Works on all devices

### Advanced Features
- 🎨 **Custom Themes** - Create and customize themes
- ⌨️ **Keyboard Shortcuts** - Power user shortcuts
- 📊 **Message Analytics** - Read receipts and typing indicators
- 🔍 **Advanced Search** - Search with filters
- 📱 **Mobile Optimization** - Touch gestures and responsive design

## 🏗️ Architecture

### Backend (Laravel)
- **Domain-Driven Design (DDD)** architecture
- **Laravel Passport** for OAuth2 authentication
- **MySQL** database
- **Redis** for caching and real-time features
- **WebSocket** support for real-time messaging

### Frontend (Next.js)
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Modern UI/UX** design

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NovaChat
```

### 2. Start Backend (Docker)
```bash
cd backend
docker-compose up -d
```

### 3. Setup Backend Database
```bash
# Run the setup script
./setup.sh

# Or manually:
docker-compose exec app php artisan migrate:fresh
docker-compose exec app php artisan db:seed
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: `backend/API_DOCUMENTATION.md`

## 👤 Demo Credentials

### Admin User
- **Email**: admin@novachat.com
- **Password**: password123

### Sample Users
- **Email**: john@example.com
- **Password**: password123

*All sample users use the same password: `password123`*

## 📁 Project Structure

```
NovaChat/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Domain/         # DDD Domain Layer
│   │   │   ├── Channel/    # Channel Domain
│   │   │   ├── Message/    # Message Domain
│   │   │   ├── User/       # User Domain
│   │   │   └── ...
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/    # API Controllers
│   │   └── ...
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── routes/
│   │   └── api.php         # API routes
│   └── ...
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── login/     # Login page
│   │   │   ├── register/  # Register page
│   │   │   ├── chat/      # Chat page
│   │   │   └── ...
│   │   ├── components/    # React components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # UI components
│   │   └── ...
│   └── ...
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Run migrations
docker-compose exec app php artisan migrate

# Run seeders
docker-compose exec app php artisan db:seed

# Clear caches
docker-compose exec app php artisan cache:clear

# View logs
docker-compose logs -f app
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📚 API Documentation

Complete API documentation is available in `backend/API_DOCUMENTATION.md`

### Key Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/channels` - Get user's channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/{id}/messages` - Get channel messages
- `POST /api/channels/{id}/messages` - Send message

## 🎨 UI Components

The application includes a comprehensive set of UI components:

- **Authentication Forms** - Login and registration
- **Chat Interface** - Message list, input, reactions
- **Channel Management** - Channel list, creation, settings
- **User Management** - User profiles, status, search
- **Theme System** - Dark/light mode, custom themes
- **Notifications** - Toast notifications, badges
- **Modals** - Various modal dialogs
- **Responsive Design** - Mobile-optimized layouts

## 🔒 Security Features

- OAuth2 authentication with Laravel Passport
- JWT token authentication
- Password hashing with bcrypt
- CSRF protection
- Input validation and sanitization
- Rate limiting
- Secure headers

## 🚀 Deployment

### Backend Deployment
1. Set up a server with Docker
2. Configure environment variables
3. Run `docker-compose up -d`
4. Run migrations and seeders

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs -f app`
2. Verify Docker containers are running
3. Ensure all dependencies are installed
4. Check the API documentation
5. Create an issue with detailed information

## 🎯 Roadmap

- [ ] WebSocket real-time messaging
- [ ] File upload and storage
- [ ] Video/audio calls
- [ ] Message encryption
- [ ] User roles and permissions
- [ ] Channel categories
- [ ] Message editing and deletion
- [ ] User blocking and muting
- [ ] Message search and filters
- [ ] Export chat history
- [ ] Integration with external services
- [ ] Mobile app (React Native)

---

**Built with ❤️ using Laravel and Next.js**
