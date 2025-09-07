# User Online/Offline System

Hệ thống hiển thị trạng thái online/offline của user trong real-time chat.

## Tính năng đã implement

### 1. WebSocket Gateway (Node.js + Redis)
- **Khi user connect**: Nhận `message.type = "user_online"` với `user_id`
- **Lưu trạng thái online**: Redis `set user:{id}:online 1` với TTL 5 phút
- **Khi user disconnect**: Tự động xóa khỏi Redis và broadcast `user_status_changed`
- **Broadcast real-time**: Gửi `user_status_changed` đến tất cả client khi có thay đổi

### 2. Laravel Backend
- **API endpoint**: `GET /api/users/online` - Trả về danh sách user đang online
- **API endpoint**: `GET /api/users/{userId}/online` - Kiểm tra trạng thái user cụ thể
- **API endpoint**: `POST /api/users/last-seen` - Cập nhật last seen timestamp

### 3. Frontend (React/Next.js)
- **WebSocket client**: Tự động gửi `user_online` khi connect, `user_offline` khi disconnect
- **Real-time updates**: Lắng nghe `user_status_changed` để cập nhật UI
- **UI components**: `UserOnlineStatus` component hiển thị chấm xanh/lá cho user online
- **Sidebar integration**: Hiển thị trạng thái online trong danh sách conversation

## Cách sử dụng

### 1. Kiểm tra user online
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/users/online
```

### 2. Kiểm tra trạng thái user cụ thể
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/users/1/online
```

### 3. Cập nhật last seen
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/users/last-seen
```

## WebSocket Messages

### Gửi từ Frontend
```javascript
// Set user online
wsClient.setUserOnline(userId)

// Set user offline  
wsClient.setUserOffline(userId)
```

### Nhận từ WebSocket Gateway
```javascript
{
  "type": "user_status_changed",
  "user_id": 123,
  "status": "online" | "offline",
  "timestamp": "2025-09-07T10:20:00Z"
}
```

## Redis Keys

- `user:{id}:online` - User online status (TTL: 5 phút)
- `online_users` - Set chứa tất cả user ID đang online
- `user:{id}:last_seen` - Timestamp lần cuối user hoạt động (TTL: 1 giờ)

## Logs

### WebSocket Gateway
```bash
docker-compose logs ws-gateway
```

### Laravel
```bash
docker-compose logs app
```

## Testing

1. **Mở 2 browser tab** với 2 user khác nhau
2. **Chọn conversation** - User sẽ tự động set online
3. **Kiểm tra sidebar** - Sẽ thấy chấm xanh cho user online
4. **Đóng tab** - User sẽ tự động set offline
5. **Kiểm tra API** - `/api/users/online` sẽ cập nhật real-time

## Troubleshooting

### User không hiển thị online
1. Kiểm tra WebSocket connection: `docker-compose logs ws-gateway`
2. Kiểm tra Redis: `docker-compose exec redis redis-cli SMEMBERS online_users`
3. Kiểm tra API: `curl http://localhost:8000/api/users/online`

### WebSocket không connect
1. Kiểm tra port 7000: `docker-compose ps`
2. Kiểm tra logs: `docker-compose logs ws-gateway`
3. Restart service: `docker-compose restart ws-gateway`
