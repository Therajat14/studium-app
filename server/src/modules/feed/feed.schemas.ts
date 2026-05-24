import { z } from 'zod'

export const feedQuerySchema = z.object({
  sort:    z.enum(['latest', 'trending', 'following']).default('latest'),
  cursor:  z.string().cuid().optional(), // post ID cursor for latest/following
  page:    z.coerce.number().int().positive().default(1), // used only for trending
  limit:   z.coerce.number().int().min(1).max(50).default(20),
  type:    z.enum(['DISCUSSION', 'QUESTION', 'ANNOUNCEMENT', 'RESOURCE']).optional(),
  college: z.string().optional(), // scope: filter posts by author's college
  branch:  z.string().optional(), // scope: further filter by author's branch
})

export type FeedQuery = z.infer<typeof feedQuerySchema>
