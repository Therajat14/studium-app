# Queue Architecture — Studium Phase 6

> Last updated: Phase 6 — BullMQ queues, workers, background jobs

---

## Overview

Studium uses **BullMQ** (backed by Redis) for reliable background job processing. Queues decouple time-sensitive HTTP handlers from slow or fallible side-effects.

```
server/
  config/queues/queue.config.ts  — Queue instances + closeQueues()
  workers/
    notifications.worker.ts     — Push notification delivery
    cleanup.worker.ts           — Orphaned Cloudinary asset deletion
```

---

## Queue Definitions

### `notifications` queue

**Purpose:** Deliver push notifications to users who are offline.

**When jobs are added:** In `notifications.service.ts`, after checking `isOnline(userId)` is false.

**Job data:**
```typescript
interface NotificationJobData {
  userId:  string     // target user
  payload: PushPayload  // { title, body, data? }
}
```

**Retry strategy:** 3 attempts, exponential backoff starting at 2 seconds.

**Current behavior:** The `NullPushProvider` is a no-op. Swap it for a real FCM/APNs/web-push implementation by replacing `server/src/lib/push/push.provider.ts`.

---

### `cleanup` queue

**Purpose:** Delete Cloudinary assets for `Media` rows that were uploaded but never attached to a post (draft-safe upload flow).

**When jobs are added:** After a successful upload in `upload.controller.ts`, with a delay so the user has time to submit the post form.

**Job data:**
```typescript
interface CleanupJobData {
  mediaId:  string   // DB row to check + delete
  publicId: string   // Cloudinary public_id
}
```

**Retry strategy:** 5 attempts, exponential backoff starting at 5 seconds (Cloudinary API is rate-limited).

**Guard:** Before deleting, the worker re-checks `media.postId`. If the post was attached between job enqueue and execution, the job is a no-op.

---

## Worker Lifecycle

Workers are started in `server.ts` after the HTTP server begins listening:

```typescript
startNotificationsWorker()
startCleanupWorker()
```

Workers are stopped in the graceful shutdown handler:

```typescript
await Promise.all([
  stopNotificationsWorker(),
  stopCleanupWorker(),
  closeQueues(),
])
```

BullMQ `worker.close()` waits for any in-flight job to finish before shutting down.

---

## Adding a New Queue

1. Add a `new Queue('name', { connection, defaultJobOptions })` export to `queue.config.ts`
2. Create `workers/name.worker.ts` with a `startXxxWorker()` / `stopXxxWorker()` pair
3. Call `startXxxWorker()` in `server.ts` and add `stopXxxWorker()` to the shutdown list
4. Add the queue to `closeQueues()` in `queue.config.ts`

---

## Monitoring

BullMQ exposes job counts via the Queue API:

```typescript
const waiting  = await notificationsQueue.getWaitingCount()
const active   = await notificationsQueue.getActiveCount()
const failed   = await notificationsQueue.getFailedCount()
```

For a UI dashboard, consider adding **Bull Board** (`@bull-board/fastify`) — it mounts a read-only admin UI at `/admin/queues` with no additional code changes to queue/worker logic.

---

## Redis Connection Notes

Each queue and worker uses a **separate** `createRedisClient()` instance because BullMQ requires `maxRetriesPerRequest: null` and will conflict with the shared client used for general-purpose cache/presence.

See [REDIS_ARCHITECTURE.md](./REDIS_ARCHITECTURE.md) for the full connection strategy.
