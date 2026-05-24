# Architecture — Studium

> Last updated: Phase 5 — Testing, CI/CD, college-scoped feed, full feature set complete

---

## System Overview

```
Browser (React 19 SPA)
       │
       │  HTTPS / REST (Axios + httpOnly cookie)
       │  WebSocket (Socket.IO)
       ▼
Fastify 5 API Server (Node.js 20)
       │                    │
       │  Prisma 7          │  ioredis
       ▼                    ▼
PostgreSQL 15          Redis 7
                            │
                       BullMQ Workers
                       (notifications, email)
```

---

## Frontend Architecture

### Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework with concurrent features |
| TypeScript | 5 | Strict end-to-end type safety |
| Vite | 7 | Build tool, dev server, HMR |
| TailwindCSS | v4 | Utility-first styles, zero dead CSS |
| TanStack Query | v5 | Server state, caching, infinite scroll, optimistic updates |
| React Hook Form | 7 | Performant uncontrolled forms |
| Zod | 3 | Form and API response validation |
| shadcn/ui (Radix) | — | Accessible headless primitives |
| Axios | 1 | HTTP client with request/response interceptors |
| Socket.IO client | 4 | Real-time event subscription |

### Folder structure

```
client/src/
├── api/               # One file per feature — typed async functions (no raw axios calls)
│   ├── auth.ts
│   ├── feed.ts
│   ├── posts.ts
│   ├── users.ts
│   ├── knowledge.ts
│   ├── qna.ts
│   ├── opportunities.ts
│   ├── campus.ts
│   ├── lostfound.ts
│   └── ...
│
├── components/
│   ├── ui/            # shadcn/ui primitives (Button, Dialog, Badge…) — never hand-edit
│   └── shared/        # App-specific reusable components (Avatar, Navbar…)
│
├── context/
│   └── AuthContext.tsx  # User + token state; exposes login/register/logout
│
├── features/          # Self-contained feature modules (components + hooks co-located)
│   ├── feed/          # FeedPage, PostCard, FeedTabs (My Branch / My College / Everyone)
│   ├── posts/         # PostDetailPage, CommentThread, CreatePostModal
│   ├── chat/          # ChatPage, ConversationList, MessageBubble
│   └── notifications/ # NotificationBell, NotificationList
│
├── hooks/             # App-wide custom hooks
│   ├── useAuth.ts     # AuthContext consumer
│   ├── useFeed.ts     # Infinite feed with college/branch/sort params
│   ├── usePosts.ts    # Create, delete, bookmark
│   ├── useReactions.ts
│   ├── useSocket.ts   # Socket.IO connection lifecycle
│   └── ...
│
├── pages/             # Route-level components — thin shells, delegate to features
│   ├── Login.tsx      # Step-based register/login with Dehradun college dropdowns
│   ├── ProfilePage.tsx
│   ├── LostFoundPage.tsx
│   ├── KnowledgePage.tsx
│   ├── QnaPage.tsx
│   ├── OpportunitiesPage.tsx
│   ├── CampusPage.tsx
│   └── SearchPage.tsx
│
├── routes/
│   └── PrivateRoute.tsx  # Checks auth loading + user, redirects to /login
│
├── test/              # Test infrastructure
│   ├── mocks/         # MSW handlers + setupServer
│   ├── setup.ts       # @testing-library/jest-dom + MSW lifecycle
│   └── utils.tsx      # renderWithProviders (QueryClient + MemoryRouter)
│
├── types/
│   └── index.ts       # All shared TypeScript interfaces and enums
│
└── utils/
    └── axiosInstance.ts  # Axios instance, token injection, 401 refresh interceptor
```

### Authentication flow (client)

```
1. App mounts → AuthContext.useEffect fires
2. POST /api/auth/refresh  (httpOnly cookie sent automatically)
   ├── 200 → injectToken(accessToken), setUser(user), loading = false
   └── 4xx → injectToken(null), setUser(null), loading = false
3. PrivateRoute checks loading + user
   ├── loading = true  → spinner (prevents flash redirect)
   ├── user != null    → render protected page
   └── user = null     → <Navigate to="/login" />
4. On login/register → accessToken stored in JS module variable (never localStorage)
5. All requests attach Bearer token via axios request interceptor
6. On 401 response → interceptor queues requests, calls /api/auth/refresh, retries
7. If refresh fails → clear token + user, redirect to /login
```

### Feed scoping (college-focused)

The feed has three tabs with automatic scoping:

