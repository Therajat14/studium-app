import { prisma } from '../../config/prisma.js'
import type { NotificationType } from '@prisma/client'

// ─── Select shape ──────────────────────────────────────────────────────────

export const notificationSelect = {
  id:          true,
  type:        true,
  entityId:    true,
  entityType:  true,
  readAt:      true,
  createdAt:   true,
  actor: {
    select: { id: true, name: true, avatarUrl: true },
  },
} as const

// ─── Queries ───────────────────────────────────────────────────────────────

export const createNotification = (data: {
  type:         NotificationType
  actorId:      string
  targetUserId: string
  entityId:     string
  entityType:   string
}) =>
  prisma.notification.create({
    data,
    select: { ...notificationSelect, targetUserId: true },
  })

export const findNotifications = async (opts: {
  userId: string
  cursor?: string
  limit:  number
}) => {
  const rows = await prisma.notification.findMany({
    take:    opts.limit + 1,
    ...(opts.cursor !== undefined && { cursor: { id: opts.cursor }, skip: 1 }),
    where:   { targetUserId: opts.userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select:  notificationSelect,
  })

  const hasMore = rows.length > opts.limit
  const items   = hasMore ? rows.slice(0, opts.limit) : rows
  const last    = items[items.length - 1]

  return {
    items,
    nextCursor: hasMore && last ? last.id : null,
  }
}

export const countUnread = (userId: string) =>
  prisma.notification.count({ where: { targetUserId: userId, readAt: null } })

export const markOneRead = (id: string, userId: string) =>
  prisma.notification.updateMany({
    where: { id, targetUserId: userId, readAt: null },
    data:  { readAt: new Date() },
  })

export const markAllRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { targetUserId: userId, readAt: null },
    data:  { readAt: new Date() },
  })
