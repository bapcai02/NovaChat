# Redis Stream User Presence System

Hệ thống quản lý user online/offline sử dụng Redis Stream theo mô hình microservice (Laravel + Node.js WebSocket Gateway).

## Kiến trúc hệ thống

```
Frontend (React) 
    ↓ API calls
Laravel Backend 
    ↓ Redis Stream
WebSocket Gateway (Node.js)
    ↓ WebSocket
Frontend (React)
```

## 1. WebSocket Gateway (Node.js)

### Chức năng
- Khi client connect → publish `user_connected` event vào Redis Stream
- Khi client disconnect → publish `user_disconnected` event vào Redis Stream
- Sử dụng Redis Stream với `MAXLEN ~ 100000` để giới hạn kích thước

### Code mẫu
```javascript
// Publish user presence event to Redis Stream
const publishUserPresenceEvent = async (event, userId) => {
  try {
    const eventData = {
      event: event,
      user_id: userId,
      timestamp: new Date().toISOString()
    };
    
    // Publish to Redis Stream with MAXLEN ~ 100000
    const streamId = await redis.xadd(
      'user_presence',
      'MAXLEN', '~', 100000,
      '*',
      'event', eventData.event,
      'user_id', eventData.user_id,
      'timestamp', eventData.timestamp
    );
    
    log(`Published ${event} event for user ${userId} to Redis Stream:`, streamId);
    return streamId;
  } catch (error) {
    log(`Error publishing ${event} event for user ${userId}:`, error.message);
    throw error;
  }
};
```

### Event Format
```json
{
  "event": "user_connected" | "user_disconnected",
  "user_id": 123,
  "timestamp": "2025-09-07T10:20:00Z"
}
```

## 2. Laravel Backend

### UserPresenceService
- Consume events từ Redis Stream `user_presence`
- Sử dụng consumer group để scale nhiều worker
- Cập nhật database khi nhận events

### Code mẫu
```php
class UserPresenceService
{
    private const STREAM_NAME = 'user_presence';
    private const CONSUMER_GROUP = 'user_presence_consumers';
    private const CONSUMER_NAME = 'laravel_worker';

    public function consumeEvents(int $count = 10, int $block = 1000): array
    {
        $events = Redis::xreadgroup(
            self::CONSUMER_GROUP,
            self::CONSUMER_NAME,
            [self::STREAM_NAME => '>'],
            $count,
            $block
        );

        foreach ($events[self::STREAM_NAME] as $streamId => $eventData) {
            $this->processEvent($streamId, $eventData);
        }
    }
}
```

### ProcessUserPresenceEvents Job
- Queue job chuyên consume Redis Stream
- Tự động retry và scale
- Log chi tiết cho monitoring

## 3. API Endpoints

### GET /api/users/{id}/status
Trả về trạng thái user:
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "is_online": true,
    "last_seen_at": "2025-09-07T10:20:00Z"
  }
}
```

### POST /api/users/status
Trả về trạng thái nhiều users:
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "is_online": true,
      "last_seen_at": "2025-09-07T10:20:00Z"
    },
    {
      "user_id": 2,
      "is_online": false,
      "last_seen_at": "2025-09-07T09:15:00Z"
    }
  ]
}
```

### GET /api/users/me/status
Trả về trạng thái current user.

## 4. Database Schema

### Users Table
```sql
ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP NULL;
```

## 5. Frontend Integration

### Load User Statuses
```javascript
const loadUserStatuses = useCallback(async () => {
  try {
    // Get all user IDs from conversations
    const allUserIds = new Set()
    conversations.forEach(conv => {
      if (conv.members) {
        conv.members.forEach(member => {
          if (member.id !== currentUser?.id) {
            allUserIds.add(member.id)
          }
        })
      }
    })
    
    const response = await apiService.post('/users/status', {
      user_ids: Array.from(allUserIds)
    })
    
    const userStatuses = response.data?.data || []
    
    // Create a map of user_id -> is_online
    const onlineUserIds = new Set()
    userStatuses.forEach(status => {
      if (status.is_online) {
        onlineUserIds.add(status.user_id)
      }
    })
    
    setOnlineUserIds(onlineUserIds)
  } catch (err) {
    console.error('Error loading user statuses:', err)
  }
}, [conversations, currentUser?.id])
```

### Periodic Refresh
```javascript
// Refresh user statuses every 30 seconds
useEffect(() => {
  if (conversations.length > 0) {
    const interval = setInterval(() => {
      loadUserStatuses()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }
}, [loadUserStatuses, conversations.length])
```

## 6. Deployment & Scaling

### Start Queue Worker
```bash
# Start Laravel queue worker
docker-compose exec app php artisan queue:work --queue=default --timeout=60 --tries=3

# Dispatch initial job
docker-compose exec app php artisan tinker --execute="App\Jobs\ProcessUserPresenceEvents::dispatch()"
```

### Multiple Workers
```bash
# Scale to multiple workers
docker-compose exec app php artisan queue:work --queue=default --timeout=60 --tries=3 &
docker-compose exec app php artisan queue:work --queue=default --timeout=60 --tries=3 &
```

### Multiple WebSocket Gateways
- Mỗi gateway instance có thể chạy độc lập
- Tất cả đều publish vào cùng Redis Stream
- Laravel workers consume từ cùng stream

## 7. Monitoring & Debugging

### Redis Stream Commands
```bash
# Check stream length
docker-compose exec redis redis-cli XLEN user_presence

# Read recent events
docker-compose exec redis redis-cli XREAD COUNT 10 STREAMS user_presence 0

# Check consumer groups
docker-compose exec redis redis-cli XINFO GROUPS user_presence
```

### Laravel Logs
```bash
# Check queue worker logs
docker-compose logs app | grep "ProcessUserPresenceEvents"

# Check user presence service logs
docker-compose logs app | grep "UserPresenceService"
```

### WebSocket Gateway Logs
```bash
# Check gateway logs
docker-compose logs ws-gateway | grep "Published.*event"
```

## 8. Benefits

### Scalability
- Redis Stream có thể handle hàng triệu events
- Multiple workers có thể consume parallel
- Multiple gateways có thể publish events

### Reliability
- Redis Stream đảm bảo events không bị mất
- Consumer groups đảm bảo mỗi event chỉ được process một lần
- Queue jobs có retry mechanism

### Performance
- Database chỉ được update khi có events
- Frontend cache user statuses và refresh định kỳ
- Không cần real-time WebSocket cho user status

### Maintainability
- Tách biệt concerns: Gateway chỉ handle WebSocket, Laravel chỉ handle business logic
- Dễ debug và monitor từng component
- Có thể scale từng component độc lập

## 9. Testing

### Test User Connect/Disconnect
1. Mở browser với user A
2. Kiểm tra Redis Stream: `XREAD COUNT 10 STREAMS user_presence 0`
3. Kiểm tra database: `SELECT id, name, is_online, last_seen_at FROM users WHERE id = A`
4. Đóng browser
5. Kiểm tra lại database sau vài giây

### Test API
```bash
# Test single user status
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/users/1/status

# Test multiple users status
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_ids": [1, 2, 3]}' \
  http://localhost:8000/api/users/status
```

### Test Frontend
1. Login với user A
2. Mở browser tab khác với user B
3. Kiểm tra sidebar - user B sẽ hiển thị online
4. Đóng tab user B
5. Sau 30 giây, user B sẽ hiển thị offline
