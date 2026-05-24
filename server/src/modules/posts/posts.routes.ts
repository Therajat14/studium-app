import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import {
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
} from './posts.controller.js'
import { prisma } from '../../config/prisma.js'
import { sendSuccess } from '../../lib/response.js'

export const postsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/:id', getPostHandler)
  fastify.post('/',   { preHandler: [authenticate] }, createPostHandler)
  fastify.patch('/:id', { preHandler: [authenticate] }, updatePostHandler)
  fastify.delete('/:id', { preHandler: [authenticate] }, deletePostHandler)

  // Bookmark toggle
  fastify.post('/:id/bookmark', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.user.sub
    const existing = await prisma.postBookmark.findUnique({
      where: { userId_postId: { userId, postId: id } },
    })
    if (existing) {
      await prisma.postBookmark.delete({ where: { id: existing.id } })
      return sendSuccess(reply, { bookmarked: false })
    }
    await prisma.postBookmark.create({ data: { userId, postId: id } })
    return sendSuccess(reply, { bookmarked: true })
  })

  // Check bookmark status
  fastify.get('/:id/bookmark', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const bm = await prisma.postBookmark.findUnique({
      where: { userId_postId: { userId: req.user.sub, postId: id } },
    })
    return sendSuccess(reply, { bookmarked: !!bm })
  })
}
