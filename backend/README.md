## NovaChat Backend (Laravel 10)

This is the Laravel API and Ratchet WebSocket server for NovaChat. See the root README for full documentation.

### Quick Start

```
docker compose -f backend/docker-compose.yml up -d --build
docker compose -f backend/docker-compose.yml exec app php artisan key:generate
docker compose -f backend/docker-compose.yml exec app php artisan migrate --seed
```

### WebSocket

- Command: `php artisan websocket:serve --port=7001`
- Managed by Supervisor: `supervisorctl status ws-server`
- Code: `app/WebSocket/ChatServer.php`, `app/WebSocket/RedisBridge.php`

Default frontend WS URL: `ws://localhost:7001` (override via `NEXT_PUBLIC_WS_URL`).
