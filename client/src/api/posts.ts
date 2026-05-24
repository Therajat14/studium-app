import { api } from '../utils/axiosInstance.js'
import type { Post, ReactionResult, ReactionType } from '../types/index.js'

export interface CreatePostPayload {
  title?: string
  content: string
  type?: 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT' | 'RESOURCE'
  tags?: string[]
  mediaIds?: string[]
}

export interface UpdatePostPayload {
  title?: string
  content?: string
  tags?: string[]
}

export const postsApi = {
  get: async (id: string): Promise<Post> => {
    const { data } = await api.get<{ success: true; data: Post }>(`/posts/${id}`)
    return data.data
  },

  create: async (payload: CreatePostPayload): Promise<Post> => {
    const { data } = await api.post<{ success: true; data: Post }>('/posts', payload)
    return data.data
  },

  update: async (id: string, payload: UpdatePostPayload): Promise<Post> => {
    const { data } = await api.patch<{ success: true; data: Post }>(`/posts/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`)
  },

  toggleReaction: async (id: string, type: ReactionType = 'LIKE'): Promise<ReactionResult> => {
    const { data } = await api.post<{ success: true; data: ReactionResult }>(
      `/posts/${id}/reactions`,
      { type },
    )
    return data.data
  },

  toggleBookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    const { data } = await api.post<{ success: true; data: { bookmarked: boolean } }>(`/posts/${id}/bookmark`)
    return data.data
  },

  getBookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    const { data } = await api.get<{ success: true; data: { bookmarked: boolean } }>(`/posts/${id}/bookmark`)
    return data.data
  },
}
