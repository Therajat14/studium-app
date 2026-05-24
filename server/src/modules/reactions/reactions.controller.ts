import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess, sendError } from '../../lib/response.js'
import { togglePostReaction, toggleCommentReaction } from './reactions.service.js'
import { toggleReactionSchema } from './reactions.schemas.js'
import type { ReactionType } from '@prisma/client'

export const togglePostReactionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: postId } = request.params as { id: string }
  const { type } = toggleReactionSchema.parse(request.body)
  try {
    const result = await togglePostReaction(request.user.sub, postId, type as ReactionType)
    return sendSuccess(reply, result)
  } catch (err: unknown) {
    if ((err as Error & { code?: string }).code === 'POST_NOT_FOUND') {
      return sendError(reply, 'Post not found', 404)
    }
    throw err
  }
}

export const toggleCommentReactionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: commentId } = request.params as { id: string }
  const { type } = toggleReactionSchema.parse(request.body)
  try {
    const result = await toggleCommentReaction(request.user.sub, commentId, type as ReactionType)
    return sendSuccess(reply, result)
  } catch (err: unknown) {
    if ((err as Error & { code?: string }).code === 'COMMENT_NOT_FOUND') {
      return sendError(reply, 'Comment not found', 404)
    }
    throw err
  }
}
