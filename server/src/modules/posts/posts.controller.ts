import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess, sendError } from '../../lib/response.js'
import { PostError, getPost, createNewPost, editPost, deletePost } from './posts.service.js'
import { createPostSchema, updatePostSchema, postIdParamSchema } from './posts.schemas.js'
import { emitNewPost } from '../../lib/socket/socket.gateway.js'
import type { Role } from '@prisma/client'

const handlePostError = (err: unknown, reply: FastifyReply) => {
  if (err instanceof PostError) {
    switch (err.code) {
      case 'POST_NOT_FOUND': return sendError(reply, 'Post not found', 404)
      case 'FORBIDDEN':      return sendError(reply, 'You do not have permission to modify this post', 403)
    }
  }
  throw err
}

export const getPostHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = postIdParamSchema.parse(request.params)
  try {
    const post = await getPost(id)
    return sendSuccess(reply, post)
  } catch (err) { return handlePostError(err, reply) }
}

export const createPostHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = createPostSchema.parse(request.body)
  const post = await createNewPost(request.user.sub, body)

  // Broadcast new post to everyone subscribed to the public feed room.
  // post may be null if findPostById races with the just-created row; in that
  // rare case we skip the socket event — the feed will catch it on next refetch.
  if (post) {
    emitNewPost({
      post: {
        id:        post.id,
        title:     post.title,
        content:   post.content,
        type:      post.type,
        createdAt: post.createdAt,
        author:    post.author,
        tags:      post.tags,
        _count:    post._count,
      },
    })
  }

  return sendSuccess(reply, post, 201)
}

export const updatePostHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = postIdParamSchema.parse(request.params)
  const body   = updatePostSchema.parse(request.body)
  try {
    const post = await editPost(request.user.sub, request.user.role as Role, id, body)
    return sendSuccess(reply, post)
  } catch (err) { return handlePostError(err, reply) }
}

export const deletePostHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = postIdParamSchema.parse(request.params)
  try {
    await deletePost(request.user.sub, request.user.role as Role, id)
    return sendSuccess(reply, { message: 'Post deleted' })
  } catch (err) { return handlePostError(err, reply) }
}
