# Architecture — Studium (Phase 3)

> Last updated: Phase 3 — Users module, follow system, RBAC middleware, Prisma 7, security hardening

---

## Overview

Studium is a full-stack web application with a strict TypeScript codebase across both the React frontend and Fastify backend. The architecture is designed around a module-per-feature pattern on the server and a feature-sliced structure on the client, both of which scale gracefully as new capabilities are added.

```
Browser (React SPA)
       │
       │  HTTPS / REST (JSON)
       │  Cookie (httpOnly refresh token)
       ▼
Fastify API Server (Node.js)
       │
       │  Prisma Client
       ▼
PostgreSQL
```

---

## Frontend Architecture

### Tech choices

| Tool | Reason |
|------|--------|
| React 19 + TypeScript | Strong ecosystem, concurrent features |
| Vite 7 | Fast HMR, native ESM, excellent TypeScript support |
| TailwindCSS v4 | Utility-first, collocated styles, zero dead CSS |
| TanStack Query v5 | Declarative data fetching, caching, background sync |
| React Hook Form + Zod | Performant forms, shared validation schemas |
| shadcn/ui (Radix) | Accessible headless primitives + Tailwind integration |
| Axios | Automatic token injection + transparent refresh interceptor |

### Folder structure

```
client/src/
├── api/               # Per-feature typed API functions (no raw axios here)
├── components/
│   ├── ui/            # shadcn/ui primitives — never modified after generation
│   └── auth/          # App-specific shared components
├── context/           # React Context providers (AuthContext)
├── features/          # (Phase 4+) self-contained feature modules
│   └── feed/          # e.g. components/, hooks/, api/ all co-located
├── hooks/             # App-wide custom hooks
├── lib/
│   ├── queryClient.ts # TanStack Query client singleton
│   ├── utils.ts       # cn() helper
│   └── validators/    # Zod schemas (shared between forms and API layer)
├── pages/             # Route-level components — thin, delegate to features
├── routes/            # Route guards (PrivateRoute)
├── types/             # Shared TypeScript interfaces
└── utils/             # axiosInstance + token injection
```

### Authentication flow (client)

```
1. App mounts → AuthContext.useEffect fires
2. POST /api/auth/refresh (httpOnly cookie sent automatically)
   ├── Success → injectToken(accessToken), setUser(user), loading=false
   └── Failure → injectToken(null), loading=false (unauthenticated)
3. PrivateRoute checks loading + user
   ├── loading=true → show spinner (prevents flash redirect)
   ├── user exists → render protected page
   └── user=null → <Navigate to="/login" />
4. On login/register → accessToken stored in module-level variable (not localStorage)
5. All requests attach Bearer token via axios request interceptor
6. On 401 → interceptor calls /api/auth/refresh, retries original request
7. If refresh fails → clear token, redirect to /login
```

### Token security design

Access tokens are stored **in memory only** (a module-level variable in `axiosInstance.ts`). They are never written to localStorage or sessionStorage. This eliminates the primary XSS token-theft vector.

The long-lived refresh token is stored in an **httpOnly, SameSite=Lax cookie** scoped to `/api/auth`. JavaScript cannot read it; the browser attaches it automatically to refresh requests.

---

## Backend Architecture

### Tech choices

| Tool | Reason |
|------|--------|
| Fastify 4 + TypeScript | 2–3× faster than Express, built-in schema validation, typed plugins |
| Prisma 5 | Type-safe ORM, auto-generated client, excellent migration tooling |
| PostgreSQL 15 | Relational integrity (votes, follows), compound unique constraints, JSONB |
| Zod | Consistent validation with the frontend, typed parse results |
| @fastify/jwt | Signed JWT with typed payload, integrated verify hook |
| @fastify/cookie | Secure httpOnly cookie management for refresh tokens |
| @fastify/helmet | Security headers (HSTS, CSP, X-Frame, etc.) |
| @fastify/rate-limit | Per-IP request throttling, configurable per route |
| bcryptjs | Battle-tested password hashing (12 rounds) |

### Folder structure

