# Prototype Parity Document

> Source of truth: `prototype-view/src/`  
> Last audited: 2026-05-24

---

## Layout & Navigation

| Prototype | Production | Status |
|-----------|------------|--------|
| Left sidebar (fixed, 256px) with logo, user info, nav, logout | Top horizontal navbar | ❌ REGRESSION |
| Sidebar shows user avatar, name, branch, year | Navbar shows avatar only | ❌ MISSING |
| Sidebar shows karma points + connections count | Not shown in nav | ❌ MISSING |
| Sidebar shows earned badges (up to 2) | Not shown | ❌ MISSING |
| Mobile: sidebar slides in from left, overlay backdrop | Mobile: top navbar only | ❌ MISSING |
| Mobile hamburger menu | Not implemented | ❌ MISSING |
| 8 nav items: Feed, Knowledge Hub, Q&A, Messages, Opportunities, Campus Life, Discover, Profile | 2 nav items: Feed, Messages | ❌ MISSING 6 sections |
| Active item highlighted with left border accent | Active link uses bg-accent | ✅ PARTIAL |

---

## Auth — Registration (3-step flow)

| Prototype | Production | Status |
|-----------|------------|--------|
| Step 1: Name, Email, Roll Number, Password | All fields on one screen | ✅ Fields present |
| Step 2: College, Branch, Year (dropdown), Skills (comma-sep) | ❌ Not collected | ❌ MISSING |
| Step 3: Bio, GitHub, LinkedIn, Portfolio | ❌ Not collected | ❌ MISSING |
| Progress bar (3 steps) | Removed | ❌ REMOVED |
| Login accepts email OR roll number | Login accepts email only | ❌ MISSING |
| Theme toggle on auth page | Not present | ❌ MISSING |

**DB gap:** `college`, `branch`, `year`, `bio`, `links (github/linkedin/portfolio)`, `skills` exist in schema but are never collected at signup.

---

## Community Feed

| Prototype | Production | Status |
|-----------|------------|--------|
| Create Post button → modal | Exists (PostComposer) | ✅ |
| Post types: Text, Poll, Image/attachment | Text + image only (no polls) | ❌ MISSING polls |
| Post card: author avatar, name, branch, year, karma, badges | Partial | ❌ PARTIAL |
| Upvote / Downvote with net score | Reactions (❤️ etc.) only | ❌ REGRESSION — prototype has upvote/downvote, not emoji reactions |
| Bookmark post | Not implemented | ❌ MISSING |
| Flag/report post | Not implemented | ❌ MISSING |
| Share count | Not implemented | ❌ MISSING |
| Inline comment section (toggle) | Separate PostDetail page | ❌ DIFFERENT FLOW |
| Comment upvoting | Not implemented | ❌ MISSING |
| Reply to comment | Not implemented | ❌ MISSING |
| Tags displayed on post | Exists | ✅ |
| Poll rendering (options + progress bars + vote count) | Not implemented | ❌ MISSING |
| File attachment display + download button | Partial (image only) | ❌ PARTIAL |
| Load More button | Pagination exists via API | ✅ |
| Filter by branch/subject | Not implemented | ❌ MISSING |

---

## Knowledge Hub (/knowledge)

> **Status: ENTIRE SCREEN MISSING**

| Feature | Status |
|---------|--------|
| Resource cards (title, description, type badge, subject, course) | ❌ MISSING |
| Upload resource (PDF, image, video, doc, archive) | ❌ MISSING |
| Star rating + review count per resource | ❌ MISSING |
| Download count | ❌ MISSING |
| Bookmark resource | ❌ MISSING |
| Collaborative document flag (live doc with contributor count) | ❌ MISSING |
| Filter by subject / resource type | ❌ MISSING |
| Search within knowledge hub | ❌ MISSING |
| Tabs: All Resources / My Uploads / Bookmarked | ❌ MISSING |
| Upload modal with subject, course, tags, file picker | ❌ MISSING |

---

## Q&A (/qna)

> **Status: ENTIRE SCREEN MISSING**

| Feature | Status |
|---------|--------|
| Question list with title, body excerpt, tags | ❌ MISSING |
| Upvote/downvote questions | ❌ MISSING |
| Accepted answer indicator (green checkmark) | ❌ MISSING |
| Bounty points on questions | ❌ MISSING |
| Difficulty tag (Beginner / Intermediate / Advanced) | ❌ MISSING |
| View count, answer count | ❌ MISSING |
| Ask Question modal (title, body, tags, difficulty, bounty) | ❌ MISSING |
| Filter by: Unanswered, Trending, Bounty, My Questions | ❌ MISSING |
| Answer thread per question | ❌ MISSING |
| Mark answer as accepted | ❌ MISSING |

---

## Messages (/messages)

| Prototype | Production | Status |
|-----------|------------|--------|
| Conversation list sidebar | ✅ ConversationList | ✅ |
| Direct messages | ✅ | ✅ |
| Group conversations (type: 'group', member count shown) | Only DMs | ❌ MISSING group chats |
| Online presence indicator (green dot) | Not shown in conv list | ❌ MISSING |
| Unread message badge count | Partially exists | ✅ PARTIAL |
| Group name + member count in header | Not implemented | ❌ MISSING |
| Search conversations | Not implemented | ❌ MISSING |
| Voice/video call buttons (UI only in prototype) | Not implemented | ❌ MISSING |
| Attachment button in message input | Not implemented | ❌ MISSING |
| Emoji picker button | Not implemented | ❌ MISSING |
| Create new group chat button | Not implemented | ❌ MISSING |
| Message timestamps | ✅ | ✅ |

