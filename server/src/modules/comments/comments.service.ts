import {
  findCommentsByPost,
  findCommentById,
  createComment,
  updateComment,
  softDeleteComment,
} from './comments.repository.js'
import { prisma } from '../../config/prisma.js'
import type { CreateCommentInput, UpdateCommentInput, CommentQuery } from './comments.schemas.js'
import type { Role } from '@prisma/client'

export type CommentErrorCode =
  | 'COMMENT_NOT_FOUND'
  | 'POST_NOT_FOUND'
  | 'FORBIDDEN'
  | 'REPLY_DEPTH_EXCEEDED'
  | 'CROSS_POST_REPLY'

export class CommentError extends Error {
  constructor(public readonly code: CommentErrorCode) {
    super(code)
    this.name = 'CommentError'
  }
}

export const listComments = async (postId: string, query: CommentQuery) => {
  const post = await prisma.post.findUnique({ where: { id: postId, deletedAt: null } })
  if (!post) throw new CommentError('POST_NOT_FOUND')
  return findCommentsByPost({
    postId,
    limit: query.limit,
    ...(query.cursor !== undefined && { cursor: query.cursor }),
  })
}

export const addComment = async (
  authorId: string,
  postId:   string,
  input:    CreateCommentInput,
) => {
  const post = await prisma.post.findUnique({ where: { id: postId, deletedAt: null } })
  if (!post) throw new CommentError('POST_NOT_FOUND')

  if (input.parentId) {
    const parent = await findCommentById(input.parentId)
    if (!parent) throw new CommentError('COMMENT_NOT_FOUND')
    // Enforce max 1 level of nesting — parent must be top-level
    if (parent.parentId !== null) throw new CommentError('REPLY_DEPTH_EXCEEDED')
    // Parent must belong to the same post
    if (!('postId' in parent)) {
      const raw = await prisma.comment.findUnique({ where: { id: input.parentId }, select: { postId: true } })
      if (raw?.postId !== postId) throw new CommentError('CROSS_POST_REPLY')
    }
  }

  return createComment(authorId, postId, input)
}

export const editComment = async (
  callerId:  string,
  callerRole: Role,
  commentId: string,
  input:     UpdateCommentInput,
) => {
  const comment = await findCommentById(commentId)
  if (!comment) throw new CommentError('COMMENT_NOT_FOUND')
  if (comment.author.id !== callerId && callerRole !== 'ADMIN') throw new CommentError('FORBIDDEN')
  return updateComment(commentId, input)
}

export const removeComment = async (
  callerId:  string,
  callerRole: Role,
  commentId: string,
) => {
  const comment = await findCommentById(commentId)
  if (!comment) throw new CommentError('COMMENT_NOT_FOUND')
  if (comment.author.id !== callerId && callerRole !== 'ADMIN') throw new CommentError('FORBIDDEN')
  await softDeleteComment(commentId)
}
