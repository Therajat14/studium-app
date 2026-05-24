# API Reference — Studium

> Base URL: `http://localhost:5000/api`
>
> All responses use the envelope: `{ "success": true, "data": ... }` or `{ "success": false, "error": { "message": "..." } }`
>
> **Auth**: `Bearer <accessToken>` in the `Authorization` header unless noted otherwise.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Returns `{ status: "ok", timestamp }` |

---

## Authentication — `/api/auth`

Rate limit: 10 requests/minute on all auth mutation endpoints.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Create a new account |
| `POST` | `/api/auth/login` | — | Sign in, receive access token |
| `POST` | `/api/auth/refresh` | cookie | Rotate refresh token, get new access token |
| `GET` | `/api/auth/me` | Bearer | Return the authenticated user's profile |
| `POST` | `/api/auth/logout` | — | Revoke refresh token, clear cookie |

### POST /api/auth/register

```json
// Request body
{
  "name": "Rajat Sharma",
  "email": "rajat@geu.ac.in",
  "password": "password123",
  "rollNumber": "GEU21CS001",
  "college": "Graphic Era University",
  "branch": "B.Tech CSE"
}

// 201 Response
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT" }
  }
}
```

### POST /api/auth/login

```json
// Request body
{ "email": "rajat@geu.ac.in", "password": "password123" }

// 200 Response
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT", "college": "...", "branch": "..." }
  }
}
```

---

## Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users` | — | List users (paginated, filterable by college/role) |
| `GET` | `/api/users/presence` | Bearer | Batch-check online presence for a list of user IDs |
| `GET` | `/api/users/:id` | — | Get a user's public profile |
| `GET` | `/api/users/:id/followers` | — | Get paginated followers list |
| `GET` | `/api/users/:id/following` | — | Get paginated following list |
| `PATCH` | `/api/users/me` | Bearer | Update own profile (name, bio, branch, links, skills…) |
| `POST` | `/api/users/:id/follow` | Bearer | Follow a user |
| `DELETE` | `/api/users/:id/follow` | Bearer | Unfollow a user |

### GET /api/users — query params

| Param | Type | Description |
|-------|------|-------------|
| `college` | string | Filter by college name |
| `role` | `STUDENT\|ALUMNI\|MENTOR\|ADMIN` | Filter by role |
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 20, max 50) |

---

## Feed — `/api/feed`

Public endpoint — JWT is read but not required. When `userId` is null (no token), `sort=following` falls back to `sort=latest`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/feed` | Optional | Get paginated post feed |

### GET /api/feed — query params

| Param | Type | Description |
|-------|------|-------------|
| `sort` | `latest\|trending\|following` | Sort order (default `latest`) |
| `type` | `DISCUSSION\|QUESTION\|ANNOUNCEMENT\|RESOURCE\|POLL` | Filter by post type |
| `college` | string | Scope feed to this college |
| `branch` | string | Further scope to this branch (requires `college`) |
| `limit` | number | Items per page (default 20, max 50) |
| `cursor` | string (cuid) | Cursor-based pagination |
| `page` | number | Offset pagination (default 1) |

```json
// 200 Response
{
  "success": true,
  "data": {
    "items": [],
    "sort": "latest",
    "total": 120,
    "hasMore": true,
    "nextCursor": "clxxx..."
  }
}
```

---

## Posts — `/api/posts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/posts/:id` | — | Get a single post (increments view count) |
| `POST` | `/api/posts` | Bearer | Create a post |
| `PATCH` | `/api/posts/:id` | Bearer (owner) | Update a post |
| `DELETE` | `/api/posts/:id` | Bearer (owner) | Soft-delete a post |
| `POST` | `/api/posts/:id/bookmark` | Bearer | Toggle bookmark on/off |
| `GET` | `/api/posts/:id/bookmark` | Bearer | Check if post is bookmarked |

### POST /api/posts

```json
// Request body
{
  "content": "string (min 10 chars)",
  "title": "optional title",
  "type": "DISCUSSION",
  "tags": ["react", "typescript"],
  "mediaIds": ["clxxx..."]
}
```

`type` values: `DISCUSSION` · `QUESTION` · `ANNOUNCEMENT` · `RESOURCE` · `POLL`

---

## Comments — `/api/posts` and `/api/comments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/posts/:postId/comments` | — | Get comments for a post (threaded) |
| `POST` | `/api/posts/:postId/comments` | Bearer | Create a comment or reply |
| `PATCH` | `/api/comments/:id` | Bearer (owner) | Edit a comment |
| `DELETE` | `/api/comments/:id` | Bearer (owner) | Soft-delete a comment |

```json
// POST body
{
  "content": "Great post!",
  "parentId": "clxxx..."    // optional — makes this a reply
}
```

---

## Reactions — `/api/posts` and `/api/comments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/posts/:id/reactions` | Bearer | Toggle reaction on a post |
| `POST` | `/api/comments/:id/reactions` | Bearer | Toggle reaction on a comment |

```json
// Request body
{ "type": "LIKE" }   // LIKE | UPVOTE | DOWNVOTE

