import { api } from '../utils/axiosInstance.js'
import type { Media } from '../types/index.js'

export const uploadApi = {
  upload: async (file: File): Promise<Media> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ success: true; data: Media }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/upload/${id}`)
  },
}
