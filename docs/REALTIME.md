# Real-time Architecture — Studium

> Socket.IO 4 · Redis 7 (pub/sub + presence) · BullMQ 5 (job queues)

---

## Overview

```
Client (React)
    │
    │  WebSocket (Socket.IO)
    ▼
Fastify Server ──── Socket.IO ──── Redis pub/sub ──── Other Server Nodes
                                        │
                                   BullMQ Queues
                                        │
                              Notification Worker
                              Email Worker
```

Real-time is split into two concerns:

- **Socket.IO** — instant event delivery to connected clients (new message, notification, typing indicator, presence)
- **BullMQ** — durable background job processing (notification fan-out, email delivery)

---

## Socket.IO

### Configuration

Initialized in `server/src/config/socket.ts`. Attached to the Fastify HTTP server:

```typescript
const io = new Server(fastifyServer, {
  cors: { origin: env.CORS_ORIGIN, credentials: true },
  adapter: createAdapter(redisPublisher, redisSubscriber),
})
```

The Redis adapter (`@socket.io/redis-adapter`) allows multiple Node.js processes to share rooms — any process can emit to any room regardless of which process the client is connected to.

### Authentication

Clients pass the access token on connection:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
})
```

The server verifies the JWT in the `connection` middleware. Invalid tokens are rejected before the socket joins any room.

### Namespaces

| Namespace | Purpose |
|-----------|---------|
| `/notifications` | In-app notification delivery |
| `/chat` | Messaging (1-to-1 and group) |

---

### Namespace: `/notifications`

Each authenticated user joins a private room `users:{userId}` on connection.

**Server → Client events:**

| Event | Payload | When |
|-------|---------|------|
| `notification` | `{ id, type, actor, entityId, entityType, createdAt, readAt }` | New notification |
| `unreadCount` | `{ count: number }` | After mark-all-read |

Notifications are also persisted to the `Notification` table by the BullMQ worker, so they survive page reloads.

---

### Namespace: `/chat`

Users join their conversation rooms on connection. The server also joins the user to a personal room `users:{userId}` for direct delivery.

**Client → Server events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `joinConversation` | `{ conversationId }` | Subscribe to a conversation |
| `sendMessage` | `{ conversationId, content }` | Send a message |
| `typing` | `{ conversationId, isTyping: boolean }` | Broadcast typing indicator |

**Server → Client events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `Message` | Delivered to all participants in `conv:{conversationId}` |
| `typing` | `{ userId, conversationId, isTyping }` | Broadcast to other participants |
| `messageDeleted` | `{ messageId, conversationId }` | Soft-delete propagation |
| `userPresence` | `{ userId, online: boolean }` | Presence update |

Message flow:
```
Client sendMessage
    │
    ▼  Controller persists to DB (prisma.message.create)
    │
    ▼  io.to('conv:{id}').emit('newMessage', message)
    │
    ▼  BullMQ: enqueue notification job for each non-sender participant
```

---

## Redis

Redis is used for three distinct purposes:

### 1. Socket.IO adapter (pub/sub)

The `@socket.io/redis-adapter` uses two Redis connections (publisher + subscriber). When `io.to(room).emit(event, data)` is called on any server node, the message is published to a Redis channel. All nodes subscribed to that channel emit the event to their locally connected clients.

This enables horizontal scaling without sticky sessions.

### 2. User presence

Online status is tracked per user with a key that expires automatically:

```
SET users:{userId}:online 1 EX 60
```

The TTL is refreshed on each Socket.IO heartbeat. When a user disconnects, the key expires naturally within 60 seconds. `GET /api/users/presence` does a batch lookup via `mget`.

### 3. BullMQ backend

BullMQ uses Redis to store job queues, results, and worker coordination. All queue/worker instances connect to the same `REDIS_URL`.

---

## BullMQ Queues

BullMQ provides durable, retryable background job processing. Jobs are not lost if the process restarts — they are stored in Redis until a worker picks them up.

### Queue: `notifications`

Defined in `server/src/config/queues/notification.queue.ts`.

| Job name | Payload | What the worker does |
|----------|---------|---------------------|
| `post.reaction` | `{ actorId, targetUserId, postId }` | Creates Notification row + emits Socket.IO event |
| `post.comment` | `{ actorId, targetUserId, postId, commentId }` | Same |
| `comment.reaction` | `{ actorId, targetUserId, commentId }` | Same |
| `user.follow` | `{ actorId, targetUserId }` | Same |

Worker file: `server/src/workers/notification.worker.ts`

Retry policy: 3 attempts with exponential backoff. Failed jobs after all retries move to the `failed` queue for manual inspection.

### Queue: `emails`

Defined in `server/src/config/queues/email.queue.ts`.

| Job name | Payload | What the worker does |
|----------|---------|---------------------|
| `welcome` | `{ userId, email, name }` | Sends welcome email via configured mail provider |

Worker file: `server/src/workers/email.worker.ts`

---

## Running workers

Workers run as separate processes alongside the main API server:

```bash
# In production — run each in a separate process / container
node dist/workers/notification.worker.js
node dist/workers/email.worker.js

# In development — tsx watch runs them automatically via concurrently
npm run dev
```

Workers require the same environment variables as the main server (`DATABASE_URL`, `REDIS_URL`, Socket.IO config).

---

## Scaling

| Component | How to scale |
|-----------|-------------|
| API server | Horizontal — multiple instances behind a load balancer; Redis adapter handles Socket.IO room sync |
| Socket.IO | Scales with API server via Redis pub/sub adapter |
| BullMQ workers | Run as many worker processes as needed — Redis queue is the coordination point |
| PostgreSQL | PgBouncer for connection pooling before the database |
| Redis | Redis Cluster or Redis Sentinel for HA |