// 200 Response
{
  "success": true,
  "data": {
    "reacted": true,
    "type": "LIKE",
    "counts": { "LIKE": 5, "UPVOTE": 2, "DOWNVOTE": 0 }
  }
}
```

---

## Tags — `/api/tags`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/tags` | — | List all tags (with post count) |
| `GET` | `/api/tags/:slug/posts` | — | Get posts for a tag |

---

## Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/notifications` | Bearer | Get paginated notifications |
| `PATCH` | `/api/notifications/read` | Bearer | Mark all as read |

---

## Messaging — `/api/messages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/messages/conversations` | Bearer | List conversations (most recent first) |
| `POST` | `/api/messages/conversations` | Bearer | Start a new conversation |
| `GET` | `/api/messages/conversations/:id/messages` | Bearer | Get paginated messages |
| `POST` | `/api/messages/conversations/:id/messages` | Bearer | Send a message |
| `PATCH` | `/api/messages/conversations/:id/read` | Bearer | Mark conversation as read |
| `DELETE` | `/api/messages/:messageId` | Bearer (owner) | Soft-delete a message |

### POST /api/messages/conversations

```json
// 1-to-1
{ "participantIds": ["userId2"] }

// Group
{ "participantIds": ["userId2", "userId3"], "name": "Study Group", "isGroup": true }
```

---

## Knowledge Hub — `/api/knowledge`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/knowledge` | Bearer | List resources (filter by type/subject/tags) |
| `POST` | `/api/knowledge` | Bearer | Upload a new resource |
| `POST` | `/api/knowledge/:id/bookmark` | Bearer | Toggle bookmark |
| `POST` | `/api/knowledge/:id/rate` | Bearer | Rate a resource (1–5) |
| `POST` | `/api/knowledge/:id/download` | Bearer | Increment download counter |

### GET /api/knowledge — query params

| Param | Type | Description |
|-------|------|-------------|
| `type` | `PDF\|DOC\|SPREADSHEET\|IMAGE\|VIDEO\|LINK\|COLLABORATIVE` | Filter by type |
| `subject` | string | Filter by subject |
| `page` | number | Page (default 1) |
| `limit` | number | Items per page (default 20) |

---

## Q&A — `/api/qna`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/qna` | Bearer | List questions |
| `GET` | `/api/qna/:id` | Bearer | Get question with answers |
| `POST` | `/api/qna` | Bearer | Ask a question |
| `POST` | `/api/qna/:id/vote` | Bearer | Vote on a question (+1 / -1) |
| `POST` | `/api/qna/:id/answers` | Bearer | Post an answer |
| `PATCH` | `/api/qna/answers/:answerId/accept` | Bearer (question owner) | Accept an answer |

### GET /api/qna — query params

| Param | Type | Description |
|-------|------|-------------|
| `filter` | `latest\|trending\|unanswered\|bounty` | Sort/filter mode |
| `difficulty` | `BEGINNER\|INTERMEDIATE\|ADVANCED` | Filter by difficulty |
| `page` | number | Page (default 1) |
| `limit` | number | Items per page (default 20) |

