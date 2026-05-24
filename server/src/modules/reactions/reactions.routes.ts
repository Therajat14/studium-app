import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { togglePostReactionHandler, toggleCommentReactionHandler } from './reactions.controller.js'

// Mounted separately in app.ts — post reactions under /api/posts, comment reactions under /api/comments
export const postReactionRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/:id/reactions', { preHandler: [authenticate] }, togglePostReactionHandler)
}

export const commentReactionRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/:id/reactions', { preHandler: [authenticate] }, toggleCommentReactionHandler)
}
