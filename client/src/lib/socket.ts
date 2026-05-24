import { io } from 'socket.io-client'
import { getAccessToken } from '../utils/axiosInstance.js'

// Strip the /api suffix from the API base URL to get the socket server root
const SOCKET_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined)?.replace('/api', '') ??
  'http://localhost:5000'

// autoConnect: false — we connect explicitly when the user authenticates
// auth as a callback — called on every connection attempt, so reconnects
// always use the latest access token without needing to reinitialize the socket
export const socket = io(SOCKET_URL, {
  autoConnect:    false,
  withCredentials: true,
  auth: (cb: (data: { token: string | null }) => void) => {
    cb({ token: getAccessToken() })
  },
})
