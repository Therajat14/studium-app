import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '../api/posts.js'
import { commentsApi } from '../api/comments.js'
import type { FeedResponse, ReactionType } from '../types/index.js'

// ─── Post reaction — optimistic update ────────────────────────────────────

export const useTogglePostReaction = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: ReactionType = 'LIKE') => postsApi.toggleReaction(postId, type),

    onMutate: async (type: ReactionType = 'LIKE') => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const snapshots = queryClient.getQueriesData<{ pages: FeedResponse[] }>({ queryKey: ['feed'] })

      // Optimistically toggle the reaction count on every feed page
      queryClient.setQueriesData<{ pages: FeedResponse[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) => {
                if (post.id !== postId) return post
                const delta = 1 // we don't know current state without extra query; server is authoritative
                return {
                  ...post,
                  _count: { ...post._count, reactions: post._count.reactions + delta },
                }
              }),
            })),
          }
        },
      )

      return { snapshots, type }
    },

    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.snapshots) {
        for (const [key, data] of context.snapshots) {
          queryClient.setQueryData(key, data)
        }
      }
    },

    onSettled: () => {
      // Let the server be authoritative after mutation settles
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
      void queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

// ─── Comment reaction ─────────────────────────────────────────────────────

export const useToggleCommentReaction = (commentId: string, postId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: ReactionType = 'LIKE') => commentsApi.toggleReaction(commentId, type),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