---

## Opportunities (/opportunities)

> **Status: ENTIRE SCREEN MISSING**

| Feature | Status |
|---------|--------|
| Jobs/Internships tab | ❌ MISSING |
| Hackathons/Events tab | ❌ MISSING |
| Job cards: title, company, location, type, salary, requirements | ❌ MISSING |
| Event cards: title, organizer, date/time, location, type, attendees | ❌ MISSING |
| Posted by alumni with role badge | ❌ MISSING |
| Apply / Register buttons | ❌ MISSING |
| Deadline indicator | ❌ MISSING |
| Search + filter (type, location, skills) | ❌ MISSING |
| Post new opportunity modal | ❌ MISSING |

---

## Campus Life (/campus)

> **Status: ENTIRE SCREEN MISSING**

| Feature | Status |
|---------|--------|
| Reviews: Faculty, Courses, Facilities | ❌ MISSING |
| Star rating per review | ❌ MISSING |
| Helpful / Not Helpful voting on reviews | ❌ MISSING |
| Campus help Q&A (local tips, locations) | ❌ MISSING |
| Category filter (Faculty / Course / Facility / Food / Transport) | ❌ MISSING |
| Write review button + modal | ❌ MISSING |

---

## Search / Discover (/search)

> **Status: ENTIRE SCREEN MISSING**

| Feature | Status |
|---------|--------|
| Search students by name, skill, branch | ❌ MISSING |
| Student cards: avatar, name, branch, year, bio, karma, badges, skills | ❌ MISSING |
| Online status indicator | ❌ MISSING |
| Mutual connections count | ❌ MISSING |
| Connect / Follow button on student card | ❌ MISSING (follow API exists, no UI) |
| Message button (opens DM) | ❌ MISSING |
| Filter by branch, year | ❌ MISSING |
| Tabs: Students / Resources / All | ❌ MISSING |

---

## Profile (/profile)

> **Status: PAGE MISSING** (API exists, no frontend page)

| Feature | Status |
|---------|--------|
| Header: avatar + camera upload button, name, branch, year, college, roll number | ❌ MISSING |
| Stats grid: Karma, Connections, Posts, Resources Shared | ❌ MISSING |
| Badges section with all earned badges | ❌ MISSING |
| Edit Profile toggle (inline editing, not modal) | ❌ MISSING |
| Bio field (view + edit) | ❌ MISSING |
| Email field (view + edit) | ❌ MISSING |
| Location field | ❌ MISSING |
| University / Course / Year fields | ❌ MISSING |
| Social links: GitHub, LinkedIn, Portfolio/Website | ❌ MISSING |
| Skills as tags (view + edit) | ❌ MISSING |
| Recent Activity panel (uploads, posts, comments) | ❌ MISSING |
| Avatar upload (camera icon on avatar) | ❌ MISSING |

---

## User System / Karma

| Prototype | Production | Status |
|-----------|------------|--------|
| Karma points displayed everywhere (sidebar, feed, profile) | Not tracked in UI | ❌ MISSING |
| Badges (Top Contributor, Code Warrior, Rising Star, etc.) | Schema has no badges table | ❌ MISSING |
| Connections count (follow count) | Follow API exists, not displayed | ❌ PARTIAL |
| Skills as structured array on user | Schema has no skills field | ❌ MISSING in DB |

---

## Summary

| Section | Status |
|---------|--------|
| Auth / Registration | ⚠️ Partial (missing steps 2+3) |
| Layout / Sidebar | ❌ Regression (top navbar ≠ sidebar) |
| Community Feed | ⚠️ Partial (missing polls, bookmarks, upvotes) |
| Knowledge Hub | ❌ Not started |
| Q&A | ❌ Not started |
| Messages | ⚠️ Partial (no groups) |
| Opportunities | ❌ Not started |
| Campus Life | ❌ Not started |
| Search / Discover | ❌ Not started |
| Profile Page | ❌ Not started |
| Karma / Badges | ❌ Not started |

**Completed:** ~25% of prototype parity  
**Missing:** ~75%

---

## Priority Order (per user instruction)

### P0 — Layout regression (blocks everything else)
1. Switch from top navbar to sidebar layout matching prototype

### P1 — Missing data at registration
2. Add college, branch, year, skills, bio, links to signup (step 2+3)
3. Add `skills` array to User schema

### P2 — Core feed gaps
4. Upvote/downvote on posts (replace emoji reactions or add alongside)
5. Bookmark posts
6. Poll post type
7. Inline comments (toggleable on feed card, not separate page)

### P3 — Missing screens (build in order)
8. Profile page (`/profile/:id`) — API already exists
9. Search / Discover page — Users API already exists
10. Knowledge Hub — needs new backend module
11. Q&A — needs new backend module
12. Opportunities — needs new backend module
13. Campus Life — needs new backend module

### P4 — Enhancements
14. Group chats in Messages
15. Karma tracking
16. Badges system
