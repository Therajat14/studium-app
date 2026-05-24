import type { FastifyRequest, FastifyReply } from 'fastify'
import { registerSchema, loginSchema } from './auth.schemas.js'
import * as authService from './auth.service.js'
import { AuthError } from './auth.service.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { env } from '../../config/env.js'

// ─── Cookie config ─────────────────────────────────────────────────────────

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth', // Scope cookie to auth routes only
  maxAge: 7 * 24 * 60 * 60, // seconds
}

// ─── Register ──────────────────────────────────────────────────────────────

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  const result = registerSchema.safeParse(request.body)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Validation failed'
    return sendError(reply, msg, 400)
  }

  try {
    const user = await authService.registerUser(result.data)

    const accessToken = await reply.jwtSign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: env.JWT_ACCESS_EXPIRY },
    )
    const refreshToken = await authService.createRefreshToken(user.id)

    reply.setCookie('refreshToken', refreshToken, refreshCookieOptions)
    return sendSuccess(reply, { accessToken, user }, 201)
  } catch (err) {
    if (err instanceof AuthError && err.code === 'EMAIL_TAKEN') {
      return sendError(reply, 'An account with this email already exists', 409)
    }
    throw err
  }
}

// ─── Login ─────────────────────────────────────────────────────────────────

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const result = loginSchema.safeParse(request.body)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Validation failed'
    return sendError(reply, msg, 400)
  }

  try {
    const user = await authService.loginUser(result.data)

    const accessToken = await reply.jwtSign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: env.JWT_ACCESS_EXPIRY },
    )
    const refreshToken = await authService.createRefreshToken(user.id)

    reply.setCookie('refreshToken', refreshToken, refreshCookieOptions)
    return sendSuccess(reply, { accessToken, user })
  } catch (err) {
    if (err instanceof AuthError && err.code === 'INVALID_CREDENTIALS') {
      return sendError(reply, 'Invalid email or password', 401)
    }
    throw err
  }
}

// ─── Get current user (protected) ──────────────────────────────────────────

export const me = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await authService.getUserById(request.user.sub)
  if (!user) return sendError(reply, 'User not found', 404)
  return sendSuccess(reply, { user })
}

// ─── Refresh access token ──────────────────────────────────────────────────

export const refresh = async (request: FastifyRequest, reply: FastifyReply) => {
  const oldToken = request.cookies['refreshToken']
  if (!oldToken) return sendError(reply, 'No refresh token provided', 401)

  try {
    const { newToken, user } = await authService.rotateRefreshToken(oldToken)

    const accessToken = await reply.jwtSign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: env.JWT_ACCESS_EXPIRY },
    )

    reply.setCookie('refreshToken', newToken, refreshCookieOptions)
    return sendSuccess(reply, { accessToken, user })
  } catch (err) {
    if (err instanceof AuthError && err.code === 'INVALID_REFRESH_TOKEN') {
      reply.clearCookie('refreshToken', { path: '/api/auth' })
      return sendError(reply, 'Session expired — please sign in again', 401)
    }
    throw err
  }
}

// ─── Logout ────────────────────────────────────────────────────────────────

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.cookies['refreshToken']
  if (token) await authService.revokeRefreshToken(token)

  reply.clearCookie('refreshToken', { path: '/api/auth' })
  return sendSuccess(reply, { message: 'Signed out successfully' })
}
