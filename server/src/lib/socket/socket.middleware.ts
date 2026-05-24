import jwt from 'jsonwebtoken'
import type { Socket, ExtendedError } from 'socket.io'
import { env } from '../../config/env.js'

interface JwtPayload {
  sub:   string
  email: string
  role:  string
  iat?:  number
  exp?:  number
}

// Validates the JWT supplied in socket.handshake.auth.token.
// On success, attaches userId + role to socket.data for use in handlers.

export const socketAuthMiddleware = (
  socket: Socket,
  next:   (err?: ExtendedError) => void,
): void => {
  const token = socket.handshake.auth['token'] as string | undefined

  if (!token) {
    next(new Error('Authentication required'))
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    socket.data['userId'] = payload.sub
    socket.data['role']   = payload.role
    next()
  } catch {
    next(new Error('Invalid or expired token'))
  }
}
