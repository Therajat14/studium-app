import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess } from '../../lib/response.js'
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from './notifications.service.js'
import {
  notificationQuerySchema,
  notificationIdParamSchema,
} from './notifications.schemas.js'

export const listNotificationsHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const query  = notificationQuerySchema.parse(request.query)
  const result = await listNotifications(request.user.sub, query)
  return sendSuccess(reply, result)
}

export const getUnreadCountHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const unread = await getUnreadCount(request.user.sub)
  return sendSuccess(reply, { unread })
}

export const markReadHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const { id } = notificationIdParamSchema.parse(request.params)
  const result = await markNotificationRead(request.user.sub, id)
  return sendSuccess(reply, result)
}

export const markAllReadHandler = async (
  request: FastifyRequest,
  reply:   FastifyReply,
) => {
  const result = await markAllNotificationsRead(request.user.sub)
  return sendSuccess(reply, result)
}
