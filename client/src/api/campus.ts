import { api } from '../utils/axiosInstance.js'
import type { CampusReview, CampusListResponse } from '../types/index.js'

export interface CampusListParams {
  category?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateReviewPayload {
  category: string
  title: string
  content: string
  rating: number
}

export const campusApi = {
  list: async (params: CampusListParams = {}): Promise<CampusListResponse> => {
    const { data } = await api.get<{ success: true; data: CampusListResponse }>('/campus', { params })
    return data.data
  },

  create: async (payload: CreateReviewPayload): Promise<CampusReview> => {
    const { data } = await api.post<{ success: true; data: CampusReview }>('/campus', payload)
    return data.data
  },

  vote: async (id: string, helpful: boolean): Promise<{ voted: boolean; helpful?: boolean }> => {
    const { data } = await api.post<{ success: true; data: { voted: boolean; helpful?: boolean } }>(`/campus/${id}/vote`, { helpful })
    return data.data
  },
}
