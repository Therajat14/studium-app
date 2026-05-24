import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess, sendError } from '../../lib/response.js'
import {
  MessagingError,
  getOrCreateDirectConversation,
  listConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  readConversation,
} from './messaging.service.js'
import {
  conversationIdParamSchema,
  messageIdParamSchema,
  createConversationSchema,
  sendMessageSchema,
  cursorQuerySchema,
} from './messaging.schemas.js'

const handleMessagingError = (err: unknown, reply: FastifyReply) => {
  if (err instanceof MessagingError) {
    switch (err.code) {
      case 'CONVERSATION_NOT_FOUND': return sendError(reply, 'Conversation not found', 404)
      case 'MESSAGE_NOT_FOUND':      return sendError(reply, 'Message not found', 404)
      case 'FORBIDDEN':              return sendError(reply, err.message, 403)
      case 'ALREADY_DELETED':        return sendError(reply, 'Message already deleted', 410)
    }
  }
  throw err
}

export const listConversationsHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const conversations = await listConversations(request.user.sub)
  return sendSuccess(reply, conversations)
}

export const createConversationHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const { participantId } = createConversationSchema.parse(request.body)
  const conversation = await getOrCreateDirectConversation(request.user.sub, participantId)
  return sendSuccess(reply, conversation, 200)
}

export const listMessagesHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const { id }          = conversationIdParamSchema.parse(request.params)
  const { cursor, limit } = cursorQuerySchema.parse(request.query)
  try {
    const result = await getMessages(id, request.user.sub, limit, cursor)
    return sendSuccess(reply, result)
  } catch (err) { return handleMessagingError(err, reply) }
}

export const sendMessageHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const { id }      = conversationIdParamSchema.parse(request.params)
  const { content } = sendMessageSchema.parse(request.body)
  try {
    const message = await sendMessage(id, request.user.sub, content)
    return sendSuccess(reply, message, 201)
  } catch (err) { return handleMessagingError(err, reply) }
}

export const deleteMessageHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const { messageId } = messageIdParamSchema.parse(request.params)
  try {
    await deleteMessage(messageId, request.user.sub)
    return sendSuccess(reply, { message: 'Message deleted' })
  } catch (err) { return handleMessagingError(err, reply) }
}

export const markReadHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const { id } = conversationIdParamSchema.parse(request.params)
  try {
    await readConversation(id, request.user.sub)
    return sendSuccess(reply, { ok: true })
  } catch (err) { return handleMessagingError(err, reply) }
}
