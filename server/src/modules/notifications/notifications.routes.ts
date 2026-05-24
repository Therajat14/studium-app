import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import {
  listNotificationsHandler,
  getUnreadCountHandler,
  markReadHandler,
  markAllReadHandler,
} from './notifications.controller.js'

export const notificationsRoutes = async (app: FastifyInstance) => {
  const auth = { preHandler: [authenticate] }

  // GET /api/notifications — paginated list + unread count
  app.get('/', auth, listNotificationsHandler)

  // GET /api/notifications/unread-count
  app.get('/unread-count', auth, getUnreadCountHandler)

  // PATCH /api/notifications/read-all — static path must be registered before :id
  app.patch('/read-all', auth, markAllReadHandler)

  // PATCH /api/notifications/:id/read
  app.patch('/:id/read', auth, markReadHandler)
}
