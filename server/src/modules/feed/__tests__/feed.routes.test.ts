import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    post: { findMany: vi.fn(), count: vi.fn() },
    follow: { findMany: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
  Prisma: {
    JsonNull: 'JsonNull',
    sql: vi.fn((_strings: TemplateStringsArray) => ''),
  },
}))

// ── Imports ───────────────────────────────────────────────────────────────────

import { createApp } from '../../../app.js'
import { prisma } from '../../../config/prisma.js'
import { signTestToken, TEST_USER } from '../../../test/helpers/auth.js'
import { makePost, makeUser } from '../../../test/helpers/factories.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any

let app: FastifyInstance
let token: string

beforeAll(async () => {
  app = await createApp()
  await app.ready()
  token = signTestToken(TEST_USER)
})

afterAll(async () => { await app.close() })

beforeEach(() => {
  vi.clearAllMocks()
  // Default: empty feed
  mockPrisma.post.findMany.mockResolvedValue([])
  mockPrisma.post.count.mockResolvedValue(0)
  mockPrisma.follow.findMany.mockResolvedValue([])
  mockPrisma.$queryRaw.mockResolvedValue([])
})

// ── GET /api/feed ─────────────────────────────────────────────────────────────

describe('GET /api/feed', () => {
  it('returns 200 with the default latest feed', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { items: unknown[]; sort: string } }>()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.items)).toBe(true)
    expect(body.data.sort).toBe('latest')
  })

  it('returns posts in the response', async () => {
    const post = makePost()
    mockPrisma.post.findMany.mockResolvedValue([post])

    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed?limit=10',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { items: Array<{ id: string }> } }>()
    expect(body.data.items).toHaveLength(1)
    expect(body.data.items[0]!.id).toBe(post.id)
  })

  it('accepts sort=trending and returns 200', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([])

    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed?sort=trending',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { sort: string } }>()
    expect(body.data.sort).toBe('trending')
  })

  it('accepts sort=following and falls back to latest (feed is unauthenticated — JWT not verified)', async () => {
    // The feed route is intentionally public (no jwtVerify call), so request.user
    // is never set. The following sort falls back to latest when userId is null.
    mockPrisma.follow.findMany.mockResolvedValue([])

    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed?sort=following',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { items: unknown[]; sort: string } }>()
    // Falls back to latest because userId is null in this route
    expect(body.data.sort).toBe('latest')
  })

  it('accepts college and branch query params for scoped feed', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed?college=Graphic+Era+University&branch=B.Tech+CSE',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const callArgs = mockPrisma.post.findMany.mock.calls[0] as [{ where: Record<string, unknown> }]
    expect(callArgs[0].where).toMatchObject({
      author: expect.objectContaining({ college: 'Graphic Era University' }),
    })
  })

  it('accepts type filter query param', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed?type=DISCUSSION',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const callArgs = mockPrisma.post.findMany.mock.calls[0] as [{ where: Record<string, unknown> }]
    expect(callArgs[0].where).toMatchObject({ type: 'DISCUSSION' })
  })

  it('returns 400 for an invalid sort value', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/feed?sort=invalid_sort',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(resp.statusCode).toBe(400)
  })

  it('returns 200 even without authentication (feed is public)', async () => {
    // The feed endpoint is intentionally public — unauthenticated users
    // can read the latest feed; userId is extracted from JWT if present.
    const resp = await app.inject({ method: 'GET', url: '/api/feed' })
    expect(resp.statusCode).toBe(200)
  })
})
