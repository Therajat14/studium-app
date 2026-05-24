import { useEffect } from 'react'
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { notificationsApi } from '../api/notifications.js'
import { socket } from '../lib/socket.js'
import { SocketEvent } from '../lib/socketEvents.js'
import type { Notification, NotificationsResponse } from '../types/index.js'

// ─── Unread count ──────────────────────────────────────────────────────────
// Initialised from REST on mount; kept live via socket notification:count events.

export const useUnreadCount = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn:  notificationsApi.getUnreadCount,
    staleTime: 30_000,
  })

  useEffect(() => {
    const handler = (data: { unread: number }) => {
      queryClient.setQueryData<number>(['notifications', 'unread'], data.unread)
    }
    socket.on(SocketEvent.NOTIFICATION_COUNT, handler)
    return () => { socket.off(SocketEvent.NOTIFICATION_COUNT, handler) }
  }, [queryClient])

  return query
}

// ─── Paginated list ────────────────────────────────────────────────────────
// New notifications from socket are prepended to the first page.

export const useNotifications = () => {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey:    ['notifications', 'list'],
    queryFn:     ({ pageParam }) =>
      notificationsApi.list({ cursor: pageParam ?? undefined, limit: 20 }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    staleTime:   60_000,
  })

  // Prepend incoming notification to the in-memory cache — no refetch needed
  useEffect(() => {
    const handler = (data: { notification: Notification }) => {
      queryClient.setQueryData<{ pages: NotificationsResponse[]; pageParams: unknown[] }>(
        ['notifications', 'list'],
        (old) => {
          if (!old) return old
          const firstPage = old.pages[0]
          if (!firstPage) return old
          return {
            ...old,
            pages: [
              { ...firstPage, items: [data.notification, ...firstPage.items] },
              ...old.pages.slice(1),
            ],
          }
        },
      )
    }
    socket.on(SocketEvent.NOTIFICATION_NEW, handler)
    return () => { socket.off(SocketEvent.NOTIFICATION_NEW, handler) }
  }, [queryClient])

  return query
}

// ─── Mark read ─────────────────────────────────────────────────────────────

export const useMarkRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: (data) => {
      queryClient.setQueryData(['notifications', 'unread'], data.unread)
      // Patch the specific notification's readAt in the list cache
      queryClient.setQueryData<{ pages: NotificationsResponse[]; pageParams: unknown[] }>(
        ['notifications', 'list'],
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((n) =>
                n.id === undefined ? n : { ...n, readAt: new Date().toISOString() },
              ),
            })),
          }
        },
      )
    },
  })
}

export const useMarkAllRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(['notifications', 'unread'], 0)
      // Mark all cached notifications as read
      queryClient.setQueryData<{ pages: NotificationsResponse[]; pageParams: unknown[] }>(
        ['notifications', 'list'],
        (old) => {
          if (!old) return old
          const now = new Date().toISOString()
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((n) => ({ ...n, readAt: n.readAt ?? now })),
            })),
          }
        },
      )
    },
  })
}
