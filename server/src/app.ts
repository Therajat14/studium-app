import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'

import { env } from './config/env.js'
import { loggerConfig } from './config/logger.js'
import { errorHandler } from './middlewares/error.handler.js'

import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { uploadRoutes } from './modules/upload/upload.routes.js'
import { postsRoutes } from './modules/posts/posts.routes.js'
import { feedRoutes } from './modules/feed/feed.routes.js'
import { commentsOnPostRoutes, commentRoutes } from './modules/comments/comments.routes.js'
import { postReactionRoutes, commentReactionRoutes } from './modules/reactions/reactions.routes.js'
import { tagsRoutes } from './modules/tags/tags.routes.js'
import { notificationsRoutes } from './modules/notifications/notifications.routes.js'

export const createApp = async () => {
  const app = Fastify({ logger: loggerConfig })

  // ─── Security ─────────────────────────────────────────────────────────

  await app.register(helmet)

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })

  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: { message: 'Too many requests — please slow down' },
    }),
  })

  // ─── Plugins ───────────────────────────────────────────────────────────

  await app.register(cookie)

  await app.register(jwt, { secret: env.JWT_SECRET })

  // Multipart for file uploads — limit body size to 100 MB (largest allowed file)
  await app.register(multipart, {
    limits: { fileSize: env.UPLOAD_MAX_VIDEO_BYTES, files: 1 },
  })

  // ─── Error handling ────────────────────────────────────────────────────

  app.setErrorHandler(errorHandler as Parameters<typeof app.setErrorHandler>[0])

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({ success: false, error: { message: 'Route not found' } })
  })

  // ─── Routes ────────────────────────────────────────────────────────────

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await app.register(authRoutes,           { prefix: '/api/auth' })
  await app.register(usersRoutes,          { prefix: '/api/users' })
  await app.register(uploadRoutes,         { prefix: '/api/upload' })
  await app.register(postsRoutes,          { prefix: '/api/posts' })
  await app.register(commentsOnPostRoutes, { prefix: '/api/posts' })
  await app.register(commentRoutes,        { prefix: '/api/comments' })
  await app.register(postReactionRoutes,   { prefix: '/api/posts' })
  await app.register(commentReactionRoutes,{ prefix: '/api/comments' })
  await app.register(feedRoutes,           { prefix: '/api/feed' })
  await app.register(tagsRoutes,           { prefix: '/api/tags' })
  await app.register(notificationsRoutes,  { prefix: '/api/notifications' })

  return app
}
