import { api } from '../utils/axiosInstance.js'
import type { Resource, ResourceListResponse } from '../types/index.js'

export interface ResourceListParams {
  type?: string
  subject?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateResourcePayload {
  title: string
  description?: string
  type: string
  url: string
  subject?: string
  course?: string
  tags?: string[]
}

export const knowledgeApi = {
  list: async (params: ResourceListParams = {}): Promise<ResourceListResponse> => {
    const { data } = await api.get<{ success: true; data: ResourceListResponse }>('/knowledge', { params })
    return data.data
  },

  create: async (payload: CreateResourcePayload): Promise<Resource> => {
    const { data } = await api.post<{ success: true; data: Resource }>('/knowledge', payload)
    return data.data
  },

  toggleBookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    const { data } = await api.post<{ success: true; data: { bookmarked: boolean } }>(`/knowledge/${id}/bookmark`)
    return data.data
  },

  rate: async (id: string, rating: number): Promise<void> => {
    await api.post(`/knowledge/${id}/rate`, { rating })
  },

  download: async (id: string): Promise<void> => {
    await api.post(`/knowledge/${id}/download`)
  },
}
