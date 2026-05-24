import { z } from 'zod'

export const createCommentSchema = z.object({
  content:  z.string().min(1).max(5000).trim(),
  parentId: z.string().cuid().optional(), // omit for top-level comment
})

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000).trim(),
})

export const commentQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
})

export const commentParamSchema = z.object({
  id: z.string().cuid('Invalid comment ID'),
})

export const postCommentParamSchema = z.object({
  postId: z.string().cuid('Invalid post ID'),
})

export type CreateCommentInput  = z.infer<typeof createCommentSchema>
export type UpdateCommentInput  = z.infer<typeof updateCommentSchema>
export type CommentQuery        = z.infer<typeof commentQuerySchema>
