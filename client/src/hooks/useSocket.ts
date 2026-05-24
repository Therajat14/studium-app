import { useEffect } from 'react'
import { useAuth } from './useAuth.js'
import { socket } from '../lib/socket.js'

/**
 * Manages the Socket.IO connection lifecycle.
 * - Connects when a user is authenticated.
 * - Disconnects on logout / component unmount.
 * - Reconnects automatically use the latest access token because `auth` is a
 *   callback (not a plain object) in the socket singleton.
 *
 * Mount this once inside the authenticated shell (Dashboard).
 */
export const useSocket = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [user?.id]) // re-run only when the logged-in user identity changes
}
