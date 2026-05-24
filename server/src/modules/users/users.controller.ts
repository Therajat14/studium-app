import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccess, sendError, sendPaginated } from '../../lib/response.js'
import {
  getProfile,
  listUsers,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  UserError,
} from './users.service.js'
import {
  updateProfileSchema,
  userListQuerySchema,
  userIdParamSchema,
} from './users.schemas.js'
import { createFollowNotification } from '../notifications/notifications.service.js'
import { batchIsOnline } from '../../lib/socket/presence.store.js'

// ─── Error → HTTP mapping ──────────────────────────────────────────────────

const handleUserError = (error: unknown, reply: FastifyReply) => {
  if (error instanceof UserError) {
    switch (error.code) {
      case 'USER_NOT_FOUND':
        return sendError(reply, 'User not found', 404)
      case 'SELF_FOLLOW':
        return sendError(reply, 'You cannot follow yourself', 400)
      case 'ALREADY_FOLLOWING':
        return sendError(reply, 'Already following this user', 409)
      case 'NOT_FOLLOWING':
        return sendError(reply, 'Not following this user', 400)
    }
  }
  throw error
}

// ─── Handlers ─────────────────────────────────────────────────────────────

export const listUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = userListQuerySchema.parse(request.query)
  const result = await listUsers(query)
  return sendPaginated(reply, result)
}

export const getUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = userIdParamSchema.parse(request.params)
  try {
    const user = await getProfile(id)
    return sendSuccess(reply, user)
  } catch (err) {
    return handleUserError(err, reply)
  }
}

export const updateProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const callerId = request.user.sub
  const body = updateProfileSchema.parse(request.body)
  const updated = await updateProfile(callerId, body)
  return sendSuccess(reply, updated)
}

export const followUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const callerId = request.user.sub
  const { id: targetId } = userIdParamSchema.parse(request.params)
  try {
    await followUser(callerId, targetId)
    void createFollowNotification(callerId, targetId)
    return sendSuccess(reply, { message: 'Followed successfully' }, 200)
  } catch (err) {
    return handleUserError(err, reply)
  }
}

export const unfollowUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const callerId = request.user.sub
  const { id: targetId } = userIdParamSchema.parse(request.params)
  try {
    await unfollowUser(callerId, targetId)
    return sendSuccess(reply, { message: 'Unfollowed successfully' }, 200)
  } catch (err) {
    return handleUserError(err, reply)
  }
}

export const getFollowersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = userIdParamSchema.parse(request.params)
  const query = userListQuerySchema.parse(request.query)
  try {
    const result = await getFollowers(id, query.page, query.limit)
    return sendPaginated(reply, result)
  } catch (err) {
    return handleUserError(err, reply)
  }
}

export const getFollowingHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = userIdParamSchema.parse(request.params)
  const query = userListQuerySchema.parse(request.query)
  try {
    const result = await getFollowing(id, query.page, query.limit)
    return sendPaginated(reply, result)
  } catch (err) {
    return handleUserError(err, reply)
  }
}

// GET /api/users/presence?userIds[]=...
export const getPresenceHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = request.query as { userIds?: string | string[] }
  const raw   = query.userIds
  const ids   = Array.isArray(raw) ? raw : raw ? [raw] : []
  return sendSuccess(reply, await batchIsOnline(ids.slice(0, 100)))
}
