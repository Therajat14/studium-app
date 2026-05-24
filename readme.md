# Studium

> "Notion + Reddit + LinkedIn — for your college."

A full-stack student ecosystem platform combining community feed, knowledge sharing, Q&A, messaging, campus life, lost & found, and opportunities — all scoped to your college and branch.

---

## Current Status

| Layer | Status |
|-------|--------|
| Auth (register, login, refresh rotation, logout) | ✅ |
| User profiles, follow system | ✅ |
| Posts, feed (college/branch-scoped), reactions, comments, bookmarks | ✅ |
| Lost & Found (create, claim, resolve, image upload) | ✅ |
| Knowledge Hub (resources, ratings, bookmarks, downloads) | ✅ |
| Q&A (questions, answers, voting, accept answer) | ✅ |
| Opportunities (jobs, internships, hackathons, events) | ✅ |
| Campus Reviews (faculty, food, transport, facilities) | ✅ |
| Messaging (1-to-1 and group conversations) | ✅ |
| Notifications (follow, reaction, comment) | ✅ |
| File uploads (Cloudinary — images, PDFs, videos) | ✅ |
| Real-time (Socket.IO, Redis pub/sub, presence) | ✅ |
| Background jobs (BullMQ — notification fan-out, email) | ✅ |
| Testing (87 unit + integration tests, CI/CD) | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, TailwindCSS v4 |
| Data fetching | TanStack Query v5 (infinite scroll, optimistic updates) |
| Forms | React Hook Form + Zod |
| Backend | Fastify 5, TypeScript, Node.js 20 |
| Database | PostgreSQL 15+ via Prisma 7 (`@prisma/adapter-pg`) |
| Cache / Pub-Sub | Redis 7 (presence, socket scaling, queue backend) |
| Real-time | Socket.IO 4 (namespaces: `/notifications`, `/chat`) |
| Job queues | BullMQ (notification fan-out, email delivery) |
| Auth | JWT access token (memory-only) + httpOnly cookie refresh token |
| File storage | Cloudinary (images, PDFs, videos) |
| Security | Helmet, rate limiting (120/min global, 10/min auth), bcrypt |
| Testing | Vitest (server + client), RTL, MSW v2, Playwright |
| CI/CD | GitHub Actions (server → client → E2E pipeline) |

---

## Project Structure

```
studium-app/
├── client/                    # React SPA
│   ├── src/
│   │   ├── api/               # Typed axios wrappers per feature
│   │   ├── components/        # ui/ (shadcn) + shared components
│   │   ├── context/           # AuthContext (token + user state)
│   │   ├── features/          # Feature modules (feed/, posts/, chat/, notifications/)
│   │   ├── hooks/             # useAuth, useFeed, usePosts, useReactions, …
│   │   ├── pages/             # Route-level components
│   │   ├── routes/            # PrivateRoute guard
│   │   ├── test/              # MSW handlers, RTL helpers, setup
│   │   ├── types/             # Shared TypeScript interfaces
│   │   └── utils/             # axiosInstance + interceptors
│   └── vitest.config.ts
│
├── server/                    # Fastify API
│   ├── src/
│   │   ├── config/            # env (Zod), prisma client, logger, socket, redis, queues
│   │   ├── lib/               # password, token, response, pagination, sanitize
│   │   ├── middlewares/       # auth.hooks, error.handler
│   │   ├── modules/           # One directory per feature (15 modules)
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── feed/
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   ├── reactions/
│   │   │   ├── tags/
│   │   │   ├── notifications/
│   │   │   ├── messaging/
│   │   │   ├── knowledge/
│   │   │   ├── qna/
│   │   │   ├── opportunities/
│   │   │   ├── campus/
│   │   │   ├── lostfound/
│   │   │   └── upload/
│   │   ├── test/              # Vitest helpers (factories, JWT signer, setup)
│   │   ├── workers/           # BullMQ notification + email workers
│   │   ├── app.ts             # Fastify factory (used by tests and server)
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma
│   └── vitest.config.ts
│
├── e2e/                       # Playwright end-to-end tests
├── .github/workflows/ci.yml  # CI pipeline
├── docs/                      # Architecture and API documentation
├── docs/TESTING.md            # Test strategy and quick-start guide
└── package.json               # Root — runs both client + server scripts
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or Docker)
- Redis 7+ (local or Docker)
- Cloudinary account (free tier is sufficient)

### 1. Install

```bash
git clone https://github.com/Therajat14/studium-app.git
cd studium-app
npm install --prefix client
npm install --prefix server
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your values (see Environment Variables below)
```

### 3. Database setup

```bash
cd server
npx prisma migrate deploy   # Run all migrations
npx prisma generate         # Generate Prisma client
```

### 4. Run in development

```bash
# From root — starts both client and server concurrently
npm run dev