| Tab | Scope | API params |
|-----|-------|-----------|
| My Branch | Same college + same branch | `?college=GEU&branch=CSE` |
| My College | Same college, all branches | `?college=GEU` |
| Everyone | All colleges | *(no college filter)* |

Each tab also supports sort sub-tabs (Latest / Trending / Following) when in "Everyone" scope. The feed API endpoint is public — `userId` is extracted from JWT when present.

### Token security

Access tokens live **only in memory** (a module-level variable in `axiosInstance.ts`). They are never written to localStorage or sessionStorage, eliminating the primary XSS token-theft vector.

The long-lived refresh token is stored in an **httpOnly, SameSite=Lax cookie** scoped to `/api/auth/refresh`. JavaScript cannot read it; the browser attaches it automatically only to refresh requests.

---

## Backend Architecture

### Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| Fastify | 5 | HTTP framework (2–3× faster than Express, built-in schema) |
| TypeScript | 5 | Strict typing across all modules |
| Prisma | 7 | Type-safe ORM with `@prisma/adapter-pg` (native PG driver) |
| PostgreSQL | 15+ | Primary relational database |
| Redis | 7 | Presence, pub/sub for Socket.IO scaling, BullMQ backend |
| Socket.IO | 4 | Real-time bidirectional events (notifications + chat) |
| BullMQ | 5 | Distributed job queues (notification fan-out, email delivery) |
| Zod | 3 | Request body + query validation (consistent with client) |
| @fastify/jwt | — | Signed JWT with typed payload, `jwtVerify()` preHandler |
| @fastify/cookie | — | Secure httpOnly cookie management for refresh tokens |
| @fastify/helmet | — | 15+ security headers (HSTS, CSP, X-Frame…) |
| @fastify/rate-limit | — | Per-IP throttling, configurable per route |
| @fastify/multipart | — | Multipart form data for file uploads |
| Cloudinary | — | CDN file storage (images, PDFs, videos) |
| bcryptjs | — | Password hashing (12 rounds default) |

### Folder structure

```
server/src/
├── config/
│   ├── env.ts        # Zod-validated env — process exits with clear error if vars missing
│   ├── prisma.ts     # PrismaPg adapter singleton (global for hot-reload safety)
│   ├── logger.ts     # Pino config (pretty in dev, JSON in prod)
│   ├── socket.ts     # Socket.IO server init + namespace setup
│   ├── redis.ts      # ioredis client singleton
│   └── queues/       # BullMQ queue + worker definitions
│       ├── notification.queue.ts
│       └── email.queue.ts
│
├── lib/
│   ├── password.ts   # hashPassword, comparePassword
│   ├── token.ts      # generateRefreshToken (40-byte opaque hex)
│   ├── response.ts   # sendSuccess, sendError, sendPaginated — API envelope helpers
│   ├── pagination.ts # parsePagination, toPaginatedResult, toSkipTake
│   └── sanitize.ts   # stripHtml — applied to bio/name before DB write
│
├── middlewares/
│   ├── auth.hooks.ts     # authenticate preHandler + requireRole factory
│   └── error.handler.ts  # Centralised Fastify error handler (ZodError → 400)
│
├── modules/           # 15 self-contained feature modules
│   └── [feature]/
│       ├── [feature].schemas.ts    # Zod schemas, inferred TypeScript types
│       ├── [feature].repository.ts # DB queries only — no business logic
│       ├── [feature].service.ts    # Business logic, validation, orchestration
│       ├── [feature].controller.ts # HTTP: parse → call service → set cookies → respond
│       └── [feature].routes.ts     # Fastify plugin — registers routes + hooks
│
├── test/
│   ├── helpers/
│   │   ├── auth.ts       # signTestToken, TEST_USER fixture
│   │   └── factories.ts  # makeUser, makePost, makeLostFoundItem, makeRefreshToken
│   └── setup.ts          # Vitest global setup
│
├── workers/
│   ├── notification.worker.ts  # BullMQ worker — fan-out notifications via Socket.IO
│   └── email.worker.ts         # BullMQ worker — transactional email delivery
│
├── app.ts             # createApp() factory — used by both server.ts and tests
└── server.ts          # Entry point: calls createApp(), starts server, handles SIGTERM
```

### Module pattern

Every feature follows the same four-layer pattern:

