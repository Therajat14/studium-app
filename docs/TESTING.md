# Testing Guide — Studium Platform

## Overview

The Studium platform uses a three-tier testing strategy:

| Tier | Tool | Scope | Speed |
|------|------|-------|-------|
| Unit + Integration | Vitest | Services, routes, components, hooks | Fast (mocked deps) |
| E2E | Playwright | Full browser flows | Slow (real stack) |
| CI/CD | GitHub Actions | Lint + typecheck + tests + build | Automated |

---

## Quick Start

```bash
# Server tests (unit + route integration)
cd server && npx vitest run

# Server tests with coverage
cd server && npx vitest run --coverage

# Client tests (components + hooks)
cd client && npx vitest run

# Client tests with coverage
cd client && npx vitest run --coverage

# Watch mode (interactive)
cd server && npx vitest
cd client && npx vitest

# E2E tests (requires running app — see E2E Setup below)
npx playwright test
```

---

## Server Tests

### Location
```
server/src/modules/auth/__tests__/
server/src/modules/feed/__tests__/
server/src/modules/posts/__tests__/
server/src/modules/lostfound/__tests__/
```

### Strategy
- **Unit tests** (`auth.service.test.ts`): Test service logic in isolation. Prisma, password hashing, and token generation are all mocked with `vi.mock()`.
- **Route integration tests** (`*.routes.test.ts`): Use Fastify's built-in `app.inject()` to send HTTP requests without binding to a port. Prisma is mocked — no database needed.

### Mocking Prisma
Each test file that touches DB-connected code mocks the Prisma module:

```ts
vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    // ...
  },
  Prisma: { JsonNull: 'JsonNull', sql: vi.fn() },
}))
```

Mock return values are set per test using `mockResolvedValue`:

```ts
mockPrisma.user.findUnique.mockResolvedValue(makeUser())
```

### Test Helpers
```
server/src/test/helpers/auth.ts     — JWT generation for test requests
server/src/test/helpers/factories.ts — In-memory test data factories
```

### Environment
Vitest sets env vars via `test.env` in `vitest.config.ts`. No `.env` file needed for tests:
- `DATABASE_URL` — points to `studium_test` (used only in integration tests with real DB)
- `JWT_SECRET` — deterministic test secret
- `BCRYPT_SALT_ROUNDS=10` — lower rounds for faster tests

### What's Tested

| Test File | Coverage |
|-----------|----------|
| `auth.service.test.ts` | `registerUser`, `loginUser`, `rotateRefreshToken`, `AuthError` |
| `auth.routes.test.ts` | `POST /register`, `POST /login`, `GET /me`, `POST /logout`, health check |
| `feed.routes.test.ts` | `GET /feed` with sort, type, college/branch filters, auth |
| `posts.routes.test.ts` | `GET/:id`, `POST /`, `DELETE/:id`, bookmarks, ownership guards |
| `lostfound.routes.test.ts` | List, create, delete, resolve, claim — auth + RBAC |

---

## Client Tests

### Location
```
client/src/features/feed/__tests__/
client/src/pages/__tests__/
client/src/hooks/__tests__/
```

### Strategy
- **Component tests**: Render with `renderWithProviders` (QueryClient + MemoryRouter wrapper). Heavy hook dependencies are mocked with `vi.mock()`.
- **Hook tests**: Use `renderHook` from React Testing Library. API calls are intercepted by MSW.
- **No snapshot tests**: We test behaviour, not markup.

### API Mocking (MSW)
All API calls are intercepted by Mock Service Worker (MSW v2) running in Node mode:

```
client/src/test/mocks/handlers.ts  — Request handlers
client/src/test/mocks/server.ts    — MSW server setup
```

To override a handler in a specific test:

```ts
server.use(
  http.post('http://localhost:5000/api/auth/refresh', () =>
    HttpResponse.json({ success: false, error: { message: 'Expired' } }, { status: 401 })
  )
)
```

### Custom Render Helper

```tsx
import { render } from '../../test/utils.js'
// render() wraps the UI with QueryClientProvider + MemoryRouter automatically
render(<PostCard post={mockPost} />)
```

### What's Tested

| Test File | Coverage |
|-----------|----------|
| `PostCard.test.tsx` | Render, author info, type badge, reaction count, delete guard, comment toggle, truncation |
| `Login.test.tsx` | Login form, signup flow, step progression, validation errors, college dropdown |
| `useAuth.test.ts` | Session restore, loading state, null user on failure, exposed API |

---

## E2E Tests (Playwright)

### Setup

1. Install browsers:
   ```bash
   npx playwright install chromium
   ```

2. Start the full stack:
   ```bash
   # Terminal 1
   cd server && npm run dev
   # Terminal 2
   cd client && npm run dev
   ```

3. Run E2E tests:
   ```bash
   npx playwright test
   # or with UI mode:
   npx playwright test --ui
   ```

### What's Tested (without E2E_ENABLED)
- Home page loads
- `/login` route is accessible
- Login form shows validation errors
- Signup step 1 renders correctly
- Signup step 2 has college dropdown
- Protected routes redirect to `/login`

### What's Tested (with `E2E_ENABLED=1`)
Post-auth flows (requires real seeded account):
- Dashboard feed tabs (My Branch / My College / Everyone)
- Lost & Found navigation
- Knowledge Hub navigation
- Logout

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main`/`develop` and all pull requests.

### Jobs

| Job | Steps |
|-----|-------|
| `server` | Install → Migrate DB → Lint → Typecheck → **Test** → Build |
| `client` | Install → Lint → Typecheck → **Test** → Build |
| `e2e` | Runs only when PR has the `e2e` label |

### Pipeline fails on:
- ESLint errors
- TypeScript type errors
- Any failing test
- Build failure
- Prisma migration failure

---

## Coverage Expectations

| Area | Target |
|------|--------|
| Server services | ≥ 70% |
| Server routes | ≥ 60% |
| Client components | ≥ 50% |
| Client hooks | ≥ 50% |

Coverage reports are generated at:
- `server/coverage/`
- `client/coverage/`

---

## Test Database Setup (for integration tests with real DB)

If you want to run server tests against a real test database instead of mocked Prisma:

```bash
# Create the test database
createdb studium_test

# Run migrations
DATABASE_URL=postgresql://postgres:1234@localhost:5432/studium_test \
  npx prisma migrate deploy --schema server/prisma/schema.prisma
```

The vitest config in `server/vitest.config.ts` already points `DATABASE_URL` to `studium_test`.

---

## Adding New Tests

### Server route test
1. Create `server/src/modules/<feature>/__tests__/<feature>.routes.test.ts`
2. Add `vi.mock('../../../config/prisma.js', ...)` at the top
3. Use `createApp()` + `app.inject()` for HTTP assertions
4. Use factories from `src/test/helpers/factories.ts`

### Client component test
1. Create `client/src/features/<feature>/__tests__/<Component>.test.tsx`
2. Mock heavy dependencies with `vi.mock()`
3. Use `render` from `../../test/utils.js` (auto-wraps providers)
4. Add MSW handlers to `src/test/mocks/handlers.ts` if API calls are needed

---

## Running the Full QA Suite

```bash
# 1. Lint both workspaces
cd server && npm run lint
cd client && npm run lint

# 2. Typecheck both workspaces
cd server && npm run typecheck
cd client && npm run typecheck

# 3. Run all tests
cd server && npx vitest run --coverage
cd client && npx vitest run --coverage

# 4. Build both
cd server && npm run build
cd client && npm run build

# 5. E2E (if stack is running)
npx playwright test
```
