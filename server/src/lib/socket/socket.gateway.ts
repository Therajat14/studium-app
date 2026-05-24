// Typed emit helpers — the only place in the codebase that calls io.to().emit().
// Controllers import these functions; they never access `io` directly.
// If the socket server hasn't been initialised yet (e.g. during tests),
// all emissions are silently no-ops.

import { getIo } from '../../config/socket.js'
import { SocketEvent } from './socket.events.js'
import type {
  NotificationPayload,
  NotificationCountPayload,
  FeedNewPostPayload,
  PostNewCommentPayload,
  PostReactionUpdatePayload,
  PresencePayload,
  TypingPayload,
} from './socket.events.js'

// ─── User room ─────────────────────────────────────────────────────────────

export const emitToUser = (
  userId: string,
  event:  string,
  data:   unknown,
): void => {
  getIo()?.to(`user:${userId}`).emit(event, data)
}

export const emitNotification = (
  targetUserId: string,
  notification: NotificationPayload,
): void => {
  getIo()?.to(`user:${targetUserId}`).emit(SocketEvent.NOTIFICATION_NEW, { notification })
}

export const emitUnreadCount = (
  targetUserId: string,
  payload:      NotificationCountPayload,
): void => {
  getIo()?.to(`user:${targetUserId}`).emit(SocketEvent.NOTIFICATION_COUNT, payload)
}

// ─── Post room ─────────────────────────────────────────────────────────────

export const emitToPost = (
  postId: string,
  event:  string,
  data:   unknown,
): void => {
  getIo()?.to(`post:${postId}`).emit(event, data)
}

export const emitNewComment = (payload: PostNewCommentPayload): void => {
  getIo()
    ?.to(`post:${payload.postId}`)
    .emit(SocketEvent.POST_NEW_COMMENT, payload)
}

export const emitReactionUpdate = (payload: PostReactionUpdatePayload): void => {
  getIo()
    ?.to(`post:${payload.postId}`)
    .emit(SocketEvent.POST_REACTION_UPDATE, payload)
}

// ─── Feed room ─────────────────────────────────────────────────────────────

export const emitNewPost = (payload: FeedNewPostPayload): void => {
  getIo()?.to('feed:public').emit(SocketEvent.FEED_NEW_POST, payload)
}

// ─── Presence ──────────────────────────────────────────────────────────────

export const emitPresenceOnline  = (payload: PresencePayload): void => {
  getIo()?.to('feed:public').emit(SocketEvent.PRESENCE_ONLINE, payload)
}

export const emitPresenceOffline = (payload: PresencePayload): void => {
  getIo()?.to('feed:public').emit(SocketEvent.PRESENCE_OFFLINE, payload)
}

// ─── Typing (relayed from client → post room, excluding sender) ────────────

export const relayTypingStart = (
  socket: { id: string },
  payload: TypingPayload,
): void => {
  getIo()
    ?.to(`post:${payload.postId}`)
    .except(socket.id)
    .emit(SocketEvent.TYPING_START, payload)
}

export const relayTypingStop = (
  socket: { id: string },
  payload: TypingPayload,
): void => {
  getIo()
    ?.to(`post:${payload.postId}`)
    .except(socket.id)
    .emit(SocketEvent.TYPING_STOP, payload)
}
