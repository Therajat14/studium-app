import { api } from '../utils/axiosInstance.js'
import type { Tag, Post } from '../types/index.js'

export interface TagWithCount extends Tag {
  _count: { posts: number }
}

export interface TagPostsResponse {
  tag: Tag
  items: Post[]
  nextCursor: string | null
  hasMore: boolean
}

export const tagsApi = {
  list: async (): Promise<TagWithCount[]> => {
    const { data } = await api.get<{ success: true; data: TagWithCount[] }>('/tags')
    return data.data
  },

  getPostsByTag: async (slug: string, params: { cursor?: string; limit?: number } = {}): Promise<TagPostsResponse> => {
    const { data } = await api.get<{ success: true; data: TagPostsResponse }>(`/tags/${slug}/posts`, { params })
    return data.data
  },
}
