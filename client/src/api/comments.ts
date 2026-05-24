import { api } from '../utils/axiosInstance.js'
import type { Comment, ReactionResult, ReactionType } from '../types/index.js'

export interface CommentsResponse {
  items: Comment[]
  nextCursor: string | null
}

export const commentsApi = {
  list: async (postId: string, params: { cursor?: string; limit?: number } = {}): Promise<CommentsResponse> => {
    const { data } = await api.get<{ success: true; data: CommentsResponse }>(
      `/posts/${postId}/comments`,
      { params },
    )
    return data.data
  },

  create: async (postId: string, payload: { content: string; parentId?: string }): Promise<Comment> => {
    const { data } = await api.post<{ success: true; data: Comment }>(
      `/posts/${postId}/comments`,
      payload,
    )
    return data.data
  },

  update: async (id: string, content: string): Promise<Comment> => {
    const { data } = await api.patch<{ success: true; data: Comment }>(`/comments/${id}`, { content })
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },

  toggleReaction: async (id: string, type: ReactionType = 'LIKE'): Promise<ReactionResult> => {
    const { data } = await api.post<{ success: true; data: ReactionResult }>(
      `/comments/${id}/reactions`,
      { type },
    )
    return data.data
  },
}
