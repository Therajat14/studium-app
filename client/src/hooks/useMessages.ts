import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { messagingApi } from '../api/messaging.js'
import { socket } from '../lib/socket.js'
import { SocketEvent } from '../lib/socketEvents.js'
import type { MessagesResponse, Message } from '../types/index.js'

export const useMessages = (conversationId: string) =>
  useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn:  ({ pageParam }) =>
      messagingApi.listMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor,
    staleTime: 30_000,
    enabled:   conversationId !== '',
  })

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => messagingApi.sendMessage(conversationId, content),
    onSuccess:  () => {
      // Socket event will update the cache; invalidate as fallback
      void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })
}

export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => messagingApi.deleteMessage(messageId),
    onSuccess:  () => {
      void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })
}

export const useMarkRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.markRead(conversationId),
    onSuccess:  () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

/** Wires up socket events for a conversation room. */
export const useChatSocket = (conversationId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    socket.emit(SocketEvent.ROOM_JOIN_CONVERSATION, { conversationId })
    return () => {
      socket.emit(SocketEvent.ROOM_LEAVE_CONVERSATION, { conversationId })
    }
  }, [conversationId])

  useEffect(() => {
    const onNew = (payload: { conversationId: string; message: Message }) => {
      if (payload.conversationId !== conversationId) return
      queryClient.setQueryData<{ pages: MessagesResponse[]; pageParams: unknown[] }>(
        ['messages', conversationId],
        (old) => {
          if (!old) return old
          const firstPage = old.pages[0]
          if (!firstPage) return old
          if (firstPage.items.some((m) => m.id === payload.message.id)) return old
          return {
            ...old,
            pages: [
              { ...firstPage, items: [payload.message, ...firstPage.items] },
              ...old.pages.slice(1),
            ],
          }
        },
      )
    }

    const onDeleted = (payload: { conversationId: string; messageId: string }) => {
      if (payload.conversationId !== conversationId) return
      void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    }

    socket.on(SocketEvent.CHAT_MESSAGE_NEW, onNew)
    socket.on(SocketEvent.CHAT_MESSAGE_DELETED, onDeleted)
    return () => {
      socket.off(SocketEvent.CHAT_MESSAGE_NEW, onNew)
      socket.off(SocketEvent.CHAT_MESSAGE_DELETED, onDeleted)
    }
  }, [conversationId, queryClient])
}
