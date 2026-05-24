import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Role } from '@prisma/client'

/**
 * Verifies the Bearer JWT on the incoming request.
 * Use as a preHandler hook on any route that requires authentication.
 *
 * Usage:
 *   preHandler: [authenticate]
 */
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({
      success: false,
      error: { message: 'Unauthorized — invalid or expired token' },
    })
  }
}

/**
 * Returns a preHandler hook that enforces one or more allowed roles.
 * Must be combined with `authenticate` (which populates request.user).
 *
 * Usage:
 *   preHandler: [authenticate, requireRole('ADMIN')]
 *   preHandler: [authenticate, requireRole('ADMIN', 'MENTOR')]
 */
export const requireRole =
  (...allowedRoles: Role[]) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userRole = request.user?.role as Role | undefined
    if (!userRole || !allowedRoles.includes(userRole)) {
      reply.status(403).send({
        success: false,
        error: { message: 'Forbidden — insufficient permissions' },
      })
    }
  }