```
HTTP Request
    │
    ▼  [feature].routes.ts     ← Fastify plugin, registers routes, attaches preHandlers
    │
    ▼  [feature].controller.ts ← Parse body/params/query, call service, send response
    │
    ▼  [feature].service.ts    ← Business rules (auth checks, domain invariants)
    │
    ▼  [feature].repository.ts ← Prisma queries — pure DB access, no business logic
    │
    ▼  prisma.ts               ← Prisma client → PostgreSQL
```

This separation means:
- Tests can import the service or repository in isolation
- Route tests use `app.inject()` without binding a port
- Controllers have no logic — they are pure adapters between HTTP and the service layer

### Authentication flow (server)

```
Register / Login
├── Validate body (Zod schema)
├── Hash password / verify password hash (bcrypt)
├── Sign JWT: { sub: userId, email, role } — 15m expiry
├── Generate opaque refresh token → persist in DB with 7d expiry
├── Set cookie: httpOnly, SameSite=Lax, path=/api/auth/refresh
└── Return { accessToken, user } in response body

POST /api/auth/refresh
├── Read refresh token from httpOnly cookie
├── Find token in DB, check expiresAt
├── Atomic rotation: DELETE old row, INSERT new row (in one transaction)
├── Sign new JWT
├── Set new httpOnly cookie
└── Return { accessToken, user }

GET /api/auth/me  (protected)
├── authenticate preHandler → fastify.jwtVerify()
├── Look up user by request.user.sub
└── Return safe user (password field excluded)

POST /api/auth/logout
├── Read refresh token from cookie
├── Delete from DB (server-side revocation)
└── Clear cookie with expired maxAge
```

### Real-time architecture

```
Client                     Server (Socket.IO)          Redis
  │                              │                       │
  │──── connect ────────────────►│                       │
  │     (with Bearer token)      │──── auth middleware ──►│
  │                              │                       │
  │◄──── join user room ─────────│  users:{userId}       │
  │◄──── join convo rooms ───────│  conv:{id}            │
  │                              │                       │
  │──── sendMessage ────────────►│                       │
  │                              │──── publish ─────────►│ (pub/sub)
  │                              │◄──── subscribe ───────│
  │◄──── newMessage ─────────────│  (all server nodes)   │
  │                              │                       │
  │                              │──── BullMQ job ───────►│ (queue)
  │                              │◄──── worker runs ──────│
  │◄──── notification ───────────│                       │
```

Socket.IO namespaces:
- `/notifications` — follow, reaction, comment notifications
- `/chat` — conversation messages, typing indicators, read receipts

Redis is used for:
- Socket.IO adapter (`@socket.io/redis-adapter`) for horizontal scaling
- User presence tracking (`SET users:{id}:online 1 EX 60`)
- BullMQ job queue storage

---

## API Response Standard

All endpoints return a consistent JSON envelope:

```typescript
// Success
{ "success": true, "data": T }

// Paginated success
{ "success": true, "data": { "items": T[], "total": number, "page": number, "limit": number, "hasMore": boolean } }

// Error
{ "success": false, "error": { "message": string } }
```

HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success (GET, action) |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Authenticated but insufficient permission |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

---

## Database design rationale

PostgreSQL was chosen over MongoDB for Studium's specific requirements:

| Requirement | Why relational beats document |
|-------------|------------------------------|
| One vote per user per post | `UNIQUE(userId, postId, type)` at DB level — no app-layer enforcement needed |
| No duplicate follows | `UNIQUE(followerId, followingId)` — constraint prevents double-follow even under race conditions |
| Refresh token rotation | Atomic `DELETE` + `INSERT` in one transaction — ACID guarantees |
| Feed queries | JOIN across posts + reactions + authors + tags — indexed JOINs at scale |
| Role-based access | Enum column + `@@index([role])` — efficient permission filtering |
| Conversation membership | `UNIQUE(conversationId, userId)` — prevents double-join |

---

## Scalability notes

- **Stateless auth**: Access tokens are JWTs — no session store. The API can scale horizontally behind a load balancer.
- **Refresh tokens in DB**: Enables full revocation (logout all devices, ban user, rotation anomaly detection).
- **Socket.IO Redis adapter**: Pub/sub lets multiple Node processes share real-time events without sticky sessions.
- **BullMQ workers**: Notification fan-out and email delivery run in separate processes, keeping request latency low.
- **Prisma connection pooling**: One pool per Node process; use PgBouncer in production for connection management before PostgreSQL.
- **Feature module isolation**: Each module is self-contained — adding or removing a feature does not touch other modules.
