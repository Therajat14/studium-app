import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import type { FastifyInstance } from 'fastify'
import { env } from './env.js'
import { createRedisClient } from './redis.js'
import { socketAuthMiddleware } from '../lib/socket/socket.middleware.js'
import { SocketEvent } from '../lib/socket/socket.events.js'
import { addConnection, removeConnection } from '../lib/socket/presence.store.js'
import {
  emitPresenceOnline,
  emitPresenceOffline,
  relayTypingStart,
  relayTypingStop,
  relayChatTypingStart,
  relayChatTypingStop,
} from '../lib/socket/socket.gateway.js'

// Module-level singleton — null until createSocketServer() is called.
let _io: Server | null = null

/** Returns the Socket.IO server instance, or null if not yet initialised. */
export const getIo = (): Server | null => _io

/**
 * Attaches a Socket.IO server to the Fastify HTTP server.
 * Must be called after app.listen() so app.server is bound.
 */
export const createSocketServer = async (app: FastifyInstance): Promise<Server> => {
  const io = new Server(app.server, {
    cors: {
      origin:      env.CORS_ORIGIN,
      credentials: true,
    },
    transports:   ['websocket', 'polling'],
    pingTimeout:  20_000,
    pingInterval: 25_000,
  })

  // Redis adapter for horizontal scaling — each process shares rooms + events
  const pubClient = createRedisClient()
  const subClient = createRedisClient()
  await Promise.all([pubClient.connect(), subClient.connect()])
  io.adapter(createAdapter(pubClient, subClient))

  _io = io

  // JWT authentication at handshake
  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string

    // Every authenticated user joins their private room + the public feed room
    void socket.join(`user:${userId}`)
    void socket.join('feed:public')

    // Presence — async Redis-backed
    void (async () => {
      const cameOnline = await addConnection(userId, socket.id)
      if (cameOnline) emitPresenceOnline({ userId })
    })()

    // ─── Client-driven post room management ─────────────────────────────
    socket.on(SocketEvent.ROOM_JOIN_POST, (data: unknown) => {
      const postId = (data as { postId?: string }).postId
      if (typeof postId === 'string') void socket.join(`post:${postId}`)
    })

    socket.on(SocketEvent.ROOM_LEAVE_POST, (data: unknown) => {
      const postId = (data as { postId?: string }).postId
      if (typeof postId === 'string') void socket.leave(`post:${postId}`)
    })

    // ─── Client-driven conversation room management ──────────────────────
    socket.on(SocketEvent.ROOM_JOIN_CONVERSATION, (data: unknown) => {
      const conversationId = (data as { conversationId?: string }).conversationId
      if (typeof conversationId === 'string') void socket.join(`conversation:${conversationId}`)
    })

    socket.on(SocketEvent.ROOM_LEAVE_CONVERSATION, (data: unknown) => {
      const conversationId = (data as { conversationId?: string }).conversationId
      if (typeof conversationId === 'string') void socket.leave(`conversation:${conversationId}`)
    })

    // ─── Post typing indicators (ephemeral relay, never persisted) ───────
    socket.on(SocketEvent.TYPING_START, (data: unknown) => {
      const postId = (data as { postId?: string }).postId
      if (typeof postId === 'string') {
        relayTypingStart(socket, { postId, userId })
      }
    })

    socket.on(SocketEvent.TYPING_STOP, (data: unknown) => {
      const postId = (data as { postId?: string }).postId
      if (typeof postId === 'string') {
        relayTypingStop(socket, { postId, userId })
      }
    })

    // ─── Chat typing indicators (ephemeral relay, never persisted) ───────
    socket.on(SocketEvent.CHAT_TYPING_START, (data: unknown) => {
      const conversationId = (data as { conversationId?: string }).conversationId
      if (typeof conversationId === 'string') {
        relayChatTypingStart(socket, { conversationId, userId })
      }
    })

    socket.on(SocketEvent.CHAT_TYPING_STOP, (data: unknown) => {
      const conversationId = (data as { conversationId?: string }).conversationId
      if (typeof conversationId === 'string') {
        relayChatTypingStop(socket, { conversationId, userId })
      }
    })

    // ─── Disconnect ──────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      void (async () => {
        const wentOffline = await removeConnection(userId, socket.id)
        if (wentOffline) emitPresenceOffline({ userId })
      })()
    })
  })

  app.log.info('Socket.IO server attached (Redis adapter)')
  return io
}
