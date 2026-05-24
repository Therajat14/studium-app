import { prisma } from '../../config/prisma.js'
import { hashPassword, comparePassword } from '../../lib/password.js'
import { generateRefreshToken } from '../../lib/token.js'
import { env } from '../../config/env.js'
import type { RegisterInput, LoginInput } from './auth.schemas.js'
import type { SafeUser } from '../../types/index.js'

// ─── Error codes ───────────────────────────────────────────────────────────
// Using string codes instead of custom Error subclasses keeps service logic
// simple and lets controllers decide the HTTP status code.

export type AuthErrorCode = 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS' | 'INVALID_REFRESH_TOKEN'

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
  }
}

// ─── User selection helper ─────────────────────────────────────────────────

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  college: true,
  branch: true,
  year: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
} as const

// ─── Register ──────────────────────────────────────────────────────────────

export const registerUser = async (input: RegisterInput): Promise<SafeUser> => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new AuthError('EMAIL_TAKEN')

  const hashed = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      rollNumber: input.rollNumber ?? null,
    },
    select: safeUserSelect,
  })

  return user as SafeUser
}

// ─── Login ─────────────────────────────────────────────────────────────────

export const loginUser = async (input: LoginInput): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...safeUserSelect, password: true },
  })

  if (!user) throw new AuthError('INVALID_CREDENTIALS')

  const valid = await comparePassword(input.password, user.password)
  if (!valid) throw new AuthError('INVALID_CREDENTIALS')

  // Remove password before returning
  const { password: _pw, ...safeUser } = user
  void _pw // satisfy no-unused-vars
  return safeUser as SafeUser
}

// ─── Refresh token management ──────────────────────────────────────────────

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export const createRefreshToken = async (userId: string): Promise<string> => {
  const token = generateRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)

  await prisma.refreshToken.create({ data: { token, userId, expiresAt } })
  return token
}

export const rotateRefreshToken = async (
  oldToken: string,
): Promise<{ newToken: string; user: SafeUser }> => {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: { select: safeUserSelect } },
  })

  if (!existing || existing.expiresAt < new Date()) {
    // Clean up expired token if it exists
    if (existing) {
      await prisma.refreshToken.delete({ where: { token: oldToken } }).catch(() => null)
    }
    throw new AuthError('INVALID_REFRESH_TOKEN')
  }

  // Atomic rotation: delete old, create new
  await prisma.refreshToken.delete({ where: { token: oldToken } })
  const newToken = await createRefreshToken(existing.userId)

  return { newToken, user: existing.user as SafeUser }
}

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { token } })
}

// ─── Get current user ──────────────────────────────────────────────────────

export const getUserById = async (id: string): Promise<SafeUser | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  }) as Promise<SafeUser | null>
}
