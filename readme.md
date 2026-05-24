# Studium

> "Notion + Reddit + LinkedIn — for your college."

A student ecosystem platform combining knowledge sharing, community discussions, mentorship, networking, resource sharing, and project collaboration.

---

## Current Status: Phase 2 Complete

- ✅ **Authentication** — register, login, refresh token rotation, logout
- ✅ **TypeScript** — strict end-to-end (both client and server)
- ✅ **Fastify backend** — modular plugin architecture
- ✅ **PostgreSQL + Prisma** — relational schema, migrations
- ✅ **React Query + React Hook Form + Zod** — typed data fetching and forms
- 🚧 **Dashboard features** — coming in Phase 4

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4 |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| UI components | shadcn/ui (Radix + Tailwind) |
| Backend | Fastify 4, TypeScript, Node.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access token) + httpOnly cookie (refresh token) |
| Security | Helmet, rate limiting, bcrypt (12 rounds) |

---

## Project Structure

```
studium-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui primitives
│   │   │   └── auth/       # Auth-specific components
│   │   ├── context/        # AuthContext
│   │   ├── features/       # (Phase 4+) Feature modules
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utils, validators, QueryClient
│   │   ├── pages/          # Route-level pages
│   │   ├── routes/         # Route guards
│   │   ├── types/          # Shared TypeScript types
│   │   └── utils/          # axiosInstance
│   └── ...
│
├── server/                 # Fastify backend
│   ├── src/
│   │   ├── config/         # env validation, Prisma client, logger
│   │   ├── lib/            # password, token, response helpers
│   │   ├── middlewares/    # error handler
│   │   ├── modules/
│   │   │   └── auth/       # routes, controller, service, schemas
│   │   ├── types/          # Shared TypeScript types + module augmentation
│   │   ├── app.ts          # Fastify app factory
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── ...
│
└── docs/                   # Architecture docs
```

---

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (running locally or via Docker)

### 1. Clone and install

```bash
git clone <repo>
cd studium-app
npm install          # installs root devDeps (concurrently)
npm run install:all  # installs client + server dependencies
```

### 2. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env — set DATABASE_URL and JWT_SECRET

# Client (optional — defaults to localhost:5000)
cp client/.env.example client/.env
```

### 3. Set up database

```bash
# Create the database, run migrations, generate Prisma client
npm run db:migrate
```

### 4. Run in development

```bash
npm run dev
# Client → http://localhost:5173
# Server → http://localhost:5000
# Health check → http://localhost:5000/health
```

---

## API

Base URL: `http://localhost:5000/api`

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "..." } }
```

### Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Create account |
| `POST` | `/auth/login` | — | Sign in |
| `POST` | `/auth/refresh` | cookie | Rotate refresh token, get new access token |
| `GET` | `/auth/me` | Bearer | Get current user |
| `POST` | `/auth/logout` | — | Revoke refresh token |

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32 chars — use `openssl rand -base64 32` |
| `PORT` | — | Defaults to `5000` |
| `JWT_ACCESS_EXPIRY` | — | Defaults to `15m` |
| `JWT_REFRESH_EXPIRY` | — | Defaults to `7d` |
| `BCRYPT_SALT_ROUNDS` | — | Defaults to `12` |
| `CORS_ORIGIN` | — | Defaults to `http://localhost:5173` |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | — | Defaults to `http://localhost:5000/api` |

---

## Development Scripts

```bash
npm run dev              # Start both client and server
npm run typecheck        # Run tsc --noEmit on both sides
npm run lint             # ESLint both sides
npm run db:migrate       # Run Prisma migrations
npm run db:studio        # Open Prisma Studio (DB GUI)
```

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Repository analysis, architecture planning |
| 2 | ✅ | TypeScript migration, Fastify backend, auth system |
| 3 | 🔜 | Complete backend APIs, additional security hardening |
| 4 | 🔜 | Posts, feed, profiles, resources, groups |
| 5 | 🔜 | Real-time (Socket.IO), notifications, messaging |
| 6 | 🔜 | Tests, search, CI/CD, deployment |

See [`docs/roadmap.md`](docs/roadmap.md) for detailed feature plans.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for coding standards, git workflow, and conventions.
