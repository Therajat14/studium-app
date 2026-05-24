import type { FastifyPluginAsync } from 'fastify'
import { register, login, me, refresh, logout } from './auth.controller.js'
import { authenticate } from '../../middlewares/auth.hooks.js'

// Tighter rate limit for auth mutation endpoints — shared config object
const authRateLimit = {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        success: false,
        error: { message: 'Too many auth requests — please wait before trying again' },
      }),
    },
  },
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Public routes — stricter rate limit on mutation endpoints
  fastify.post('/register', authRateLimit, register)
  fastify.post('/login', authRateLimit, login)
  fastify.post('/refresh', authRateLimit, refresh)

  // Protected routes — require valid access token
  fastify.get('/me', { preHandler: [authenticate] }, me)
  fastify.post('/logout', logout)
}
