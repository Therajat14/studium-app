import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.js'
import type { Conversation } from '../types/index.js'

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn:  messagingApi.listConversations,
    staleTime: 30_000,
  })

export const useGetOrCreateConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) =>
      messagingApi.getOrCreateConversation(participantId),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (old) => {
          if (!old) return [conversation]
          if (old.some((c) => c.id === conversation.id)) return old
          return [conversation, ...old]
        },
      )
    },
  })
}
