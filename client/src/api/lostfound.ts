import { api } from '../utils/axiosInstance.js'
import type { LostFoundItem, LostFoundListResponse, LostFoundClaim } from '../types/index.js'

export interface LostFoundListParams {
  type?: string
  category?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateItemPayload {
  type: string
  category: string
  title: string
  description: string
  location?: string
  imageUrl?: string
  contactInfo?: string
}

export const lostFoundApi = {
  list: async (params: LostFoundListParams = {}): Promise<LostFoundListResponse> => {
    const { data } = await api.get<{ success: true; data: LostFoundListResponse }>('/lostfound', { params })
    return data.data
  },

  getById: async (id: string): Promise<LostFoundItem> => {
    const { data } = await api.get<{ success: true; data: LostFoundItem }>(`/lostfound/${id}`)
    return data.data
  },

  create: async (payload: CreateItemPayload): Promise<LostFoundItem> => {
    const { data } = await api.post<{ success: true; data: LostFoundItem }>('/lostfound', payload)
    return data.data
  },

  resolve: async (id: string): Promise<LostFoundItem> => {
    const { data } = await api.patch<{ success: true; data: LostFoundItem }>(`/lostfound/${id}/resolve`)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lostfound/${id}`)
  },

  claim: async (id: string, message: string): Promise<LostFoundClaim> => {
    const { data } = await api.post<{ success: true; data: LostFoundClaim }>(`/lostfound/${id}/claim`, { message })
    return data.data
  },
}
