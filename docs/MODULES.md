# Server Modules — Studium

> `server/src/modules/` — 15 self-contained feature modules
>
> Each module follows the same four-layer pattern:
> `routes.ts` → `controller.ts` → `service.ts` → `repository.ts`

---

## Module index

| Module | Route prefix | Auth required | Description |
|--------|-------------|---------------|-------------|
| `auth` | `/api/auth` | Mixed | Registration, login, refresh, logout |
| `users` | `/api/users` | Mixed | Profiles, follow/unfollow, presence |
| `feed` | `/api/feed` | Optional | College/branch-scoped post feed |
| `posts` | `/api/posts` | Mixed | Post CRUD, bookmarks, view count |
| `comments` | `/api/posts/:id/comments` + `/api/comments` | Mixed | Threaded comments |
| `reactions` | `/api/posts/:id/reactions` + `/api/comments/:id/reactions` | Bearer | Post + comment reactions |
| `tags` | `/api/tags` | Public | Tag listing + posts-by-tag |
| `notifications` | `/api/notifications` | Bearer | In-app notification centre |
| `messaging` | `/api/messages` | Bearer | 1-to-1 and group conversations |
| `knowledge` | `/api/knowledge` | Bearer | Resource hub (notes, PDFs, links) |
| `qna` | `/api/qna` | Bearer | Q&A board with voting and accepted answers |
| `opportunities` | `/api/opportunities` | Bearer | Jobs, internships, hackathons, events |
| `campus` | `/api/campus` | Bearer | Campus life reviews (faculty, food, facilities) |
| `lostfound` | `/api/lostfound` | Bearer | Lost & Found listings and claims |
| `upload` | `/api/upload` | Bearer | Cloudinary file upload/delete |

---

## Module details

### `auth`

Handles all authentication flows. Uses `@fastify/jwt` for token signing and `@fastify/cookie` for the httpOnly refresh token cookie. Rate limited to 10 requests/minute on mutation endpoints.

Key business rules:
- Passwords hashed with bcrypt (12 rounds minimum)
- Refresh tokens are opaque 40-byte hex strings stored in `RefreshToken` table
- Rotation: on every `/refresh` call, the old token row is deleted and a new one is created atomically
- Logout deletes the refresh token from DB and clears the cookie — server-side revocation

---

### `users`

Public profile read, authenticated profile write. Implements the follow graph.

Key business rules:
- Self-follow is rejected (403)
- Duplicate follow is rejected (409)
- `PATCH /me` strips HTML from `name` and `bio` before saving
- Presence endpoint uses Redis: checks `users:{id}:online` key for each ID in the request

---

### `feed`

The only genuinely public endpoint on the server — no `jwtVerify()` call. The `userId` is extracted from the JWT if present (for `sort=following`), but the request is never rejected for missing auth.

Scoping priority:
1. **My Branch** — `?college=X&branch=Y` → `author.college = X AND author.branch = Y`
2. **My College** — `?college=X` → `author.college = X`
3. **Everyone** — no filter

Sort modes:
- `latest` — `ORDER BY createdAt DESC`
- `trending` — raw SQL score formula: `reactions + (comments * 2) + (views * 0.1)` with time decay
- `following` — only posts from users the requester follows; falls back to `latest` if `userId` is null

---

### `posts`

CRUD for posts. `GET /:id` increments `viewCount`. `DELETE /:id` is a soft delete (sets `deletedAt`). Media IDs passed in `mediaIds` are linked to the post after creation.

Tags are upserted by name/slug and linked via the `PostTag` junction table. Creating a post with tags in one transaction keeps the post and tag data consistent.

---

### `comments`

Threaded comments using a self-referential `parentId` on the `Comment` model. The tree is fetched with one Prisma `include` (`replies: { include: { author, replies } }`) up to two levels deep. Soft-deleted comments show `[deleted]` content in responses.

---

### `reactions`

Toggle reactions — calling the endpoint a second time with the same type removes the reaction. Returns updated counts for all reaction types. On creation, enqueues a BullMQ notification job.

---

### `tags`

Read-only browsing. Tag slugs are auto-generated from the name (lowercased, spaces → hyphens). `GET /tags/:slug/posts` returns paginated posts for that tag.

---

### `notifications`

Stores `Notification` rows created by BullMQ workers. Streams live notifications to clients via Socket.IO (`/notifications` namespace). `PATCH /read` marks all unread notifications as read.

---

### `messaging`

1-to-1 and group conversations. Participants are stored in `ConversationParticipant`. Message history is cursor-paginated (`createdAt DESC`). `PATCH /conversations/:id/read` updates `lastReadAt` for the requesting user. Live messages are delivered via Socket.IO (`/chat` namespace) — the server both stores the message in DB and emits the event.

---

### `knowledge`

Resource sharing hub. Supports: bookmarking, 1–5 star ratings, download count tracking. Resources can be files (Cloudinary URLs) or collaborative links. Filtered by `type`, `subject`, and tags.

---

### `qna`

Stack Overflow-style Q&A. Each question has `votes`, `answers`, and a `hasAccepted` flag. Accepting an answer sets `QnaAnswer.isAccepted = true` and `QnaQuestion.hasAccepted = true`. Only the question author can accept an answer. Vote values are `+1` or `-1`.

---

### `opportunities`

Bulletin board for jobs, internships, hackathons, events, scholarships, and student projects. Posted by authenticated users. Filtered by `type`, `college`, deadline. No application tracking — external `url` links users to the actual application.

---

### `campus`

Peer-reviewed campus life ratings. Categories: Faculty, Course, Facility, Food, Transport, Other. `ReviewVote` tracks helpful/not-helpful votes per user per review with a `UNIQUE(reviewId, userId)` constraint.

---

### `lostfound`

Lost & Found listings with claim flow:
1. User posts a LOST or FOUND item
2. Other users submit claims with a message
3. Owner resolves the item (`PATCH /:id/resolve` → `status = RESOLVED`)

Business rules:
- Item owner cannot claim their own item (400)
- Duplicate claims rejected (409)
- Only owner can delete or resolve a listing (403)
- Image URL stored from prior Cloudinary upload

---

### `upload`

File upload to Cloudinary. Accepts multipart form data (field `file`). Returns a `Media` record with the CDN URL and metadata. The `Media` row is initially unlinked (`postId = null`) — it's linked to a post when the post is created with `mediaIds`. Unlinked uploads older than 24 hours are cleaned up by a scheduled BullMQ job.

---

## Workers

### `notification.worker.ts`

BullMQ worker that fans out notifications. When a reaction, comment, or follow event occurs, the service enqueues a job. The worker:
1. Creates a `Notification` row in PostgreSQL
2. Emits a Socket.IO event to the target user's room

Running the worker in a separate process keeps request latency unaffected by fan-out overhead.

### `email.worker.ts`

BullMQ worker for transactional email delivery. Currently handles welcome emails on registration. Uses `nodemailer` or a third-party provider configured via env vars.
