import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    post: { findMany: vi.fn(), count: vi.fn() },
    follow: { findMany: vi.fn() },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  Prisma: { JsonNull: 'JsonNull', sql: vi.fn() },
}))

vi.mock('../../../lib/password.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2a$10$mocked_hash'),
  comparePassword: vi.fn(),
}))

vi.mock('../../../lib/token.js', () => ({
  generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token-opaque'),
}))

// ── Imports ──────────────────────────────────────────────────────────────────

import { createApp } from '../../../app.js'
import { prisma } from '../../../config/prisma.js'
import { comparePassword } from '../../../lib/password.js'
import { signTestToken, TEST_USER } from '../../../test/helpers/auth.js'
import { makeUser, makeRefreshToken } from '../../../test/helpers/factories.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any
const mockCompare = comparePassword as unknown as ReturnType<typeof vi.fn>

// ── App lifecycle ─────────────────────────────────────────────────────────────

let app: FastifyInstance

beforeAll(async () => {
  app = await createApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => vi.clearAllMocks())

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a new account and returns 201 with accessToken', async () => {
    const user = makeUser()
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(user)
    mockPrisma.refreshToken.create.mockResolvedValue(makeRefreshToken())

    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Test User',
        email: 'newuser@college.edu',
        password: 'password123',
        rollNumber: 'GEU21CS001',
      },
    })

    expect(resp.statusCode).toBe(201)
    const body = resp.json<{ success: true; data: { accessToken: string } }>()
    expect(body.success).toBe(true)
    expect(typeof body.data.accessToken).toBe('string')
  })

  it('returns 409 when email is already registered', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeUser())

    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Dup User',
        email: 'testuser@college.edu',
        password: 'password123',
        rollNumber: 'DUP001',
      },
    })

    expect(resp.statusCode).toBe(409)
    const body = resp.json<{ success: false; error: { message: string } }>()
    expect(body.success).toBe(false)
  })

  it('returns 400 for invalid payload (missing required fields)', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'nope' },
    })
    expect(resp.statusCode).toBe(400)
  })

  it('returns 400 for password too short', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'Test', email: 'x@x.com', password: 'short', rollNumber: 'X001' },
    })
    expect(resp.statusCode).toBe(400)
  })
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('returns 200 with accessToken on valid credentials', async () => {
    const user = makeUser()
    mockPrisma.user.findUnique.mockResolvedValue(user)
    mockCompare.mockResolvedValue(true)
    mockPrisma.refreshToken.create.mockResolvedValue(makeRefreshToken())

    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: user.email, password: 'password123' },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { accessToken: string } }>()
    expect(body.success).toBe(true)
    expect(typeof body.data.accessToken).toBe('string')
  })

  it('returns 401 on wrong password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeUser())
    mockCompare.mockResolvedValue(false)

    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'testuser@college.edu', password: 'wrong' },
    })

    expect(resp.statusCode).toBe(401)
  })

  it('returns 401 when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const resp = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'nobody@example.com', password: 'pass123' },
    })

    expect(resp.statusCode).toBe(401)
  })
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns 200 with user data for a valid token', async () => {
    const user = makeUser()
    mockPrisma.user.findUnique.mockResolvedValue(user)

    const token = signTestToken(TEST_USER)

    const resp = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { user: { email: string } } }>()
    expect(body.data.user.email).toBe(user.email)
  })

  it('returns 401 without Authorization header', async () => {
    const resp = await app.inject({ method: 'GET', url: '/api/auth/me' })
    expect(resp.statusCode).toBe(401)
  })

  it('returns 401 with a malformed token', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: 'Bearer not.a.valid.jwt.token' },
    })
    expect(resp.statusCode).toBe(401)
  })
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('returns 200 even without a refresh cookie', async () => {
    const resp = await app.inject({ method: 'POST', url: '/api/auth/logout' })
    expect(resp.statusCode).toBe(200)
  })
})

// ── Health check ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns status ok', async () => {
    const resp = await app.inject({ method: 'GET', url: '/health' })
    expect(resp.statusCode).toBe(200)
    expect(resp.json<{ status: string }>().status).toBe('ok')
  })
})
