import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import {
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
} from './posts.controller.js'

export const postsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/:id', getPostHandler)
  fastify.post('/',   { preHandler: [authenticate] }, createPostHandler)
  fastify.patch('/:id', { preHandler: [authenticate] }, updatePostHandler)
  fastify.delete('/:id', { preHandler: [authenticate] }, deletePostHandler)
}
