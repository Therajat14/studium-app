import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess, sendError } from '../../lib/response.js'
import {
  CommentError,
  listComments,
  addComment,
  editComment,
  removeComment,
} from './comments.service.js'
import {
  createCommentSchema,
  updateCommentSchema,
  commentQuerySchema,
  commentParamSchema,
  postCommentParamSchema,
} from './comments.schemas.js'
import { emitNewComment } from '../../lib/socket/socket.gateway.js'
import {
  createCommentNotification,
  createReplyNotification,
} from '../notifications/notifications.service.js'
import type { Role } from '@prisma/client'

const handleCommentError = (err: unknown, reply: FastifyReply) => {
  if (err instanceof CommentError) {
    switch (err.code) {
      case 'COMMENT_NOT_FOUND':    return sendError(reply, 'Comment not found', 404)
      case 'POST_NOT_FOUND':       return sendError(reply, 'Post not found', 404)
      case 'FORBIDDEN':            return sendError(reply, 'You do not have permission to modify this comment', 403)
      case 'REPLY_DEPTH_EXCEEDED': return sendError(reply, 'Replies can only be one level deep', 400)
      case 'CROSS_POST_REPLY':     return sendError(reply, 'Parent comment belongs to a different post', 400)
    }
  }
  throw err
}

export const listCommentsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { postId } = postCommentParamSchema.parse(request.params)
  const query = commentQuerySchema.parse(request.query)
  try {
    const result = await listComments(postId, query)
    return sendSuccess(reply, result)
  } catch (err) { return handleCommentError(err, reply) }
}

export const createCommentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { postId } = postCommentParamSchema.parse(request.params)
  const body = createCommentSchema.parse(request.body)
  try {
    const comment = await addComment(request.user.sub, postId, body)

    // Emit to anyone viewing this post in realtime
    emitNewComment({ postId, comment })

    // Notification (fire-and-forget — never block the response)
    if (body.parentId) {
      void createReplyNotification(request.user.sub, body.parentId, comment.id)
    } else {
      void createCommentNotification(request.user.sub, postId, comment.id)
    }

    return sendSuccess(reply, comment, 201)
  } catch (err) { return handleCommentError(err, reply) }
}

export const updateCommentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = commentParamSchema.parse(request.params)
  const body = updateCommentSchema.parse(request.body)
  try {
    const comment = await editComment(request.user.sub, request.user.role as Role, id, body)
    return sendSuccess(reply, comment)
  } catch (err) { return handleCommentError(err, reply) }
}

export const deleteCommentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = commentParamSchema.parse(request.params)
  try {
    await removeComment(request.user.sub, request.user.role as Role, id)
    return sendSuccess(reply, { message: 'Comment deleted' })
  } catch (err) { return handleCommentError(err, reply) }
}
