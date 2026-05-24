import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi, type CreatePostPayload } from '../api/posts.js'

export const usePost = (id: string) =>
  useQuery({
    queryKey: ['post', id],
    queryFn:  () => postsApi.get(id),
    enabled:  !!id,
  })

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsApi.create(payload),
    onSuccess: () => {
      // Invalidate all feed variants so new post appears
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
