import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import {
  listUsersHandler,
  getUserHandler,
  updateProfileHandler,
  followUserHandler,
  unfollowUserHandler,
  getFollowersHandler,
  getFollowingHandler,
} from './users.controller.js'

export const usersRoutes = async (fastify: FastifyInstance) => {
  // ─── Public routes ──────────────────────────────────────────────────────

  // GET /users?page=&limit=&search=&college=&role=
  fastify.get('/', listUsersHandler)

  // GET /users/:id
  fastify.get('/:id', getUserHandler)

  // GET /users/:id/followers
  fastify.get('/:id/followers', getFollowersHandler)

  // GET /users/:id/following
  fastify.get('/:id/following', getFollowingHandler)

  // ─── Authenticated routes ───────────────────────────────────────────────

  // PATCH /users/me — update own profile
  fastify.patch('/me', { preHandler: [authenticate] }, updateProfileHandler)

  // POST /users/:id/follow — follow a user
  fastify.post('/:id/follow', { preHandler: [authenticate] }, followUserHandler)

  // DELETE /users/:id/follow — unfollow a user
  fastify.delete('/:id/follow', { preHandler: [authenticate] }, unfollowUserHandler)
}
