import { api } from '../utils/axiosInstance.js'
import type { AuthResponse, User } from '../types/index.js'

// All API functions return the inner `data` payload — the envelope
// (success/error wrapping) is handled by the axios interceptors and
// the error boundary in AuthContext.

interface RegisterPayload {
  name: string
  email: string
  password: string
  rollNumber?: string
  college?: string
  branch?: string
  year?: number
  bio?: string
  skills?: string[]
  links?: { github?: string; linkedin?: string; portfolio?: string }
}

interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>('/auth/register', payload)
    return data.data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>('/auth/login', payload)
    return data.data
  },

  // Called on page load to restore session from the httpOnly refresh token cookie
  refresh: async (): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>('/auth/refresh', {})
    return data.data
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<{ success: true; data: { user: User } }>('/auth/me')
    return data.data.user
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout', {})
  },
}
