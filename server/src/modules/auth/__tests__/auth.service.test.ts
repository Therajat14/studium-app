import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Module mocks (hoisted before imports) ───────────────────────────────────

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  Prisma: { JsonNull: 'JsonNull' },
}))

vi.mock('../../../lib/password.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2a$10$mocked_hash'),
  comparePassword: vi.fn(),
}))

vi.mock('../../../lib/token.js', () => ({
  generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token-abc123'),
}))

// ── Imports (resolved after mock registration) ───────────────────────────────

import { registerUser, loginUser, rotateRefreshToken, AuthError } from '../auth.service.js'
import { prisma } from '../../../config/prisma.js'
import { comparePassword } from '../../../lib/password.js'
import { makeUser, makeRefreshToken } from '../../../test/helpers/factories.js'

const mockPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> }
  refreshToken: {
    create: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
}

const mockComparePassword = comparePassword as unknown as ReturnType<typeof vi.fn>

// ── Tests ────────────────────────────────────────────────────────────────────

describe('registerUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a new user when the email is not taken', async () => {
    const user = makeUser()
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(user)

    const result = await registerUser({
      name: user.name,
      email: user.email,
      password: 'password123',
      rollNumber: user.rollNumber ?? undefined,
    })

    expect(mockPrisma.user.create).toHaveBeenCalledOnce()
    expect(result.email).toBe(user.email)
  })

  it('throws EMAIL_TAKEN when the email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeUser())

    await expect(
      registerUser({ name: 'New', email: 'testuser@college.edu', password: 'pass1234' }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' })

    expect(mockPrisma.user.create).not.toHaveBeenCalled()
  })

  it('stores a hashed password (never plain text)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(makeUser())

    await registerUser({ name: 'X', email: 'x@x.com', password: 'plain_pass' })

    const createCall = mockPrisma.user.create.mock.calls[0] as [{ data: { password: string } }]
    expect(createCall[0].data.password).toBe('$2a$10$mocked_hash')
    expect(createCall[0].data.password).not.toBe('plain_pass')
  })
})

// ── loginUser ────────────────────────────────────────────────────────────────

describe('loginUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the safe user when credentials are valid', async () => {
    const user = makeUser()
    mockPrisma.user.findUnique.mockResolvedValue(user)
    mockComparePassword.mockResolvedValue(true)

    const result = await loginUser({ email: user.email, password: 'password123' })

    expect(result.email).toBe(user.email)
    expect(result).not.toHaveProperty('password')
  })

  it('throws INVALID_CREDENTIALS when user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    await expect(
      loginUser({ email: 'nobody@nowhere.com', password: 'pass' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })

  it('throws INVALID_CREDENTIALS when password is wrong', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeUser())
    mockComparePassword.mockResolvedValue(false)

    await expect(
      loginUser({ email: 'testuser@college.edu', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })
})

// ── rotateRefreshToken ────────────────────────────────────────────────────────

describe('rotateRefreshToken', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws INVALID_REFRESH_TOKEN when token is not found', async () => {
    mockPrisma.refreshToken.findUnique.mockResolvedValue(null)

    await expect(rotateRefreshToken('nonexistent')).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    })
  })

  it('throws INVALID_REFRESH_TOKEN when token is expired', async () => {
    const expired = makeRefreshToken({ expiresAt: new Date(Date.now() - 1000) })
    // Include user for the include query
    ;(mockPrisma.refreshToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...expired,
      user: makeUser(),
    })
    mockPrisma.refreshToken.delete.mockResolvedValue(expired)

    await expect(rotateRefreshToken('expired-token')).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    })
  })

  it('rotates the token on success', async () => {
    const existing = makeRefreshToken()
    const user = makeUser()
    ;(mockPrisma.refreshToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...existing,
      user,
    })
    mockPrisma.refreshToken.delete.mockResolvedValue(existing)
    mockPrisma.refreshToken.create.mockResolvedValue({ ...existing, token: 'new-token' })

    const result = await rotateRefreshToken(existing.token)

    expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
      where: { token: existing.token },
    })
    expect(result.user.email).toBe(user.email)
    expect(result.newToken).toBeTruthy()
  })
})

// ── AuthError ────────────────────────────────────────────────────────────────

describe('AuthError', () => {
  it('has the correct code and name', () => {
    const err = new AuthError('EMAIL_TAKEN')
    expect(err.code).toBe('EMAIL_TAKEN')
    expect(err.name).toBe('AuthError')
    expect(err instanceof Error).toBe(true)
  })
})