---

## Opportunities — `/api/opportunities`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/opportunities` | Bearer | List opportunities |
| `POST` | `/api/opportunities` | Bearer | Post an opportunity |
| `DELETE` | `/api/opportunities/:id` | Bearer (owner) | Delete an opportunity |

### GET /api/opportunities — query params

| Param | Type | Description |
|-------|------|-------------|
| `type` | `JOB\|INTERNSHIP\|HACKATHON\|EVENT\|SCHOLARSHIP\|PROJECT` | Filter by type |
| `college` | string | Filter by college |
| `page` | number | Page (default 1) |
| `limit` | number | Items per page (default 20) |

---

## Campus Reviews — `/api/campus`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/campus` | Bearer | List campus reviews |
| `POST` | `/api/campus` | Bearer | Submit a review |
| `POST` | `/api/campus/:id/vote` | Bearer | Vote helpful / not-helpful |

### GET /api/campus — query params

| Param | Type | Description |
|-------|------|-------------|
| `category` | `FACULTY\|COURSE\|FACILITY\|FOOD\|TRANSPORT\|OTHER` | Filter by category |
| `college` | string | Filter by college |
| `page` | number | Page (default 1) |

---

## Lost & Found — `/api/lostfound`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/lostfound` | Bearer | List items |
| `GET` | `/api/lostfound/:id` | Bearer | Get a single item with claims |
| `POST` | `/api/lostfound` | Bearer | Report a lost or found item |
| `PATCH` | `/api/lostfound/:id/resolve` | Bearer (owner) | Mark item as resolved |
| `DELETE` | `/api/lostfound/:id` | Bearer (owner) | Delete a listing |
| `POST` | `/api/lostfound/:id/claim` | Bearer (non-owner) | Submit a claim |

### POST /api/lostfound

```json
{
  "type": "LOST",
  "category": "ELECTRONICS",
  "title": "HP Pavilion Laptop",
  "description": "Lost near Main Library (min 20 chars)",
  "location": "Main Library",
  "contactInfo": "9876543210",
  "imageUrl": "https://..."
}
```

### GET /api/lostfound — query params

| Param | Type | Description |
|-------|------|-------------|
| `type` | `LOST\|FOUND` | Filter by type |
| `category` | see enum | Filter by category |
| `status` | `OPEN\|RESOLVED` | Filter by status |
| `page` | number | Page (default 1) |
| `limit` | number | Max 50 |

---

## File Upload — `/api/upload`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/upload` | Bearer | Upload a file to Cloudinary |
| `DELETE` | `/api/upload/:id` | Bearer (owner) | Delete an uploaded file |

Multipart form data — field name `file`. Size limits: images 10 MB, videos 100 MB.

```json
// 201 Response
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "url": "https://res.cloudinary.com/...",
    "resourceType": "IMAGE",
    "bytes": 204800,
    "originalName": "notes.pdf"
  }
}
```

---

## Real-time Events (Socket.IO)

Connect to `ws://localhost:5000` with the access token:
```
io('http://localhost:5000/notifications', { auth: { token: accessToken } })
io('http://localhost:5000/chat',          { auth: { token: accessToken } })
```

### Namespace `/notifications`

| Direction | Event | Payload |
|-----------|-------|---------|
| Server → Client | `notification` | `{ id, type, actor, entityId, entityType, createdAt }` |
| Server → Client | `unreadCount` | `{ count: number }` |

### Namespace `/chat`

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `joinConversation` | `{ conversationId }` |
| Client → Server | `sendMessage` | `{ conversationId, content }` |
| Client → Server | `typing` | `{ conversationId, isTyping: boolean }` |
| Server → Client | `newMessage` | `Message` object |
| Server → Client | `typing` | `{ userId, conversationId, isTyping }` |
| Server → Client | `messageDeleted` | `{ messageId, conversationId }` |
| Server → Client | `userPresence` | `{ userId, online: boolean }` |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error / business rule violation |
| 401 | Missing or invalid token |
| 403 | Valid token, insufficient permission |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
