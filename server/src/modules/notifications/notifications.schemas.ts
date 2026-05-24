import { z } from 'zod'

export const notificationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
})

export const notificationIdParamSchema = z.object({
  id: z.string().cuid(),
})

export type NotificationQuery = z.infer<typeof notificationQuerySchema>
