# NovaChat - Modern Chat Application

![Architecture](/frontend/public/screenshots/architecture.png)

A modern, real-time chat application built with Laravel (Backend) and Next.js (Frontend), featuring a clean UI inspired by Rocket.Chat and Slack.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Register, login, logout with JWT tokens
- ✅ **Real-time Messaging** - Send and receive messages instantly (WebSocket)
- ✅ **Channel Management** - Create, join, and manage public/private channels
- ✅ **Direct Messages** - Private conversations between users
- ✅ **Message Threading** - Reply to specific messages (right panel)
- ✅ **Message Reactions** - Emoji popover, toggle/remove, reaction counters
- ✅ **Mentions** - Autocomplete @members, highlight in input and message bubble
- ✅ **Read Receipts** - Sent/Delivered/Read ticks, per-user read pointers (avatars)
- ✅ **File Attachments** - Drag & drop, paste-to-upload, progress, image/video preview
- ✅ **Voice Messages** - Record and send voice messages
- ✅ **User Status** - Online, away, busy, offline status
- ✅ **Dark/Light Theme** - Toggle between themes
- ✅ **Search** - Global overlay (messages), in-chat jump-to-message, highlight, keyboard nav
- ✅ **Notifications** - Basis for mentions; per-conversation mute/pin
- ✅ **Mobile Responsive** - Works on all devices

### Advanced Features
- 🎨 **Custom Themes** - Create and customize themes
- ⌨️ **Keyboard Shortcuts** - Power user shortcuts
- 📊 **Message Analytics** - Read receipts and typing indicators (multi-typers)
- 🔍 **Advanced Search** - Search with filters
- 📱 **Mobile Optimization** - Touch gestures and responsive design

## 🏗️ Architecture

### Backend (Laravel)
- Controller + Service + Repository (Eloquent)
- **Laravel Passport** for OAuth2 authentication
- **MySQL** database
- **Redis** for caching and real-time features (Streams for presence/messages)
- **WebSocket** support for real-time messaging (Node ws gateway)

### Frontend (Next.js)
- **Next.js 15** with App Router & Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management + lightweight store
- **Virtualized Lists** with `react-virtuoso` for smooth chat scrolling
- **i18n** with `react-i18next` + localStorage language persistence
- **Modern UI/UX** design

### Architecture components & responsibilities

- Frontend (Next.js)
  - UI: `ModernChatLayout`, `ModernChatMessagesNew`, `ModernChatInput`, `ModernChatHeader`, `RightSidebar`.
  - Logic: `useChat` kết hợp REST API và WebSocket client (`src/lib/websocket.ts`).
  - Tính năng: virtualized messages, mentions autocomplete, reactions popover, read receipts, search overlay (jump-to-message), uploads kéo-thả/paste (progress).

- WebSocket Gateway (Node ws) — `backend/ws-gateway/server.js`
  - Nhận kết nối WS, quản lý phòng theo conversation.
  - Xử lý: `join_conversation`, `subscribe_all_conversations`, `chat_message`, `typing_start/stop`, `message_read`.
  - Broadcast realtime tới client trong phòng; ghi sự kiện vào Redis Streams (`chat_messages`, `user_presence`).

- Backend API (Laravel)
  - Controllers/Services/Repositories (Eloquent) cho: messages (edit/delete/react/bookmark), conversations, unread/read, settings, search.
  - Lưu trữ MySQL; có thể tiêu thụ Streams để persist message khi mở rộng hàng đợi.

- Redis
  - Streams: `chat_messages` (hàng đợi tin nhắn), `user_presence` (online/offline) — giao tiếp nhẹ giữa gateway và backend.

### End-to-end flow (tóm tắt)

1) FE gửi tin: `useChat` → WebSocket `chat_message` (đã join room).
2) WS gateway broadcast ngay tới các client cùng conversation; đồng thời `XADD` vào stream `chat_messages` cho backend.
3) FE hiển thị tin mới; nếu không ở cuộc trò chuyện đó, tăng `unread`.
4) Khi cuộn chạm cuối, FE gửi `message_read` → gateway broadcast → FE cập nhật read receipts (ticks/avatars).
5) Edit/Delete/Reaction: FE gọi REST; Laravel cập nhật DB và (tuỳ chọn) phát sự kiện cho client khác.

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
├── backend/                      # Laravel Backend (API + WS gateway under ws-gateway/)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── ...
│   ├── config/ routes/ database/
│   ├── ws-gateway/               # Node ws server
│   └── ...
├── frontend/                     # Next.js Frontend
│   ├── public/                   # Static assets (+ screenshots)
│   └── src/
│       ├── app/                  # App Router pages
│       ├── components/
│       ├── hooks/ services/ types/
│       └── ...
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

### WebSocket Gateway

The WS gateway runs under `backend/ws-gateway` (Node `ws`). It handles:
- Connection lifecycle (heartbeat ping)
- Join/subscribe to conversations
- Broadcast chat_message, typing_start/stop, message_read

Start (dev): from `backend/ws-gateway`, run `npm i && npm run start` (config matches Laravel URL and Redis).
```

## 🎨 UI Components

The application includes a comprehensive set of UI components:

- **Authentication Forms** - Login and registration
- **Chat Interface** - Virtualized message list, reactions popover, mentions, receipts
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

## 🎯 Roadmap (high-level)

- [x] WebSocket real-time messaging (typing, read)
- [x] Message editing and deletion
- [x] Reactions popover + counters
- [x] Mentions autocomplete + highlight
- [x] Search overlay + jump-to-message
- [x] Virtualized messages
- [x] File upload (drag-drop, paste, progress, preview)
- [ ] Read receipts avatar row refine (per-user pointer position)
- [ ] Offline queue + resend with backoff
- [ ] Push notifications & mentions inbox
- [ ] Video/audio calls
- [ ] Message encryption
- [ ] User roles and permissions
- [ ] Export chat history
- [ ] Mobile app (React Native)

## 📸 Screenshots

![Screen](/frontend/public/screenshots/screen.png)

**Built with ❤️ using Laravel and Next.js**
