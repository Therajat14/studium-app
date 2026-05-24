import { api } from '../utils/axiosInstance.js'
import type { Conversation, MessagesResponse, Message } from '../types/index.js'

type ApiWrap<T> = { success: true; data: T }

export const messagingApi = {
  listConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<ApiWrap<Conversation[]>>('/messages/conversations')
    return data.data
  },

  getOrCreateConversation: async (participantId: string): Promise<Conversation> => {
    const { data } = await api.post<ApiWrap<Conversation>>('/messages/conversations', { participantId })
    return data.data
  },

  listMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 30,
  ): Promise<MessagesResponse> => {
    const { data } = await api.get<ApiWrap<MessagesResponse>>(
      `/messages/conversations/${conversationId}/messages`,
      { params: { ...(cursor !== undefined && { cursor }), limit } },
    )
    return data.data
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const { data } = await api.post<ApiWrap<Message>>(
      `/messages/conversations/${conversationId}/messages`,
      { content },
    )
    return data.data
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`)
  },

  markRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${conversationId}/read`)
  },
}
