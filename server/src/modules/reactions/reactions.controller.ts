import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess, sendError } from '../../lib/response.js'
import { togglePostReaction, toggleCommentReaction } from './reactions.service.js'
import { toggleReactionSchema } from './reactions.schemas.js'
import { emitReactionUpdate } from '../../lib/socket/socket.gateway.js'
import {
  createPostReactionNotification,
  createCommentReactionNotification,
} from '../notifications/notifications.service.js'
import type { ReactionType } from '@prisma/client'

export const togglePostReactionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: postId } = request.params as { id: string }
  const { type } = toggleReactionSchema.parse(request.body)
  try {
    const result = await togglePostReaction(request.user.sub, postId, type as ReactionType)

    // Broadcast updated reaction counts to anyone viewing this post
    emitReactionUpdate({ postId, counts: result.counts })

    // Only notify on toggle-on (reacted === true), not on remove
    if (result.reacted) {
      void createPostReactionNotification(request.user.sub, postId)
    }

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

    if (result.reacted) {
      void createCommentReactionNotification(request.user.sub, commentId)
    }

    return sendSuccess(reply, result)
  } catch (err: unknown) {
    if ((err as Error & { code?: string }).code === 'COMMENT_NOT_FOUND') {
      return sendError(reply, 'Comment not found', 404)
    }
    throw err
  }
}
