# Security — Studium

---

## Token architecture

| Decision | Detail | Rationale |
|----------|--------|-----------|
| Access token in memory (not localStorage) | Stored in a JS module-level variable in `axiosInstance.ts` | Eliminates XSS token theft — `document.cookie` and `localStorage` are readable by injected scripts; a module variable is not |
| Refresh token as httpOnly cookie | Set with `httpOnly: true, sameSite: 'lax', path: '/api/auth/refresh'` | JavaScript cannot read it; the browser attaches it only to refresh requests |
| Cookie scoped to `/api/auth/refresh` | `path` attribute on the cookie | Refresh token is not sent on unrelated API requests |
| Refresh token rotation | Every `POST /api/auth/refresh` deletes the old token and creates a new one | Detects token theft: if an attacker uses a stolen refresh token, the legitimate user's next refresh will fail (the old token is gone), triggering revocation |
| Server-side refresh token storage | Stored in `RefreshToken` table with `expiresAt` | Enables full revocation: logout deletes the row; banning a user deletes all their tokens |

---

## Password security

| Decision | Detail |
|----------|--------|
| bcrypt hashing | 12 rounds default (`BCRYPT_SALT_ROUNDS` env var) |
| Password never returned | The `password` field is excluded in all Prisma queries that return user data (`select: { password: false }` in repository functions) |
| Minimum length enforced | 8 characters minimum, validated by Zod at the route layer before any DB access |

---

## Rate limiting

| Scope | Limit | Applies to |
|-------|-------|-----------|
| Global | 120 requests / minute | All routes |
| Auth mutations | 10 requests / minute | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh` |

Rate limit errors return `{ "success": false, "error": { "message": "Too many requests…" } }` with HTTP 429.

---

## HTTP security headers (Helmet)

`@fastify/helmet` is registered globally and sets:

| Header | Protection |
|--------|-----------|
| `Strict-Transport-Security` | Forces HTTPS (HSTS) |
| `Content-Security-Policy` | Restricts script/style sources |
| `X-Frame-Options: DENY` | Prevents clickjacking |
| `X-Content-Type-Options: nosniff` | Prevents MIME sniffing |
| `Referrer-Policy: no-referrer` | No referrer leakage |
| `Permissions-Policy` | Disables unnecessary browser features |

---

## CORS

CORS is restricted to the `CORS_ORIGIN` environment variable. In production this should be the exact frontend origin (e.g. `https://studium.app`). `credentials: true` is required for the httpOnly cookie to work across origins.

```typescript
// server/src/app.ts
await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})
```

---

## Input validation

All request bodies and query parameters are validated by Zod schemas before reaching any business logic. The global error handler converts `ZodError` to HTTP 400 with the first validation message, preventing raw validation stack traces from leaking to clients.

HTML is stripped from user-provided fields (`name`, `bio`, `title`, `content`) using a sanitize utility before writing to the database.

---

## File uploads

| Check | Detail |
|-------|--------|
| Size limit | Images: 10 MB · Videos: 100 MB (enforced by `@fastify/multipart`) |
| MIME type | Validated before Cloudinary upload |
| Auth required | All uploads require a valid Bearer token |
| Cloudinary public IDs | Stored in `Media.publicId` — used for server-side deletion |

---

## Environment validation

`server/src/config/env.ts` uses Zod to validate all environment variables at startup. If any required variable is missing or malformed, the process exits immediately with a clear error message. This prevents silent misconfigurations from reaching production.

---

## Authorization checks

All mutation endpoints that operate on a user-owned resource check ownership before proceeding:

```
DELETE /api/posts/:id
  ├── Fetch post from DB
  ├── post.authorId !== request.user.sub → 403 Forbidden
  └── Proceed with soft delete

DELETE /api/lostfound/:id, PATCH /api/lostfound/:id/resolve — same pattern
DELETE /api/comments/:id, PATCH /api/comments/:id — same pattern
```

Business-rule violations (self-follow, self-claim) return 400, not 403.

---

## Socket.IO auth

Socket.IO connections authenticate using the access token passed as `auth.token`:

```javascript
io('http://localhost:5000', { auth: { token: accessToken } })
```

The Socket.IO server verifies the JWT on connection. Unauthenticated connections are rejected before joining any rooms. User presence is tracked in Redis with a 60-second TTL, refreshed on each heartbeat.
