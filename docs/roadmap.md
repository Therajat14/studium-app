# Roadmap — Studium

> "Notion + Reddit + LinkedIn — for your college."

---

## What's built

### Core platform ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (register, login, refresh rotation, logout) | ✅ | JWT + httpOnly cookie, bcrypt, rate limiting |
| User profiles + follow system | ✅ | Public profiles, follow/unfollow, follower/following lists |
| College/branch-scoped feed | ✅ | My Branch → My College → Everyone tabs |
| Post CRUD (Discussion, Question, Announcement, Resource, Poll) | ✅ | Soft delete, view count, tag system |
| Comments + threaded replies | ✅ | Self-referential, soft delete |
| Reactions (Like, Upvote, Downvote) on posts + comments | ✅ | Toggle, per-type counts |
| Bookmarks | ✅ | Toggle per post |
| File uploads (Cloudinary) | ✅ | Images, PDFs, videos |
| Knowledge Hub | ✅ | Resource listing, ratings, bookmarks, downloads |
| Q&A board | ✅ | Voting, accept answer, difficulty levels, bounty |
| Opportunities | ✅ | Jobs, internships, hackathons, events, scholarships |
| Campus Reviews | ✅ | Faculty, food, transport, facilities; helpful votes |
| Lost & Found | ✅ | LOST/FOUND listings, image support, claim flow, resolve |
| Messaging | ✅ | 1-to-1 and group conversations |
| Notifications | ✅ | Follow, reaction, comment; in-app + real-time |
| Real-time (Socket.IO + Redis) | ✅ | Messages, notifications, typing indicators, presence |
| Background jobs (BullMQ) | ✅ | Notification fan-out, email delivery |
| Registration dropdowns | ✅ | 20+ Dehradun-area colleges, 30+ engineering branches |

### Quality & infrastructure ✅

| Feature | Status | Notes |
|---------|--------|-------|
| TypeScript — strict end-to-end | ✅ | Server + client, zero `any` in production code |
| Server tests (Vitest) | ✅ | 58 tests — auth service unit + 4 route integration suites |
| Client tests (Vitest + RTL + MSW) | ✅ | 29 tests — PostCard, Login page, useAuth hook |
| CI/CD (GitHub Actions) | ✅ | Server job (Postgres service), client job, E2E job |
| Playwright config | ✅ | Auth + posts E2E specs |
| Production builds | ✅ | Server: tsc; Client: tsc -b + vite build |

---

## What's next

### Near-term

| Feature | Priority | Notes |
|---------|----------|-------|
| Group chats (add/remove participants, admin controls) | High | Messaging module is built; group management UI is missing |
| Post polls UI | Medium | `Poll` model exists in DB; client UI not yet built |
| Profile page — activity tab (posts, comments, resources) | Medium | Profile page exists; activity feed is a stub |
| Search (full-text across posts, users, resources) | Medium | `SearchPage.tsx` is a stub; no backend FTS yet |
| Notifications mark-as-read per item | Low | Currently mark-all-read only |
| Unread message badge | Low | `lastReadAt` is tracked in DB, client badge pending |

### Medium-term

| Feature | Priority | Notes |
|---------|----------|-------|
| Push notifications (web push / FCM) | Medium | BullMQ worker exists; push subscription storage needed |
| Email notifications digest | Medium | Email worker exists; digest template + scheduling needed |
| Resource collaborative editing | Low | `isCollaborative` flag exists; real-time editing not started |
| Post version history | Low | `updatedAt` tracked; diff storage not planned |
| College verification (email domain check) | Medium | Validate `@college.edu` email patterns at registration |
| Alumni network features | Low | `Role.ALUMNI` + `Role.MENTOR` exist; mentor connect not started |
| QnA bounty system | Low | `bounty int` in schema; award flow not implemented |

### Long-term

| Feature | Priority | Notes |
|---------|----------|-------|
| Mobile app (React Native) | Medium | Shared TypeScript types and API layer would carry over |
| Multi-college federation | Low | College namespacing in DB with `college` field already in User |
| AI study assistant (summarize notes) | Low | Could call external LLM API with Knowledge Hub resources |
| Recommendation engine | Low | `karma`, `skills`, `college`, `branch` are available signals |
| E2E test coverage (Playwright) | Medium | Specs written; need running test environment |
| Accessibility audit | Medium | Radix/shadcn provides ARIA; needs manual testing |

---

## Tech debt

| Item | Notes |
|------|-------|
| `SearchPage.tsx` is a stub | Full-text search not yet wired to backend |
| `UnderDevelopment.tsx` placeholder | A few nav items still link to this |
| Knowledge Hub client uploads | UI exists; media upload flow needs wiring to `/api/upload` |
| Test coverage < 100% | Current: 58 server + 29 client tests; feed service, users, messaging not yet unit-tested |
| No rate limiting on file uploads | Should add per-user upload size quotas |
| No PgBouncer | Direct Prisma connection in production; fine up to ~100 concurrent users |
