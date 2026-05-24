# Database — Studium

> PostgreSQL 15+ · Prisma 7 (`@prisma/adapter-pg` native driver)
>
> Schema file: `server/prisma/schema.prisma`

---

## Enums

| Enum | Values |
|------|--------|
| `Role` | `STUDENT` · `ALUMNI` · `MENTOR` · `ADMIN` |
| `PostType` | `DISCUSSION` · `QUESTION` · `ANNOUNCEMENT` · `RESOURCE` · `POLL` |
| `ReactionType` | `LIKE` · `UPVOTE` · `DOWNVOTE` |
| `MediaType` | `IMAGE` · `VIDEO` · `PDF` · `DOCUMENT` |
| `NotificationType` | `COMMENT` · `REPLY` · `FOLLOW` · `POST_REACTION` · `COMMENT_REACTION` |
| `ResourceType` | `PDF` · `DOC` · `SPREADSHEET` · `IMAGE` · `VIDEO` · `LINK` · `COLLABORATIVE` |
| `QuestionDifficulty` | `BEGINNER` · `INTERMEDIATE` · `ADVANCED` |
| `OpportunityType` | `JOB` · `INTERNSHIP` · `HACKATHON` · `EVENT` · `SCHOLARSHIP` · `PROJECT` |
| `ReviewCategory` | `FACULTY` · `COURSE` · `FACILITY` · `FOOD` · `TRANSPORT` · `OTHER` |
| `LostFoundType` | `LOST` · `FOUND` |
| `LostFoundCategory` | `ELECTRONICS` · `DOCUMENTS` · `CLOTHING` · `ACCESSORIES` · `BOOKS` · `KEYS` · `BAGS` · `OTHER` |
| `LostFoundStatus` | `OPEN` · `RESOLVED` |

---

## Tables

### User

Primary entity. Every registered account is a `User`.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `cuid` | PK | URL-safe unique ID |
| `email` | `varchar` | UNIQUE | Validated at registration |
| `name` | `varchar(50)` | NOT NULL | HTML-stripped before storage |
| `password` | `text` | NOT NULL | bcrypt hash — never returned in API responses |
| `rollNumber` | `varchar` | UNIQUE, nullable | Student roll number |
| `college` | `text` | nullable | Used for feed scoping |
| `branch` | `text` | nullable | e.g. "B.Tech CSE" |
| `year` | `int` | nullable | Academic year (1–6) |
| `bio` | `text` | nullable | HTML-stripped before storage |
| `avatarUrl` | `text` | nullable | Cloudinary URL |
| `role` | `Role` | default `STUDENT` | |
| `links` | `jsonb` | nullable | `{ github?, linkedin?, portfolio?, twitter? }` |
| `skills` | `String[]` | | Postgres array |
| `karma` | `int` | default `0` | Accumulated from reactions/answers |

Indexes: `email`, `role`, `college`

---

### RefreshToken

| Column | Type | Notes |
|--------|------|-------|
| `id` | `cuid` | PK |
| `token` | `text` | UNIQUE — 40-byte random hex |
| `userId` | FK → User | CASCADE DELETE |
| `expiresAt` | `datetime` | Checked on rotation |
| `createdAt` | `datetime` | |

Indexes: `userId`, `token`

---

### Follow

| Column | Type | Notes |
|--------|------|-------|
| `id` | `cuid` | PK |
| `followerId` | FK → User | The user who follows |
| `followingId` | FK → User | The user being followed |
| `createdAt` | `datetime` | |

Unique: `(followerId, followingId)` — prevents duplicate follows at DB level.

---

### Post

| Column | Type | Notes |
|--------|------|-------|
| `id` | `cuid` | PK |
| `title` | `varchar(200)` | nullable |
| `content` | `text` | NOT NULL |
| `type` | `PostType` | default `DISCUSSION` |
| `authorId` | FK → User | CASCADE DELETE |
| `viewCount` | `int` | default `0` |
| `deletedAt` | `datetime` | nullable — soft delete |

Relations: `tags` (PostTag[]), `media` (Media[]), `comments` (Comment[]), `reactions` (PostReaction[]), `bookmarks` (PostBookmark[]), `poll` (Poll?)

Indexes: `authorId`, `createdAt`, `type`, `deletedAt`

---

### PostBookmark

| Column | Type | Notes |
|--------|------|-------|
| `userId` | FK → User | |
| `postId` | FK → Post | |

Unique: `(userId, postId)` — one bookmark per user per post.

---

### Poll / PollOption / PollVote

Three-table structure for polls attached to posts.

- `Poll` — one per post (`postId` UNIQUE), optional `endsAt`
- `PollOption` — ordered options within a poll (`text varchar(120)`, `order int`)
- `PollVote` — `UNIQUE(pollId, userId)` — one vote per user per poll

---

### Comment

| Column | Type | Notes |
|--------|------|-------|
| `id` | `cuid` | PK |
| `content` | `text` | NOT NULL |
| `authorId` | FK → User | |
| `postId` | FK → Post | |
| `parentId` | FK → Comment | nullable — self-referential for threaded replies |
| `deletedAt` | `datetime` | nullable — soft delete |

Indexes: `postId`, `parentId`, `authorId`

---

### PostReaction / CommentReaction

| Column | Type | Notes |
|--------|------|-------|
| `type` | `ReactionType` | `LIKE \| UPVOTE \| DOWNVOTE` |
| `userId` | FK → User | |
| `postId/commentId` | FK | |

Unique: `(userId, postId, type)` — one vote per type per user per post.

---

### Tag / PostTag

- `Tag` — `name varchar(50)` UNIQUE, `slug varchar(50)` UNIQUE
- `PostTag` — composite PK `(postId, tagId)` — many-to-many junction

