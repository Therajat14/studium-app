import {
  findPostById,
  createPost,
  updatePost,
  softDeletePost,
  incrementViewCount,
} from './posts.repository.js'
import type { CreatePostInput, UpdatePostInput } from './posts.schemas.js'
import type { Role } from '@prisma/client'

export type PostErrorCode =
  | 'POST_NOT_FOUND'
  | 'FORBIDDEN'

export class PostError extends Error {
  constructor(public readonly code: PostErrorCode) {
    super(code)
    this.name = 'PostError'
  }
}

export const getPost = async (id: string) => {
  const post = await findPostById(id)
  if (!post) throw new PostError('POST_NOT_FOUND')
  // Fire-and-forget view count increment — non-critical
  void incrementViewCount(id)
  return post
}

export const createNewPost = async (authorId: string, input: CreatePostInput) =>
  createPost(authorId, {
    content:  input.content,
    type:     input.type,
    tagNames: input.tags,
    mediaIds: input.mediaIds,
    ...(input.title !== undefined && { title: input.title }),
  })

export const editPost = async (
  callerId: string,
  callerRole: Role,
  postId: string,
  input: UpdatePostInput,
) => {
  const post = await findPostById(postId)
  if (!post) throw new PostError('POST_NOT_FOUND')
  if (post.author.id !== callerId && callerRole !== 'ADMIN') throw new PostError('FORBIDDEN')
  return updatePost(postId, input)
}

export const deletePost = async (
  callerId: string,
  callerRole: Role,
  postId: string,
) => {
  const post = await findPostById(postId)
  if (!post) throw new PostError('POST_NOT_FOUND')
  if (post.author.id !== callerId && callerRole !== 'ADMIN') throw new PostError('FORBIDDEN')
  await softDeletePost(postId)
}
