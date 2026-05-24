// Notifications service — bridges DB persistence with socket delivery.
// Core business services (posts, comments, reactions) remain socket-agnostic;
// they delegate notification creation to this service via fire-and-forget calls
// in their controllers.

import { prisma } from '../../config/prisma.js'
import {
  createNotification,
  findNotifications,
  countUnread,
  markOneRead,
  markAllRead,
} from './notifications.repository.js'
import {
  emitNotification,
  emitUnreadCount,
} from '../../lib/socket/socket.gateway.js'
import type { NotificationQuery } from './notifications.schemas.js'

// ─── List + unread count ───────────────────────────────────────────────────

export const listNotifications = async (userId: string, query: NotificationQuery) => {
  const [result, unread] = await Promise.all([
    findNotifications({ userId, limit: query.limit, ...(query.cursor !== undefined && { cursor: query.cursor }) }),
    countUnread(userId),
  ])
  return { ...result, unread }
}

export const getUnreadCount = (userId: string) => countUnread(userId)

// ─── Mark read ─────────────────────────────────────────────────────────────

export const markNotificationRead = async (userId: string, id: string) => {
  await markOneRead(id, userId)
  const unread = await countUnread(userId)
  emitUnreadCount(userId, { unread })
  return { unread }
}

export const markAllNotificationsRead = async (userId: string) => {
  await markAllRead(userId)
  emitUnreadCount(userId, { unread: 0 })
  return { unread: 0 }
}

// ─── Notification creation helpers (fire-and-forget from controllers) ──────
// Each function:
//   1. Resolves the target user from the entity
//   2. Guards against self-notifications
//   3. Persists to DB
//   4. Emits via socket gateway

export const createCommentNotification = async (
  actorId:   string,
  postId:    string,
  commentId: string,
): Promise<void> => {
  const post = await prisma.post.findUnique({
    where:  { id: postId, deletedAt: null },
    select: { authorId: true },
  })
  if (!post || post.authorId === actorId) return

  const n = await createNotification({
    type:         'COMMENT',
    actorId,
    targetUserId: post.authorId,
    entityId:     commentId,
    entityType:   'comment',
  })

  emitNotification(n.targetUserId, n)
  const unread = await countUnread(n.targetUserId)
  emitUnreadCount(n.targetUserId, { unread })
}

export const createReplyNotification = async (
  actorId:         string,
  parentCommentId: string,
  replyId:         string,
): Promise<void> => {
  const parent = await prisma.comment.findUnique({
    where:  { id: parentCommentId },
    select: { authorId: true },
  })
  if (!parent || parent.authorId === actorId) return

  const n = await createNotification({
    type:         'REPLY',
    actorId,
    targetUserId: parent.authorId,
    entityId:     replyId,
    entityType:   'comment',
  })

  emitNotification(n.targetUserId, n)
  const unread = await countUnread(n.targetUserId)
  emitUnreadCount(n.targetUserId, { unread })
}

export const createFollowNotification = async (
  actorId:  string,
  targetId: string,
): Promise<void> => {
  if (actorId === targetId) return

  const n = await createNotification({
    type:         'FOLLOW',
    actorId,
    targetUserId: targetId,
    entityId:     actorId,
    entityType:   'user',
  })

  emitNotification(n.targetUserId, n)
  const unread = await countUnread(n.targetUserId)
  emitUnreadCount(n.targetUserId, { unread })
}

export const createPostReactionNotification = async (
  actorId: string,
  postId:  string,
): Promise<void> => {
  const post = await prisma.post.findUnique({
    where:  { id: postId, deletedAt: null },
    select: { authorId: true },
  })
  if (!post || post.authorId === actorId) return

  const n = await createNotification({
    type:         'POST_REACTION',
    actorId,
    targetUserId: post.authorId,
    entityId:     postId,
    entityType:   'post',
  })

  emitNotification(n.targetUserId, n)
  const unread = await countUnread(n.targetUserId)
  emitUnreadCount(n.targetUserId, { unread })
}

export const createCommentReactionNotification = async (
  actorId:   string,
  commentId: string,
): Promise<void> => {
  const comment = await prisma.comment.findUnique({
    where:  { id: commentId, deletedAt: null },
    select: { authorId: true },
  })
  if (!comment || comment.authorId === actorId) return

  const n = await createNotification({
    type:         'COMMENT_REACTION',
    actorId,
    targetUserId: comment.authorId,
    entityId:     commentId,
    entityType:   'comment',
  })

  emitNotification(n.targetUserId, n)
  const unread = await countUnread(n.targetUserId)
  emitUnreadCount(n.targetUserId, { unread })
}