# Client → http://localhost:5173
# Server → http://localhost:5000
# Health → http://localhost:5000/health
```

---

## Scripts

```bash
# Root
npm run dev            # Start client + server concurrently
npm test               # Run server tests, then client tests
npm run typecheck      # tsc --noEmit on both sides
npm run lint           # ESLint both sides
npm run e2e            # Playwright end-to-end suite

# Server  (cd server)
npm run dev            # tsx watch src/server.ts
npm run build          # tsc → dist/
npm test               # vitest run
npm run test:coverage  # vitest run --coverage
npm run db:migrate     # prisma migrate dev
npm run db:studio      # Open Prisma Studio

# Client  (cd client)
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build
npm test               # vitest run
npm run test:coverage  # vitest run --coverage
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Min 32 chars — `openssl rand -base64 32` |
| `REDIS_URL` | ✅ | — | `redis://localhost:6379` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | — | Cloudinary account name |
| `CLOUDINARY_API_KEY` | ✅ | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | — | Cloudinary API secret |
| `PORT` | — | `5000` | HTTP listen port |
| `JWT_ACCESS_EXPIRY` | — | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | — | `7d` | Refresh token lifetime |
| `BCRYPT_SALT_ROUNDS` | — | `12` | bcrypt cost factor |
| `CORS_ORIGIN` | — | `http://localhost:5173` | Allowed CORS origin |
| `UPLOAD_MAX_IMAGE_BYTES` | — | `10485760` | Max image size (10 MB) |
| `UPLOAD_MAX_VIDEO_BYTES` | — | `104857600` | Max video size (100 MB) |

### Client (`client/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | — | `http://localhost:5000/api` | API base URL |
| `VITE_SOCKET_URL` | — | `http://localhost:5000` | Socket.IO server URL |

---

## API Overview

Base URL: `http://localhost:5000/api`

All responses use a consistent envelope:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "message": "..." } }
```

| Prefix | Module | Auth |
|--------|--------|------|
| `GET /health` | — | Public |
| `/api/auth/*` | Authentication | Mixed |
| `/api/users/*` | Profiles + follows | Mixed |
| `/api/feed` | Scoped feed | Public |
| `/api/posts/*` | Posts + bookmarks | Mixed |
| `/api/posts/:id/comments` | Comments | Mixed |
| `/api/posts/:id/reactions` | Post reactions | Bearer |
| `/api/comments/:id/reactions` | Comment reactions | Bearer |
| `/api/tags/*` | Tag browsing | Public |
| `/api/notifications/*` | Notifications | Bearer |
| `/api/messages/*` | Conversations + DMs | Bearer |
| `/api/knowledge/*` | Knowledge Hub | Bearer |
| `/api/qna/*` | Q&A board | Bearer |
| `/api/opportunities/*` | Jobs + events | Bearer |
| `/api/campus/*` | Campus reviews | Bearer |
| `/api/lostfound/*` | Lost & Found | Bearer |
| `/api/upload` | File upload (Cloudinary) | Bearer |

See [`docs/API.md`](docs/API.md) for the complete endpoint reference.

---

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system design, auth flow, real-time architecture, and module patterns.

## Testing

See [`docs/TESTING.md`](docs/TESTING.md) for the full test strategy, running tests, coverage targets, and CI/CD pipeline.

## Database

See [`docs/DATABASE.md`](docs/DATABASE.md) for the full schema with all 30+ models.

## Security

See [`docs/SECURITY.md`](docs/SECURITY.md) for security decisions and rationale.
