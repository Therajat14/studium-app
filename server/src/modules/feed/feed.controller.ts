import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess } from '../../lib/response.js'
import { getFeed } from './feed.service.js'
import { feedQuerySchema } from './feed.schemas.js'

export const getFeedHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = feedQuerySchema.parse(request.query)
  // userId is null for unauthenticated requests — following feed falls back to latest
  const userId = request.user?.sub ?? null
  const result = await getFeed(userId, query)
  return sendSuccess(reply, result)
}
