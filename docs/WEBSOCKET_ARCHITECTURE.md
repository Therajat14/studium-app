# WebSocket Architecture — Studium Phase 5

> Last updated: Phase 5 — Realtime infrastructure, notifications, presence, typing indicators

---

## Overview

Studium uses Socket.IO v4 for realtime communication. The socket server is attached to the same Node.js `http.Server` as Fastify, sharing the same port.

```
Browser (React SPA)
       │
       │  HTTPS / REST (JSON)      ← primary data channel
       │  WebSocket / polling      ← realtime sync channel
       │  Cookie (httpOnly token)
       ▼
Fastify API Server
       │ ── Socket.IO Server (attached to same httpServer)
       │
       ▼
PostgreSQL
```

---

## Authentication

Every socket connection is authenticated at handshake time using a JWT:

```
Client → Server handshake: { auth: { token: "<access_token>" } }
Server middleware: jwt.verify(token, JWT_SECRET) → attaches userId + role to socket.data
Rejected connections never reach any handler
```

The `auth` option on the client is a **callback function** (not a plain object), so each reconnect attempt calls it fresh to pick up the latest access token after a token refresh. No manual reconnect logic is needed.

---

## Room Structure

| Room | Who joins | Purpose |
|---|---|---|
| `user:{userId}` | Every authenticated user, automatically on connect | Targeted notifications, unread counts |
| `feed:public` | Every authenticated user, automatically on connect | New post broadcasts, presence events |
| `post:{postId}` | Client calls `room:join_post` when viewing PostDetail | Comment + reaction events for a specific post |

---

## Event Reference

### Server → Client

| Event | Room | Payload | Cache action |
|---|---|---|---|
| `notification:new` | `user:{id}` | `{ notification }` | Prepend to notifications list |
| `notification:count` | `user:{id}` | `{ unread: number }` | Set unread badge |
| `feed:new_post` | `feed:public` | `{ post }` | Prepend to latest feed (page 0) |
| `post:new_comment` | `post:{id}` | `{ postId, comment }` | Invalidate comments query; bump comment count |
| `post:reaction_update` | `post:{id}` | `{ postId, counts }` | Patch reaction count in feed + post detail |
| `presence:online` | `feed:public` | `{ userId }` | Set `presence[userId] = true` |
| `presence:offline` | `feed:public` | `{ userId }` | Set `presence[userId] = false` |
| `typing:start` | `post:{id}` | `{ postId, userId }` | Show typing indicator (ephemeral, no cache) |
| `typing:stop` | `post:{id}` | `{ postId, userId }` | Hide typing indicator |

### Client → Server

| Event | Payload | Server action |
|---|---|---|
| `room:join_post` | `{ postId }` | `socket.join('post:{postId}')` |
| `room:leave_post` | `{ postId }` | `socket.leave('post:{postId}')` |
| `typing:start` | `{ postId }` | Relay to `post:{postId}` room (excluding sender) |
| `typing:stop` | `{ postId }` | Relay to `post:{postId}` room (excluding sender) |

---

## Cache Synchronization Strategy

TanStack Query remains the **single source of truth**. Socket events act as cache hints only — they never bypass React Query's data model.

| Event | Client action | Why |
|---|---|---|
| `feed:new_post` | `setQueryData` — prepend to page 0 of `['feed','latest',...]` | Safe: minimal shape matches Post interface |
| `post:reaction_update` | `setQueriesData` — patch `_count.reactions` across all feed variants | Safe: counts are a flat integer |
| `post:new_comment` | `invalidateQueries(['comments', postId])` | Invalidate: comment tree with nested replies is too complex to patch safely |
| `notification:new` | `setQueryData` — prepend to notifications list page 0 | Safe: notification shape is flat |
| `notification:count` | `setQueryData(['notifications','unread'])` | Safe: single integer |
| `presence:online/offline` | `setQueryData(['presence', ...ids])` | Safe: boolean map |

**Reconnect safety:** On reconnect, TanStack Query's `refetchOnWindowFocus` and `refetchOnReconnect` defaults handle stale data automatically. No special socket reconnect logic is needed.

---

## Notification Lifecycle

```
1. User A performs an action (comment, follow, reaction)
2. Controller calls service → gets result → response sent to User A
3. Controller calls void notificationsService.createXxxNotification(actorId, ...)
   (fire-and-forget — never blocks the HTTP response)
4. notificationsService:
   a. Looks up target user (post author / comment author / follow target)
   b. Self-notification guard: actorId === targetUserId → early return
   c. prisma.notification.create(...)
   d. socketGateway.emitNotification(targetUserId, notification)
   e. Queries countUnread(targetUserId)
   f. socketGateway.emitUnreadCount(targetUserId, { unread })
5. User B's client receives notification:new → prepends to notifications cache
6. User B's client receives notification:count → updates bell badge
```

