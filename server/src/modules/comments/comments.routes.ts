import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import {
  listCommentsHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from './comments.controller.js'

// Mounted at /api/posts — handles /:postId/comments
// Standalone comment mutations (/api/comments/:id) are registered separately in app.ts
export const commentsOnPostRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/:postId/comments', listCommentsHandler)
  fastify.post('/:postId/comments', { preHandler: [authenticate] }, createCommentHandler)
}

// Mounted at /api/comments
export const commentRoutes = async (fastify: FastifyInstance) => {
  fastify.patch('/:id', { preHandler: [authenticate] }, updateCommentHandler)
  fastify.delete('/:id', { preHandler: [authenticate] }, deleteCommentHandler)
}
