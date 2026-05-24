import { api } from '../utils/axiosInstance.js'
import type { Opportunity, OpportunityListResponse } from '../types/index.js'

export interface OpportunityListParams {
  type?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateOpportunityPayload {
  title: string
  description: string
  type: string
  company?: string
  location?: string
  salary?: string
  requirements?: string[]
  deadline?: string
  eventDate?: string
  url?: string
  maxAttendees?: number
  tags?: string[]
}

export const opportunitiesApi = {
  list: async (params: OpportunityListParams = {}): Promise<OpportunityListResponse> => {
    const { data } = await api.get<{ success: true; data: OpportunityListResponse }>('/opportunities', { params })
    return data.data
  },

  create: async (payload: CreateOpportunityPayload): Promise<Opportunity> => {
    const { data } = await api.post<{ success: true; data: Opportunity }>('/opportunities', payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/opportunities/${id}`)
  },
}
