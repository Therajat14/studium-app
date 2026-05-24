import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '../api/comments.js'

export const useComments = (postId: string) =>
  useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) =>
      commentsApi.list(postId, { cursor: pageParam ?? undefined, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: !!postId,
  })

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { content: string; parentId?: string }) =>
      commentsApi.create(postId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      // Also refresh the post's comment count in feed
      void queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
