import type { FastifyInstance } from 'fastify'
import {
  listConversationsHandler,
  createConversationHandler,
  listMessagesHandler,
  sendMessageHandler,
  deleteMessageHandler,
  markReadHandler,
} from './messaging.controller.js'

export const messagingRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // All routes require authentication (preHandler added at app level)

  // Conversations
  fastify.get('/conversations',       listConversationsHandler)
  fastify.post('/conversations',      createConversationHandler)

  // Messages within a conversation
  fastify.get('/conversations/:id/messages',   listMessagesHandler)
  fastify.post('/conversations/:id/messages',  sendMessageHandler)
  fastify.patch('/conversations/:id/read',     markReadHandler)

  // Individual message operations
  fastify.delete('/:messageId', deleteMessageHandler)
}
