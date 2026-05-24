import { z } from 'zod'

export const createPostSchema = z.object({
  title:    z.string().min(1).max(200).trim().optional(),
  content:  z.string().min(1).max(10000).trim(),
  type:     z.enum(['DISCUSSION', 'QUESTION', 'ANNOUNCEMENT', 'RESOURCE']).default('DISCUSSION'),
  tags:     z.array(z.string().min(1).max(50).trim().toLowerCase()).max(10).default([]),
  mediaIds: z.array(z.string().cuid()).max(10).default([]),
})

export const updatePostSchema = z.object({
  title:   z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).max(10000).trim().optional(),
  tags:    z.array(z.string().min(1).max(50).trim().toLowerCase()).max(10).optional(),
})

export const postIdParamSchema = z.object({
  id: z.string().cuid('Invalid post ID'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type PostIdParam     = z.infer<typeof postIdParamSchema>
