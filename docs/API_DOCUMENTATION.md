# API Documentation — Studium

> Base URL: `http://localhost:5000/api`
>
> All responses follow the envelope shape:
> ```json
> { "success": true,  "data": <T> }
> { "success": false, "error": { "message": "..." } }
> ```
>
> Paginated responses wrap a `PaginatedData<T>` object inside `data`:
> ```json
> { "success": true, "data": { "items": [], "total": 0, "page": 1, "limit": 20, "totalPages": 0, "hasNextPage": false, "hasPrevPage": false } }
> ```

---

## Authentication

### POST /auth/register

Create a new account. Returns an access token and the created user.

**Rate limit:** 10 req/min per IP

**Body**
```json
{
  "name": "Rajat Singh",
  "email": "rajat@example.com",
  "password": "securepassword",
  "rollNumber": "21CS001"      // optional
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT", ... }
  }
}
```

**Errors**
| Status | Code | When |
|--------|------|------|
| 400 | Validation error | Missing/invalid fields |
| 409 | EMAIL_TAKEN | Email already registered |

---

### POST /auth/login

Sign in. Returns an access token and the user.

**Rate limit:** 10 req/min per IP

**Body**
```json
{ "email": "rajat@example.com", "password": "securepassword" }
```

**Response 200**
```json
{ "success": true, "data": { "accessToken": "<jwt>", "user": { ... } } }
```

**Errors**
| Status | When |
|--------|------|
| 400 | Invalid credentials |

---

### POST /auth/refresh

Exchange the httpOnly refresh-token cookie for a new access token. Rotates the refresh token (old one is invalidated).

**Rate limit:** 10 req/min per IP

**Cookies required:** `refreshToken` (set automatically by browser)

**Response 200**
```json
{ "success": true, "data": { "accessToken": "<jwt>", "user": { ... } } }
```

---

### GET /auth/me

Return the currently authenticated user.

**Auth:** Bearer token required

**Response 200**
```json
{ "success": true, "data": { "user": { ... } } }
```

---

### POST /auth/logout

Revoke the refresh token and clear the cookie.

**Cookies required:** `refreshToken`

**Response 200**
```json
{ "success": true, "data": { "message": "Logged out" } }
```

---

## Users

### GET /users

List users with optional search and filters. Public.

**Query params**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 50) |
| `search` | string | — | Searches name, email, college (case-insensitive) |
| `college` | string | — | Filter by college (exact, case-insensitive) |
| `role` | enum | — | `STUDENT` \| `ALUMNI` \| `MENTOR` \| `ADMIN` |

**Response 200** — `PaginatedData<UserProfile>`

---

### GET /users/:id

Get a user's public profile. Public.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "...", "name": "...", "email": "...", "role": "STUDENT",
    "college": "IIT Delhi", "branch": "CSE", "year": 3,
    "bio": "...", "avatarUrl": null,
    "links": { "github": "https://github.com/...", "linkedin": null },
    "createdAt": "...",
    "_count": { "followers": 12, "following": 5 }
  }
}
```

**Errors**
| Status | When |
|--------|------|
| 404 | User not found |

---

### PATCH /users/me

Update the authenticated user's profile.

**Auth:** Bearer token required

**Body** (all fields optional)
```json
{
  "name": "Updated Name",
  "college": "IIT Delhi",
  "branch": "CSE",
  "year": 3,
  "bio": "Short bio here",
  "links": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "portfolio": null,
    "twitter": null
  }
}
```

Set any field to `null` to clear it. Omit a field to leave it unchanged.

**Response 200** — updated `UserProfile`

---

### POST /users/:id/follow

Follow a user.

**Auth:** Bearer token required

**Errors**
| Status | When |
|--------|------|
| 400 | Cannot follow yourself |
| 404 | Target user not found |
| 409 | Already following |

---

### DELETE /users/:id/follow

Unfollow a user.

**Auth:** Bearer token required

**Errors**
| Status | When |
|--------|------|
| 400 | Not following this user |

---

### GET /users/:id/followers

List a user's followers. Public, paginated.

**Query params:** `page`, `limit` (same as GET /users)

**Response 200** — `PaginatedData<UserProfile>`

---

### GET /users/:id/following

List who a user follows. Public, paginated.

**Query params:** `page`, `limit`

**Response 200** — `PaginatedData<UserProfile>`

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error or bad request |
| 401 | Unauthenticated (missing or expired token) |
| 403 | Forbidden (authenticated, insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already-exists) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