```
server/src/
├── config/
│   ├── env.ts         # Zod-validated environment — fails fast at startup
│   ├── prisma.ts      # Prisma client + adapter singleton (global for hot-reload safety)
│   └── logger.ts      # Pino logger config (pretty in dev, JSON in prod)
├── lib/
│   ├── password.ts    # hashPassword, comparePassword
│   ├── token.ts       # generateRefreshToken (opaque random bytes)
│   ├── response.ts    # sendSuccess, sendError, sendPaginated — standardised API envelope
│   ├── pagination.ts  # parsePagination, toPaginatedResult, toSkipTake helpers
│   └── sanitize.ts    # stripHtml — applied to bio/name before DB write
├── middlewares/
│   ├── auth.hooks.ts    # authenticate + requireRole factory — importable preHandler hooks
│   └── error.handler.ts # Centralised Fastify error handler
├── modules/           # Feature modules — self-contained
│   ├── auth/
│   │   ├── auth.schemas.ts    # Zod schemas + inferred types
│   │   ├── auth.service.ts    # Business logic + DB access
│   │   ├── auth.controller.ts # HTTP layer — parse, delegate, respond
│   │   └── auth.routes.ts     # Fastify plugin — registers routes with per-route rate limits
│   └── users/
│       ├── users.schemas.ts    # Zod schemas for profile update, list query, ID param
│       ├── users.repository.ts # DB queries only — no business logic
│       ├── users.service.ts    # Business logic — follow validation, pagination
│       ├── users.controller.ts # HTTP layer — parse, delegate, respond, error mapping
│       └── users.routes.ts     # Fastify plugin — public + authenticated routes
├── types/
│   └── index.ts       # JwtPayload, SafeUser + @fastify/jwt module augmentation
├── app.ts             # Fastify app factory (testable without starting server)
└── server.ts          # Entry point — starts server, handles signals

server/prisma.config.ts   # Prisma CLI config (datasource URL for migrate/db push)
server/prisma/
└── schema.prisma         # Database schema (no URL — managed by prisma.config.ts)
```

### Module pattern

Each feature is a **self-contained module** with its own schemas, service, controller, and routes. The controller is responsible only for HTTP concerns (parsing, responding, setting cookies). Business logic and DB access live in the service. This separation makes testing straightforward.

```
Request
  │
  ▼ auth.routes.ts       ← Fastify plugin, registers routes, applies hooks
  │
  ▼ auth.controller.ts   ← Parse body, call service, set cookies, respond
  │
  ▼ auth.service.ts      ← Business rules, DB queries via Prisma
  │
  ▼ prisma.ts            ← Prisma client → PostgreSQL
```

### Authentication flow (server)

```
Register/Login
├── Validate body (Zod)
├── Create/verify user in DB
├── Sign JWT (15m expiry) with { sub, email, role }
├── Generate opaque refresh token → store in DB with 7d expiry
├── Set refresh token as httpOnly cookie (scoped to /api/auth)
└── Return { accessToken, user } in response body

/auth/refresh
├── Read refresh token from cookie
├── Find in DB, check expiry
├── Atomic rotation: delete old, create new token in DB
├── Sign new JWT
├── Set new refresh token cookie
└── Return { accessToken, user }

/auth/me  (protected)
├── fastify.authenticate hook → request.jwtVerify()
├── Look up user by request.user.sub
└── Return safe user object (no password)

/auth/logout
├── Read refresh token from cookie
├── Delete from DB (server-side revocation)
└── Clear cookie
```

### Environment validation

The server validates all required environment variables at startup using Zod. Missing or invalid variables cause an immediate process exit with a clear error message before any connections are established. This prevents silent misconfigurations in production.

---

## Database Design (Phase 2)

Phase 2 includes only the auth-relevant tables. Further entities are added per phase.

### Current schema

```
User
├── id          cuid (PK)
├── email       unique
├── name        varchar(50)
├── password    bcrypt hash (never returned in APIs)
├── rollNumber  unique, nullable
├── college     nullable
├── branch      nullable
├── year        int, nullable
├── bio         text, nullable
├── avatarUrl   nullable
├── role        enum(STUDENT, ALUMNI, MODERATOR, ADMIN)
├── links       JSONB { github?, linkedin?, portfolio? }
└── timestamps

RefreshToken
├── id          cuid (PK)
├── token       unique (random 40-byte hex)
├── userId      FK → User.id (CASCADE DELETE)
├── expiresAt   datetime
└── createdAt
```

