import { z } from 'zod'

export const conversationIdParamSchema = z.object({
  id: z.string().min(1),
})

export const messageIdParamSchema = z.object({
  messageId: z.string().min(1),
})

export const createConversationSchema = z.object({
  participantId: z.string().min(1),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
})

export const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(30),
})
