import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/axiosInstance.js'
import { socket } from '../lib/socket.js'
import { SocketEvent } from '../lib/socketEvents.js'

type PresenceMap = Record<string, boolean>

const fetchPresence = async (userIds: string[]): Promise<PresenceMap> => {
  if (userIds.length === 0) return {}
  const params = new URLSearchParams()
  userIds.forEach((id) => params.append('userIds[]', id))
  const { data } = await api.get<{ success: true; data: PresenceMap }>(
    `/users/presence?${params.toString()}`,
  )
  return data.data
}

/**
 * Returns presence state for a set of user IDs.
 * Initialised from REST; kept live via socket presence:online/offline events.
 */
export const usePresence = (userIds: string[]) => {
  const queryClient = useQueryClient()
  const key = ['presence', ...userIds.slice().sort()]

  const query = useQuery({
    queryKey: key,
    queryFn:  () => fetchPresence(userIds),
    staleTime: 30_000,
    enabled:  userIds.length > 0,
  })

  useEffect(() => {
    const handleOnline = (data: { userId: string }) => {
      queryClient.setQueryData<PresenceMap>(key, (old) =>
        old ? { ...old, [data.userId]: true } : old,
      )
    }
    const handleOffline = (data: { userId: string }) => {
      queryClient.setQueryData<PresenceMap>(key, (old) =>
        old ? { ...old, [data.userId]: false } : old,
      )
    }
    socket.on(SocketEvent.PRESENCE_ONLINE,  handleOnline)
    socket.on(SocketEvent.PRESENCE_OFFLINE, handleOffline)
    return () => {
      socket.off(SocketEvent.PRESENCE_ONLINE,  handleOnline)
      socket.off(SocketEvent.PRESENCE_OFFLINE, handleOffline)
    }
  }, [queryClient, key.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  return query
}
