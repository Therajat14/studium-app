import { z } from 'zod'

export const toggleReactionSchema = z.object({
  type: z.enum(['LIKE', 'UPVOTE']).default('LIKE'),
})

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>
