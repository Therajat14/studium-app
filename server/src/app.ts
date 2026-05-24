import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'

import { env } from './config/env.js'
import { loggerConfig } from './config/logger.js'
import { errorHandler } from './middlewares/error.handler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'

export const createApp = async () => {
  const app = Fastify({ logger: loggerConfig })

  // ─── Security ─────────────────────────────────────────────────────────

  await app.register(helmet)

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true, // Required for httpOnly cookie exchange
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

  // ─── Auth plugins ──────────────────────────────────────────────────────

  await app.register(cookie)

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  // ─── Error handling ────────────────────────────────────────────────────

  app.setErrorHandler(errorHandler as Parameters<typeof app.setErrorHandler>[0])

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      success: false,
      error: { message: 'Route not found' },
    })
  })

  // ─── Routes ────────────────────────────────────────────────────────────

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(usersRoutes, { prefix: '/api/users' })

  return app
}
