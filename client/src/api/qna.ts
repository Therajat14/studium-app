import { api } from '../utils/axiosInstance.js'
import type { QnaQuestion, QnaAnswer, QnaListResponse } from '../types/index.js'

export interface QnaListParams {
  filter?: 'latest' | 'trending' | 'unanswered' | 'bounty'
  search?: string
  page?: number
  limit?: number
}

export interface CreateQuestionPayload {
  title: string
  content: string
  tags?: string[]
  difficulty?: string
  bounty?: number
}

export interface CreateAnswerPayload {
  content: string
}

export const qnaApi = {
  list: async (params: QnaListParams = {}): Promise<QnaListResponse> => {
    const { data } = await api.get<{ success: true; data: QnaListResponse }>('/qna', { params })
    return data.data
  },

  getById: async (id: string): Promise<QnaQuestion> => {
    const { data } = await api.get<{ success: true; data: QnaQuestion }>(`/qna/${id}`)
    return data.data
  },

  create: async (payload: CreateQuestionPayload): Promise<QnaQuestion> => {
    const { data } = await api.post<{ success: true; data: QnaQuestion }>('/qna', payload)
    return data.data
  },

  vote: async (id: string, type: 'UP' | 'DOWN'): Promise<void> => {
    await api.post(`/qna/${id}/vote`, { type })
  },

  createAnswer: async (questionId: string, payload: CreateAnswerPayload): Promise<QnaAnswer> => {
    const { data } = await api.post<{ success: true; data: QnaAnswer }>(`/qna/${questionId}/answers`, payload)
    return data.data
  },

  acceptAnswer: async (answerId: string): Promise<void> => {
    await api.patch(`/qna/answers/${answerId}/accept`)
  },
}
