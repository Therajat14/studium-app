# Redis Architecture — Studium Phase 6

> Last updated: Phase 6 — Redis integration, Socket.IO adapter, presence store, queues, caching

---

## Overview

Studium uses **ioredis** as the Redis client. A single shared client handles general-purpose use (presence, cache), while dedicated clients are created for pub/sub (Socket.IO adapter) and BullMQ (queue workers).

```
server/
  config/redis.ts       — shared client + createRedisClient factory + closeRedis()
  config/socket.ts      — creates pub/sub clients for Socket.IO Redis adapter
  config/queues/        — BullMQ queue definitions (separate client per queue)
  workers/              — BullMQ workers (separate client per worker)
  lib/socket/presence.store.ts — Redis-backed presence using HSET/HDEL/HLEN
  lib/cache/cache.ts    — generic get/set/del/delPattern helpers
```

---

## Connection Strategy

| Use case | Client | Reason |
|---|---|---|
| Presence, cache | `redis` (shared singleton) | Low write frequency; safe to share |
| Socket.IO pub | `createRedisClient()` | Dedicated — pub client must not be used for anything else |
| Socket.IO sub | `createRedisClient()` | Dedicated — sub client must not be used for anything else |
| BullMQ queues | `createRedisClient()` | BullMQ requires `maxRetriesPerRequest: null` |
| BullMQ workers | `createRedisClient()` per worker | Workers run independently |

**Why `maxRetriesPerRequest: null`?** BullMQ uses blocking Redis commands (`BLPOP`, `BRPOP`). The default ioredis behavior of throwing after N retries would abort a blocking pop. Setting this to `null` lets ioredis retry indefinitely — the worker stays alive through transient Redis blips.

**Why `lazyConnect: true`?** Allows creating clients at module load time without immediately opening connections. `connect()` is called explicitly or implicitly on first command.

---

## Presence Store

Redis data structure: `HASH presence:{userId}` → `{ [socketId]: "1" }`

```
addConnection(userId, socketId)
  → HSET presence:{userId} {socketId} 1
  → EXPIRE presence:{userId} 3600      (safety TTL)
  → HLEN presence:{userId}             → returns 1 if user just came online

removeConnection(userId, socketId)
  → HDEL presence:{userId} {socketId}
  → HLEN presence:{userId}             → returns 0 if user just went offline

isOnline(userId)
  → HLEN presence:{userId} > 0

batchIsOnline(userIds[])
  → Pipeline of HLEN commands          → O(n) in one round-trip
```

**Multi-tab safety:** A user is online as long as at least one socket is connected. Opening a second tab increments the hash; closing it decrements. The user goes offline only when HLEN reaches 0.

**TTL as safety net:** The 3600-second TTL ensures stale entries are evicted if the server crashes without calling `removeConnection`. Normal disconnects always call HDEL explicitly.

---

## Socket.IO Redis Adapter

The `@socket.io/redis-adapter` package enables cross-process room emission. Without it, two Node.js processes cannot reliably emit to the same room — their in-memory room maps are independent.

```typescript
// config/socket.ts
const pubClient = createRedisClient()
const subClient = createRedisClient()
await Promise.all([pubClient.connect(), subClient.connect()])
io.adapter(createAdapter(pubClient, subClient))
```

With the adapter, `io.to('user:X').emit(...)` reaches the correct process regardless of where the socket lives. This is transparent to all gateway emit helpers — they just call `getIo()?.to(...).emit(...)` as before.

**Current Phase 6 state:** Single-process. The adapter is in place but doesn't change behavior until a second process is added (e.g., via PM2 cluster or Kubernetes pods).

---

## Cache Utilities

`server/src/lib/cache/cache.ts` provides simple typed wrappers around Redis string keys:

```typescript
cacheGet<T>(key)         → T | null
cacheSet<T>(key, value, ttl?)  → void   (default TTL: 300s)
cacheDel(key)            → void
cacheDelPattern(pattern) → void   (uses KEYS — avoid in hot paths on large datasets)
```

**When to use:** Short-lived computed values (feed trending scores, user profile snippets) where re-computation is cheap but frequent. Not used for auth tokens — those live in the DB.

---

## Graceful Shutdown

All Redis clients are closed in `server.ts` shutdown handler:

```typescript
await Promise.all([
  app.close(),
  prisma.$disconnect(),
  stopNotificationsWorker(),
  stopCleanupWorker(),
  closeQueues(),
  closeRedis(),     // shared singleton
])
```

BullMQ pub/sub clients (for the Socket.IO adapter) do not have a separate `close()` — they are managed by the adapter and closed when the Socket.IO server closes as part of `app.close()`.

---

## Scaling Path

1. **Multiple processes today**: Socket.IO adapter is already wired. Add `pm2 -i max` or deploy multiple pods — room events will cross-process correctly.
2. **Presence across processes**: Already Redis-backed. No changes needed.
3. **Cache invalidation**: Use `cacheDelPattern` or publish to a Redis channel for cross-process invalidation.
4. **Redis cluster**: ioredis supports cluster mode via `new Redis.Cluster([...nodes])`. Swap the client creation in `config/redis.ts` only.
