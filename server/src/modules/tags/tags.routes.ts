import type { FastifyInstance } from 'fastify'
import { sendSuccess, sendError } from '../../lib/response.js'
import { listTags, getPostsByTag } from './tags.service.js'
import { z } from 'zod'

export const tagsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request, reply) => {
    const tags = await listTags()
    return sendSuccess(reply, tags)
  })

  fastify.get('/:slug/posts', async (request, reply) => {
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params)
    const query = z.object({
      cursor: z.string().cuid().optional(),
      limit:  z.coerce.number().int().min(1).max(50).default(20),
    }).parse(request.query)

    const result = await getPostsByTag({
      slug,
      limit: query.limit,
      ...(query.cursor !== undefined && { cursor: query.cursor }),
    })
    if (!result) return sendError(reply, 'Tag not found', 404)
    return sendSuccess(reply, result)
  })
}
