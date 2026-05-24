# Development Workflow — Studium

---

## Local setup

```bash
# 1. Install dependencies
npm install --prefix client
npm install --prefix server

# 2. Configure server env
cp server/.env.example server/.env
# Fill in DATABASE_URL, JWT_SECRET, REDIS_URL, CLOUDINARY_* vars

# 3. Set up database
cd server
npx prisma migrate deploy
npx prisma generate

# 4. Start everything
cd ..
npm run dev
# Client → http://localhost:5173
# Server → http://localhost:5000
# Health → http://localhost:5000/health
```

### Docker quick-start (database + Redis only)

```bash
docker run -d --name studium-pg  -p 5432:5432 -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=studium postgres:15
docker run -d --name studium-redis -p 6379:6379 redis:7
```

---

## Development scripts

| Command (from root) | What it does |
|--------------------|-------------|
| `npm run dev` | Start client (Vite) + server (tsx watch) concurrently |
| `npm test` | Run server tests, then client tests |
| `npm run typecheck` | `tsc --noEmit` on both sides |
| `npm run lint` | ESLint both sides |
| `npm run e2e` | Run Playwright end-to-end suite |
| `npm run e2e:ui` | Playwright with interactive UI |

| Command (from `server/`) | What it does |
|--------------------------|-------------|
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | `tsc` → `dist/` |
| `npm test` | `vitest run` (58 tests) |
| `npm run test:watch` | `vitest` in watch mode |
| `npm run test:coverage` | Coverage report (threshold: 50% lines/functions) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (prototyping — no migration file) |
| `npm run db:studio` | Prisma Studio visual browser |
| `npm run db:seed` | Run `prisma/seed.ts` |

| Command (from `client/`) | What it does |
|--------------------------|-------------|
| `npm run dev` | `vite` |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` (29 tests) |
| `npm run test:coverage` | Coverage report (threshold: 40% lines/functions) |

---

## Git workflow

```
main ← production-ready branch
  └── feature/<name>    feature branches
  └── fix/<name>        bug fixes
  └── test/<name>       test/infra-only changes
```

Commit message convention:
```
feat(module): what was added
fix(module): what was fixed
test(scope): what was tested
docs: what was documented
chore: tooling / config / deps
```

CI runs on every push to `main` and every PR.

---

## Adding a new module

1. Create `server/src/modules/<name>/` with four files:
   - `<name>.schemas.ts` — Zod schemas for request body, query params, params
   - `<name>.repository.ts` — Prisma queries (no logic)
   - `<name>.service.ts` — business logic
   - `<name>.controller.ts` — HTTP adapter
   - `<name>.routes.ts` — Fastify plugin

2. Register routes in `server/src/app.ts`:
   ```typescript
   import { myRoutes } from './modules/mymodule/mymodule.routes.js'
   await app.register(myRoutes, { prefix: '/api/mymodule' })
   ```

3. Add Prisma model if needed:
   ```bash
   cd server && npx prisma migrate dev --name add_mymodel
   ```

4. Add client API file at `client/src/api/<name>.ts`

5. Add tests at `server/src/modules/<name>/__tests__/<name>.routes.test.ts`

---

## Request lifecycle

```
HTTP Request
    │
    ▼ Fastify plugin: CORS check, rate limit check, Helmet headers applied
    │
    ▼ Route preHandler: authenticate() → jwtVerify() → populates request.user
    │
    ▼ Controller: parse + validate body/params/query with Zod
    │    ├── ZodError → 400 (caught by global error handler)
    │    └── Pass typed objects to service
    │
    ▼ Service: business rules
    │    ├── AuthError(403) → Forbidden
    │    ├── NotFoundError(404) → Not found
    │    ├── ConflictError(409) → Duplicate
    │    └── Call repository
    │
    ▼ Repository: Prisma query → PostgreSQL
    │
    ▼ Controller: sendSuccess(reply, data) or sendError(reply, status, message)
    │
    └── Response: { "success": true, "data": ... }
```

---

## Testing workflow

See [TESTING.md](TESTING.md) for the full guide.

Quick commands:
```bash
# All tests
npm test              # from root — runs server then client

# Server only
cd server && npm test

# Client only
cd client && npm test

# Watch mode
cd server && npm run test:watch
cd client && npm run test:watch

# Coverage
cd server && npm run test:coverage
cd client && npm run test:coverage
```

Test file locations:
- `server/src/modules/<name>/__tests__/<name>.routes.test.ts` — route integration tests
- `server/src/modules/<name>/__tests__/<name>.service.test.ts` — service unit tests
- `client/src/features/<name>/__tests__/<Component>.test.tsx` — component tests
- `client/src/hooks/__tests__/<hook>.test.tsx` — hook tests
- `client/src/pages/__tests__/<Page>.test.tsx` — page tests
- `e2e/<flow>.spec.ts` — Playwright end-to-end tests

---

## CI/CD pipeline

Defined in `.github/workflows/ci.yml`. Three jobs run on every push and PR:

| Job | Triggers | Steps |
|-----|----------|-------|
| `server` | Always | Install → migrate (test DB) → lint → typecheck → test → build |
| `client` | Always | Install → lint → typecheck → test → build |
| `e2e` | PR with `e2e` label | Install → playwright install → start server → run e2e |

The server job spins up a PostgreSQL service container and runs `prisma migrate deploy` before tests. No test hits a real database — Prisma is fully mocked via `vi.mock('../../../config/prisma.js', factory)`.

---

## Environment variables reference

See [readme.md](../readme.md#environment-variables) for the full list.

For tests, environment variables are set in `server/vitest.config.ts` under `test.env`. No `.env` file is needed to run tests.
