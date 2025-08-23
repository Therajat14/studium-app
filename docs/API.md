# API Documentation

This document provides an overview of all available API endpoints for the project.

---

## Authentication

### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "uuid"
}
```

---

### `POST /api/auth/login`
Authenticate user and issue JWT.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "expiresIn": 3600
}
```

---

## Posts

### `GET /api/posts`
Fetch all posts.

**Response:**
```json
[
  {
    "id": "uuid",
    "author": "userId",
    "content": "string",
    "createdAt": "date-time"
  }
]
```

---

### `POST /api/posts`
Create a new post.

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "postId": "uuid"
}
```

---

## File Uploads

### `POST /api/files/upload`
Upload a file.

**Request:** multipart/form-data

**Response:**
```json
{
  "message": "File uploaded successfully",
  "fileUrl": "https://cdn.example.com/file.png"
}
```

---

## Groups

### `POST /api/groups`
Create a new group.

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "message": "Group created successfully",
  "groupId": "uuid"
}
```

### `GET /api/groups/:id`
Fetch group details.

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "members": ["userId"]
}
```

---

## Notifications

### `GET /api/notifications`
Get user notifications.

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "string",
    "message": "string",
    "createdAt": "date-time"
  }
]
```

---

## Search

### `GET /api/search?q=keyword`
Search posts, users, or groups.

**Response:**
```json
{
  "users": [],
  "posts": [],
  "groups": []
}
```

---

## Moderation

### `POST /api/moderation/report`
Report a post or user.

**Request Body:**
```json
{
  "targetId": "uuid",
  "type": "post|user",
  "reason": "string"
}
```

**Response:**
```json
{
  "message": "Report submitted successfully"
}
```