**Self-notification prevention** is enforced in each `notificationsService.createXxx` helper before the DB write.

**Notification types and entity mapping:**

| Type | entityId | entityType | Target |
|---|---|---|---|
| COMMENT | commentId | comment | Post author |
| REPLY | replyId | comment | Parent comment author |
| FOLLOW | actorId | user | Followed user |
| POST_REACTION | postId | post | Post author |
| COMMENT_REACTION | commentId | comment | Comment author |

---

## Presence Architecture

```
In-memory Map<userId, Set<socketId>>
  ├─ addConnection(userId, socketId) → returns true if user just came online
  └─ removeConnection(userId, socketId) → returns true if user just went offline

REST: GET /api/users/presence?userIds[]=... → { [userId]: boolean }
     Used for initial page load before socket connects
```

**Multi-tab handling:** A user is "online" as long as at least one socket is connected. Opening a second tab adds to the set; closing it removes one entry but the user stays online.

### Redis Migration Path

Replace the `Map` in `server/src/lib/socket/presence.store.ts` with Redis commands:

```typescript
// addConnection  → HSET presence:{userId} {socketId} "1"
// removeConnection → HDEL presence:{userId} {socketId}; then HLEN to check if empty
// isOnline       → HLEN presence:{userId} > 0
// batchIsOnline  → Pipeline of HLEN commands
```

No other files need to change — the store is the only file that touches the backing structure.

---

## Typing Indicators

Typing events are **fully ephemeral** — never written to DB, never stored in any cache.

```
Client A: socket.emit('typing:start', { postId })
Server:   socket.to('post:{postId}').except(socket.id).emit('typing:start', { postId, userId })
Client B: shows "User A is typing…" indicator
Client A: socket.emit('typing:stop', { postId })
Server:   relays to post room
Client B: hides indicator
```

If the user disconnects mid-typing, the `typing:stop` is never sent. The client should implement a timeout (e.g., 3 seconds of inactivity) to auto-clear the indicator.

---

## Scaling Limitations

### Current (Phase 5)

- **Single-process only.** Presence is in-memory; Socket.IO rooms are in-process. Running two Node.js processes would split clients across independent presence maps and room sets.
- **No persistence across restarts.** All socket state (rooms, presence) is lost on process restart. Clients reconnect automatically, but presence events are not replayed.
- **Notification delivery is best-effort.** If the target user is offline, the socket event is dropped. The notification is still persisted to DB and will appear on next page load.

### Horizontal Scaling Path

1. **Add Socket.IO Redis adapter** (`@socket.io/redis-adapter`):
   ```typescript
   import { createAdapter } from '@socket.io/redis-adapter'
   import { createClient } from 'redis'
   const pubClient = createClient({ url: REDIS_URL })
   const subClient = pubClient.duplicate()
   io.adapter(createAdapter(pubClient, subClient))
   ```
   This makes room emissions cross-process — `io.to('user:X').emit(...)` reaches the correct process regardless of which one holds the socket.

2. **Replace presence store with Redis.** See Redis Migration Path above.

3. **Sticky sessions** (optional). With the Redis adapter, sticky sessions are not strictly required for Socket.IO. However, they reduce adapter overhead for polling transport.

---

## Future Integrations

### Push Notifications

The `notificationsService.createXxx` functions are the single dispatch point. Adding push:

```typescript
// notifications.service.ts — after DB insert + socket emit:
if (!isOnline(targetUserId)) {
  await pushProvider.send(targetUserId, { title, body, data: { entityId } })
}
```

`isOnline` from the presence store gates the push — no need to push when the user has an active socket.

### Email Notifications

Same pattern: check online status, fall back to email queue for offline users. A worker drains the queue on a schedule.

### Chat System

Add a `chat` namespace or a `conversation:{id}` room pattern. The architecture already supports arbitrary room joins via client events. The gateway can be extended with `emitToConversation(conversationId, event, data)` following the same pattern as `emitToPost`.

---

## File Map

```
server/src/
  config/socket.ts               — Server construction + connection lifecycle handler
  lib/socket/
    socket.events.ts             — Event name constants + payload types (source of truth)
    socket.gateway.ts            — Typed emit helpers (only file that calls io.to().emit())
    socket.middleware.ts         — JWT auth handshake
    presence.store.ts            — In-memory presence Map

client/src/
  lib/
    socket.ts                    — socket.io-client singleton (autoConnect: false)
    socketEvents.ts              — Event name constants (mirror of server)
  hooks/
    useSocket.ts                 — Connect/disconnect lifecycle
    useNotifications.ts          — Notifications query + realtime cache patches
    usePresence.ts               — Presence query + realtime cache patches
  features/notifications/
    NotificationBell.tsx         — Bell icon + unread badge + dropdown trigger
    NotificationList.tsx         — Paginated notification list + mark-read actions
```
