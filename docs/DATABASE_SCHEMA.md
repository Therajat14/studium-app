# Database Schema — Studium

> PostgreSQL 15+ · Prisma ORM
>
> Last updated: Phase 3

---

## Tables

### User

Primary entity. Represents any registered account.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `cuid` | PK | Client-side safe, URL-safe unique ID |
| `email` | `varchar` | UNIQUE, NOT NULL | Lowercased and trimmed at validation layer |
| `name` | `varchar(50)` | NOT NULL | HTML-stripped before storage |
| `password` | `text` | NOT NULL | bcrypt hash (12 rounds) — **never returned in API** |
| `rollNumber` | `varchar` | UNIQUE, nullable | Student roll number |
| `college` | `text` | nullable | |
| `branch` | `text` | nullable | e.g. "CSE", "ECE" |
| `year` | `int` | nullable | 1–6 |
| `bio` | `text` | nullable | HTML-stripped before storage |
| `avatarUrl` | `text` | nullable | Prep for Phase 4 Cloudinary upload |
| `role` | `Role enum` | NOT NULL, default `STUDENT` | See [Roles](#roles) |
| `links` | `jsonb` | nullable | `{ github?, linkedin?, portfolio?, twitter? }` |
| `createdAt` | `timestamp` | NOT NULL, default `now()` | |
| `updatedAt` | `timestamp` | NOT NULL, auto | |

**Indexes:** `email`, `role`, `college`

---

### RefreshToken

Opaque server-side refresh tokens. One user can have multiple (multi-device).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `cuid` | PK | |
| `token` | `text` | UNIQUE, NOT NULL | 40-byte random hex |
| `userId` | `cuid` | FK → User.id, CASCADE DELETE | |
| `expiresAt` | `timestamp` | NOT NULL | 7 days from creation |
| `createdAt` | `timestamp` | NOT NULL, default `now()` | |

**Indexes:** `userId`, `token`

**Rotation:** On every `/auth/refresh`, the old token is deleted and a new one is created atomically. A stolen token is invalidated the next time the legitimate owner refreshes.

---

### Follow

Directed graph edge representing a follow relationship.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `cuid` | PK | |
| `followerId` | `cuid` | FK → User.id, CASCADE DELETE | The user doing the following |
| `followingId` | `cuid` | FK → User.id, CASCADE DELETE | The user being followed |
| `createdAt` | `timestamp` | NOT NULL, default `now()` | |

**Unique constraint:** `(followerId, followingId)` — prevents duplicate follows at DB level.

**Indexes:** `followerId`, `followingId`

---

## Roles

```
STUDENT  — default; regular enrolled student
ALUMNI   — graduated student; same permissions as STUDENT + future alumni features
MENTOR   — elevated trust; can create resources, mentor sessions
ADMIN    — full access; can manage users, roles, content
```

Role checks are enforced in `requireRole()` middleware in `server/src/middlewares/auth.hooks.ts`. Roles are stored in the JWT payload so authorization is stateless.

---

## Relationships

```
User ──< RefreshToken    (1:many, cascade delete)
User ──< Follow (as follower)   (1:many, cascade delete)
User ──< Follow (as following)  (1:many, cascade delete)
```

Phase 4 will add:

```
User ──< Post
User ──< Comment
User ──< Vote           (unique per user+post)
User ──< Membership     (unique per user+group)
Post ──< Comment
Post ──< Vote
```

---

## Design Decisions

**Why not MongoDB?**
- Votes require `UNIQUE(userId, postId)` — DB-enforced, not application-enforced
- Follows require `UNIQUE(followerId, followingId)` — enforced above
- Memberships need compound unique + role column
- Feed queries are JOIN-heavy (post + author + votes + groups)
- Refresh token rotation requires ACID transaction guarantees

**Why JSONB for `links`?**
Social links are structurally varied and rarely queried. JSONB avoids a separate table while keeping the schema clean. Validation is handled by Zod at the API layer.

**Why `cuid` over UUID?**
CUIDs are URL-safe, shorter, roughly time-ordered (useful for debugging), and have better collision resistance at scale than UUID v4.

---

## Migration Workflow

```bash
# After updating schema.prisma:
cd server
npm run db:migrate    # creates migration file + applies to DB
npm run db:generate   # regenerates Prisma client types
```

The `prisma.config.ts` at `server/prisma.config.ts` provides the connection URL to the Prisma CLI. The runtime client uses the `@prisma/adapter-pg` adapter initialized in `server/src/config/prisma.ts`.
