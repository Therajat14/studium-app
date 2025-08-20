# Backend Structure Documentation

This document provides a **detailed explanation** of the backend architecture, folder structure, and responsibilities of each component in the `server` directory.

---

## 📂 Root Folder (`/server`)

The `server` folder contains all the backend code for the **Studium project** (Notion + Reddit + LinkedIn for Colleges).  
It is organized for scalability, modularity, and maintainability.

### Main Files

- **package.json** → Defines backend dependencies (Express, Mongoose, JWT, etc.), scripts (`dev`, `start`, `lint`).
- **tsconfig.json / jsconfig.json** → Config for TypeScript or JavaScript project setup.
- **.env** → Stores environment variables (DB connection, JWT secret, API keys). Never commit this file.
- **.gitignore** → Ensures `node_modules`, `.env`, and build files are ignored.
- **README.md** → Basic backend usage guide.

---

## 📂 src/

The `src` folder contains all source code of the backend.

### 📂 config/

Holds configuration files used across the backend.

- **db.js** → Sets up MongoDB connection using Mongoose.
- **logger.js** → Configures logging (e.g., Winston, console-based logging).
- **env.js** → Reads environment variables and provides safe access.

### 📂 models/

Defines **Mongoose schemas** for MongoDB collections.

- **User.js** → Schema for user accounts (name, email, password, role, profile, etc.).
- **Post.js** → Schema for posts (text, media, author, likes, comments).
- **Comment.js** → Schema for comments with reference to `Post` and `User`.
- **File.js** → Schema for uploaded files (filename, size, uploader, permissions).
- **Review.js** → Schema for college reviews (ratings, text, user ref, timestamps).
- **Message.js** → Schema for real-time chat messages.

### 📂 routes/

Handles API route definitions (Express routers). Each route file imports controllers.

- **authRoutes.js** → `/api/auth` (login, register, refresh token).
- **userRoutes.js** → `/api/users` (profile, friends, seniors, search).
- **postRoutes.js** → `/api/posts` (CRUD posts, upvotes, comments).
- **fileRoutes.js** → `/api/files` (upload, download, delete).
- **reviewRoutes.js** → `/api/reviews` (CRUD reviews, ratings).
- **chatRoutes.js** → `/api/chat` (messages, conversations).

### 📂 controllers/

Contains **business logic** for routes. They interact with models.

- **authController.js** → Handles signup, login, logout, JWT token refresh.
- **userController.js** → Manages profiles, friend requests, senior connections.
- **postController.js** → Create, edit, delete posts; handle likes, comments.
- **fileController.js** → Handles file upload/download with services like AWS S3 or local storage.
- **reviewController.js** → Create/update college reviews, aggregate ratings.
- **chatController.js** → Send/receive messages, manage conversations.

### 📂 services/

Business services that handle **complex operations** or external APIs.

- **authService.js** → Password hashing, JWT creation, verification.
- **fileService.js** → File handling logic (e.g., cloud storage integration).
- **chatService.js** → Socket.io integration for real-time messaging.
- **emailService.js** → Send notifications (e.g., account verification, password reset).

### 📂 middlewares/

Holds Express middlewares used across routes.

- **authMiddleware.js** → Protects routes, checks JWT tokens.
- **errorHandler.js** → Centralized error handler for API responses.
- **rateLimiter.js** → Prevents abuse with request limits.
- **validateRequest.js** → Validates incoming data using libraries like Joi/Yup.

### 📂 utils/

Helper functions used across the backend.

- **apiResponse.js** → Standardized success/error response format.
- **generateToken.js** → Utility to generate JWT tokens.
- **logger.js** → Logs system-level events.
- **validators.js** → Shared validation functions.

### 📂 sockets/

WebSocket or Socket.io logic for real-time features.

- **chatSocket.js** → Handles real-time chat events (connect, disconnect, message).
- **notificationSocket.js** → Sends notifications (friend request, likes, comments).

### 📂 tests/

Contains unit and integration tests.

- **auth.test.js** → Tests for authentication flow.
- **post.test.js** → Tests for posts CRUD.
- **file.test.js** → Tests for file handling.

---

## 📂 server.js (entry point)

The main starting point of the backend.

- Imports **Express**, middlewares, routes, and DB connection.
- Starts the backend server on a defined port.
- Integrates Socket.io for real-time chat.

Example snippet:

```js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error Handler
app.use(errorHandler);

// DB + Server start
connectDB();
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
```

---

## 🔑 Key Design Principles

1. **Separation of Concerns** → Routes, controllers, services, models all separate.
2. **Scalability** → Modular file structure allows features to grow easily.
3. **Security First** → JWT, bcrypt, rate limiting, validation.
4. **Real-Time Support** → Socket.io for chats, notifications.
5. **Cloud Ready** → File uploads, environment config, and modular services.

---

## 📌 Example Workflow: User Posts

1. User sends request → `/api/posts/create`.
2. `postRoutes.js` calls `postController.createPost()`.
3. Controller validates data and calls `Post` model.
4. Data saved in MongoDB.
5. Response returned with success message and post data.
6. Notifications sent (via socket) to friends/seniors.

---

## 🚀 Future Extensions

- AI-based study partner recommendation.
- College-specific trending feeds.
- Gamification (badges, points, leaderboards).
- Payment integration for premium features.

---
