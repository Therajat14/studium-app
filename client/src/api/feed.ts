import { api } from '../utils/axiosInstance.js'
import type { FeedResponse, FeedSort, PostType } from '../types/index.js'

export interface FeedParams {
  sort?: FeedSort
  cursor?: string
  limit?: number
  type?: PostType
}

export const feedApi = {
  get: async (params: FeedParams = {}): Promise<FeedResponse> => {
    const { data } = await api.get<{ success: true; data: FeedResponse }>('/feed', { params })
    return data.data
  },
}
