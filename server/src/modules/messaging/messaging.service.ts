import {
  findDirectConversation,
  createDirectConversation,
  findUserConversations,
  isParticipant,
  findMessages,
  createMessage,
  softDeleteMessage,
  findMessageById,
  markConversationRead,
} from './messaging.repository.js'
import {
  emitChatMessageNew,
  emitChatMessageDeleted,
  emitChatReadReceipt,
} from '../../lib/socket/socket.gateway.js'

// ─── Custom errors ─────────────────────────────────────────────────────────

export class MessagingError extends Error {
  constructor(
    public readonly code:
      | 'CONVERSATION_NOT_FOUND'
      | 'MESSAGE_NOT_FOUND'
      | 'FORBIDDEN'
      | 'ALREADY_DELETED',
    message: string,
  ) {
    super(message)
    this.name = 'MessagingError'
  }
}

// ─── Conversations ─────────────────────────────────────────────────────────

export const getOrCreateDirectConversation = async (
  callerId:      string,
  participantId: string,
) => {
  const existing = await findDirectConversation(callerId, participantId)
  if (existing) return existing
  return createDirectConversation(callerId, participantId)
}

export const listConversations = async (userId: string) => {
  return findUserConversations(userId)
}

// ─── Messages ──────────────────────────────────────────────────────────────

export const getMessages = async (
  conversationId: string,
  userId:         string,
  limit:          number,
  cursor?:        string,
) => {
  const ok = await isParticipant(conversationId, userId)
  if (!ok) throw new MessagingError('CONVERSATION_NOT_FOUND', 'Conversation not found')
  return findMessages(conversationId, limit, cursor)
}

export const sendMessage = async (
  conversationId: string,
  senderId:       string,
  content:        string,
) => {
  const ok = await isParticipant(conversationId, senderId)
  if (!ok) throw new MessagingError('CONVERSATION_NOT_FOUND', 'Conversation not found')

  const message = await createMessage(conversationId, senderId, content)
  emitChatMessageNew({ conversationId, message })
  return message
}

export const deleteMessage = async (messageId: string, userId: string) => {
  const msg = await findMessageById(messageId)
  if (!msg || msg.deletedAt !== null) {
    throw new MessagingError('MESSAGE_NOT_FOUND', 'Message not found')
  }
  if (msg.senderId !== userId) {
    throw new MessagingError('FORBIDDEN', 'You can only delete your own messages')
  }
  await softDeleteMessage(messageId)
  emitChatMessageDeleted({ conversationId: msg.conversationId, messageId })
}

export const readConversation = async (conversationId: string, userId: string) => {
  const ok = await isParticipant(conversationId, userId)
  if (!ok) throw new MessagingError('CONVERSATION_NOT_FOUND', 'Conversation not found')
  const participant = await markConversationRead(conversationId, userId)
  emitChatReadReceipt({
    conversationId,
    userId,
    lastReadAt: participant.lastReadAt ?? new Date(),
  })
}
