import { api } from '../utils/axiosInstance.js'
import type { NotificationsResponse } from '../types/index.js'

export const notificationsApi = {
  list: async (params: { cursor?: string; limit?: number } = {}): Promise<NotificationsResponse> => {
    const { data } = await api.get<{ success: true; data: NotificationsResponse }>(
      '/notifications',
      { params },
    )
    return data.data
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<{ success: true; data: { unread: number } }>(
      '/notifications/unread-count',
    )
    return data.data.unread
  },

  markRead: async (id: string): Promise<{ unread: number }> => {
    const { data } = await api.patch<{ success: true; data: { unread: number } }>(
      `/notifications/${id}/read`,
    )
    return data.data
  },

  markAllRead: async (): Promise<{ unread: number }> => {
    const { data } = await api.patch<{ success: true; data: { unread: number } }>(
      '/notifications/read-all',
    )
    return data.data
  },
}
