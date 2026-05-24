import type { FastifyInstance } from 'fastify'
import { getFeedHandler } from './feed.controller.js'

export const feedRoutes = async (fastify: FastifyInstance) => {
  // Public — authenticated users get personalized following feed
  // jwtVerify is intentionally NOT called here; userId is read from request.user if present
  fastify.get('/', getFeedHandler)
}