---

### Media

Stores metadata for files uploaded via Cloudinary.

| Column | Type | Notes |
|--------|------|-------|
| `url` | `text` | Cloudinary CDN URL |
| `publicId` | `text` | Cloudinary public ID (used for deletion) |
| `resourceType` | `MediaType` | `IMAGE \| VIDEO \| PDF \| DOCUMENT` |
| `bytes` | `int` | File size |
| `originalName` | `varchar(255)` | |
| `postId` | FK → Post | nullable — linked after post creation |
| `uploadedById` | FK → User | |

---

### Notification

| Column | Type | Notes |
|--------|------|-------|
| `type` | `NotificationType` | |
| `actorId` | FK → User | Who triggered the notification |
| `targetUserId` | FK → User | Who receives it |
| `entityId` | `text` | ID of the related entity (post, comment, etc.) |
| `entityType` | `varchar(20)` | e.g. `"post"`, `"comment"` |
| `readAt` | `datetime` | nullable |

Indexes: `(targetUserId, createdAt DESC)`, `readAt`, `type`

---

### Conversation / ConversationParticipant / Message

Three-table structure for messaging.

**Conversation**
- `isGroup boolean` — default false
- `name varchar(100)` — nullable (group name)
- `avatarUrl` — nullable

**ConversationParticipant**
- `UNIQUE(conversationId, userId)`
- `lastReadAt datetime` — nullable (for unread badge)
- `isAdmin boolean` — group admin flag

**Message**
- `content text`
- `deletedAt datetime` — soft delete
- Index: `(conversationId, createdAt DESC)`

---

### Resource (Knowledge Hub)

| Column | Type | Notes |
|--------|------|-------|
| `title` | `varchar(200)` | |
| `type` | `ResourceType` | |
| `subject` | `varchar(100)` | nullable |
| `course` | `varchar(50)` | nullable |
| `fileUrl` | `text` | nullable — Cloudinary URL |
| `fileSize` | `int` | nullable |
| `downloads` | `int` | default `0` |
| `isCollaborative` | `bool` | default `false` |
| `tags` | `String[]` | |

Relations: `bookmarks` (ResourceBookmark[]), `ratings` (ResourceRating[])

---

### QnaQuestion / QnaAnswer / QnaVote / QnaAnswerVote

**QnaQuestion**
- `title varchar(300)`, `content text`, `tags String[]`
- `difficulty QuestionDifficulty`, `bounty int`, `views int`
- `hasAccepted boolean` — set to true when an answer is accepted

**QnaAnswer** — `isAccepted boolean` — only one answer per question can be accepted

**QnaVote** / **QnaAnswerVote** — `UNIQUE(questionId/answerId, userId)`, `value int` (+1/-1)

---

### Opportunity

| Column | Type | Notes |
|--------|------|-------|
| `title` | `varchar(200)` | |
| `type` | `OpportunityType` | |
| `company` | `varchar(100)` | nullable |
| `location` | `varchar(100)` | nullable |
| `salary` | `varchar(50)` | nullable |
| `requirements` | `String[]` | |
| `deadline` | `datetime` | nullable |
| `url` | `text` | nullable — application link |
| `tags` | `String[]` | |

---

### CampusReview / ReviewVote

**CampusReview** — `category ReviewCategory`, `rating float`, `helpful/notHelpful int`

**ReviewVote** — `UNIQUE(reviewId, userId)`, `helpful boolean`

---

### LostFoundItem / LostFoundClaim

**LostFoundItem**

| Column | Type | Notes |
|--------|------|-------|
| `type` | `LostFoundType` | `LOST \| FOUND` |
| `category` | `LostFoundCategory` | |
| `title` | `varchar(200)` | |
| `description` | `text` | |
| `location` | `varchar(200)` | nullable |
| `imageUrl` | `text` | nullable — Cloudinary URL |
| `contactInfo` | `varchar(200)` | nullable |
| `status` | `LostFoundStatus` | default `OPEN` |

Indexes: `authorId`, `type`, `status`, `category`, `createdAt`

**LostFoundClaim** — `UNIQUE(itemId, userId)` — one claim per user per item. `message text` required.

---

## Relationship map

```
User ──< Follow >── User              (self-referential many-to-many)
User ──< Post ──< Comment             (user creates posts; posts have threaded comments)
User ──< PostReaction                 (user reacts to posts)
User ──< CommentReaction              (user reacts to comments)
Post ──< Tag >── PostTag              (many-to-many via junction table)
Post ──< Media                        (attachments)
Post ──< PostBookmark >── User        (saved posts)
Post ── Poll ──< PollOption ──< PollVote >── User
User ──< Notification                 (actor → target)
User ──< ConversationParticipant >── Conversation ──< Message ──< User
User ──< Resource ──< ResourceBookmark >── User
User ──< Resource ──< ResourceRating >── User
User ──< QnaQuestion ──< QnaAnswer    (Q&A thread)
User ──< QnaVote                      (question votes)
User ──< QnaAnswerVote                (answer votes)
User ──< Opportunity                  (posted by user)
User ──< CampusReview ──< ReviewVote >── User
User ──< LostFoundItem ──< LostFoundClaim >── User
```

---

## Migrations

```bash
# Apply all pending migrations to the database
npx prisma migrate deploy

# Create a new migration from schema changes (dev only)
npx prisma migrate dev --name <name>

# Push schema directly without migration file (prototyping only)
npx prisma db push

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

The Prisma CLI config is in `server/prisma.config.ts`. The `schema.prisma` itself does not contain the `DATABASE_URL` — it is injected via the config file at migration time.
