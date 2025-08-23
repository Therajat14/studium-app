# 🧩 MODULES.md — Studium

This document explains each logical module in the Studium backend and how they interact.

---

## 1) Auth Module
- **Purpose:** Registration, login, token issuance (JWT), refresh flow, password reset.
- **Routes:** `/api/auth/*`
- **Key Files:** `controllers/authController.js`, `services/authService.js`, `middlewares/authMiddleware.js`
- **Notes:** Use `httpOnly` cookies or Authorization Bearer tokens; support OAuth later.

## 2) User Module
- **Purpose:** Profiles, follow/unfollow, search, privacy settings.
- **Routes:** `/api/users/*`
- **Key Files:** `controllers/userController.js`, `models/User.js`
- **Notes:** Expose safe public profile; hide sensitive fields by default.

## 3) Post & Comment Module (Reddit-like)
- **Purpose:** Create/read/update/delete posts; comments; votes; tags; feed.
- **Routes:** `/api/posts/*`
- **Key Files:** `controllers/postController.js`, `models/Post.js`, `models/Comment.js`
- **Notes:** Keep `commentsCount`, `score` as derived fields; rate-limit posting.

## 4) Resource/Notes Module (Notion-like)
- **Purpose:** Upload & share files/notes with tags & metadata.
- **Routes:** `/api/resources/*`, `/api/files/*`
- **Key Files:** `controllers/fileController.js`, `services/fileService.js`, `models/Resource.js`
- **Notes:** Use S3/Cloudinary; store only URLs in DB; validate MIME and size.

## 5) Groups & Memberships
- **Purpose:** Class/club/project spaces; role-based access (owner/admin/member).
- **Routes:** `/api/groups/*`
- **Key Files:** `controllers/groupController.js`, `models/Group.js`, `models/Membership.js`
- **Notes:** Permissions: only owners/admins can manage roles.

## 6) Notifications
- **Purpose:** Real-time + email notifications for events.
- **Routes:** `/api/notifications/*`
- **Key Files:** `controllers/notificationController.js`, `services/notificationService.js`
- **Notes:** Socket.IO for online users; email for offline.

## 7) Search & Discovery
- **Purpose:** Query users, posts, resources by text & filters.
- **Routes:** `/api/search`
- **Key Files:** `controllers/searchController.js`
- **Notes:** Start with MongoDB text index; upgrade to Meilisearch/Atlas Search later.

## 8) Moderation
- **Purpose:** Reporting, reviewing, and actioning abusive content.
- **Routes:** `/api/moderation/*`
- **Key Files:** `controllers/moderationController.js`
- **Notes:** Keep audit logs; implement content filters gradually.

---

### Cross-Cutting Concerns
- **Middlewares:** `authMiddleware`, `errorHandler`, `rateLimiter`, `validateRequest`
- **Utilities:** `logger`, `validators`, `apiResponse`
- **Security:** CORS, helmet, input sanitization, file scanning