### Why PostgreSQL over MongoDB

The Studium data model has strong relational requirements that benefit from PostgreSQL:

- **Votes**: `UNIQUE(userId, postId)` — one vote per user per post, enforced at DB level
- **Follows**: `UNIQUE(followerId, followingId)` — no duplicate follow relationships
- **Memberships**: `UNIQUE(groupId, userId)` with role — roles enforced at constraint level
- **Feed queries**: JOIN-heavy (posts + votes + authors + groups) — PostgreSQL index joins outperform MongoDB lookups at scale
- **Transactions**: Atomic refresh token rotation (delete old + create new) requires ACID guarantees

---

## API Response Standard

All API endpoints return a consistent envelope:

```typescript
// Success
{ "success": true, "data": <T> }

// Error
{ "success": false, "error": { "message": string } }
```

HTTP status codes are used correctly:
- `200` GET success / action success
- `201` Resource created
- `400` Validation error (client mistake)
- `401` Unauthenticated
- `403` Unauthorized (authenticated but insufficient role)
- `404` Resource not found
- `409` Conflict (duplicate email, etc.)
- `429` Rate limit exceeded
- `500` Unexpected server error

---

## Security Decisions

| Decision | Rationale |
|----------|-----------|
| Access token in memory (not localStorage) | Eliminates XSS token theft |
| Refresh token as httpOnly cookie | JavaScript cannot read it; auto-sent by browser |
| Refresh token scoped to `/api/auth` path | Cookie not sent on unrelated API calls |
| Refresh token rotation | Stolen token immediately invalidated on next legitimate use |
| CORS restricted to `CORS_ORIGIN` env var | Blocks cross-origin requests from unknown domains |
| Helmet on all responses | 15+ security headers (HSTS, CSP, no-sniff, frameguard) |
| Rate limiting (120 req/min global) | Protects against brute-force and DoS |
| `bcrypt` with 12 rounds | Strong enough to slow brute-force; fast enough for auth endpoints |
| Environment validation at startup | Prevents silent misconfiguration |

---

## Scalability Notes

- **Stateless auth**: Access tokens are JWTs — no server-side session store needed. The server can scale horizontally without sticky sessions.
- **Refresh token in DB**: Enables revocation (logout all devices, ban user) and detection of token theft via rotation anomalies.
- **Prisma connection pooling**: The global singleton pattern ensures one connection pool per Node.js process. In production, use PgBouncer for connection pooling before PostgreSQL.
- **Module-per-feature structure**: Adding a new feature (posts, groups, etc.) is a self-contained addition. No existing modules are touched.
- **TanStack Query**: Server state is cached and invalidated declaratively. Background refetching, pagination, and optimistic updates can be added per-query without global refactoring.

---

## Phase 3 Additions (Completed)

- `server/src/modules/users/` — profile CRUD, follow/unfollow, follower/following lists
- `server/src/middlewares/auth.hooks.ts` — importable `authenticate` + `requireRole` factory
- `server/src/lib/pagination.ts` — offset pagination helpers (parsePagination, toPaginatedResult, toSkipTake)
- `server/src/lib/sanitize.ts` — HTML stripping before DB writes
- Prisma 7 migration — `prisma.config.ts` with `PrismaPg` adapter, removed URL from schema.prisma
- Per-route rate limiting on auth mutation endpoints (10 req/min)
- `client/src/api/users.ts` — typed client functions for all users endpoints
- `client/src/types/index.ts` — `UserProfile`, `PaginatedData`, `UserLinks`, fixed `Role` enum

## Phase 4 Planned Additions

- `server/src/modules/posts/` — feed, CRUD, votes, comments
- `server/src/modules/resources/` — file uploads (Cloudinary)
- `server/src/modules/groups/` — group management, memberships
- `server/src/modules/notifications/` — notification persistence
- Email service integration (Resend or Nodemailer)
- Request ID tracing for observability
