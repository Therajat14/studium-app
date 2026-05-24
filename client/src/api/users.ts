import { api } from '../utils/axiosInstance.js'
import type { UserProfile, PaginatedData, UserLinks } from '../types/index.js'

// ─── Query params ──────────────────────────────────────────────────────────

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  college?: string
  role?: 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN'
}

export interface UpdateProfilePayload {
  name?: string
  college?: string | null
  branch?: string | null
  year?: number | null
  bio?: string | null
  links?: UserLinks | null
}

// ─── API functions ─────────────────────────────────────────────────────────

export const usersApi = {
  list: async (params: UserListParams = {}): Promise<PaginatedData<UserProfile>> => {
    const { data } = await api.get<{ success: true; data: PaginatedData<UserProfile> }>('/users', { params })
    return data.data
  },

  getById: async (id: string): Promise<UserProfile> => {
    const { data } = await api.get<{ success: true; data: UserProfile }>(`/users/${id}`)
    return data.data
  },

  updateMe: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const { data } = await api.patch<{ success: true; data: UserProfile }>('/users/me', payload)
    return data.data
  },

  follow: async (id: string): Promise<void> => {
    await api.post(`/users/${id}/follow`)
  },

  unfollow: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}/follow`)
  },

  getFollowers: async (id: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedData<UserProfile>> => {
    const { data } = await api.get<{ success: true; data: PaginatedData<UserProfile> }>(`/users/${id}/followers`, { params })
    return data.data
  },

  getFollowing: async (id: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedData<UserProfile>> => {
    const { data } = await api.get<{ success: true; data: PaginatedData<UserProfile> }>(`/users/${id}/following`, { params })
    return data.data
  },
}
