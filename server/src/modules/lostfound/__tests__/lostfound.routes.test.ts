import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    lostFoundItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    lostFoundClaim: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    follow: { findMany: vi.fn() },
    post: { findMany: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  Prisma: { JsonNull: 'JsonNull', sql: vi.fn() },
}))

// ── Imports ───────────────────────────────────────────────────────────────────

import { createApp } from '../../../app.js'
import { prisma } from '../../../config/prisma.js'
import { signTestToken, TEST_USER } from '../../../test/helpers/auth.js'
import { makeLostFoundItem } from '../../../test/helpers/factories.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any

const OTHER_USER_ID = 'other-user-000000000001'

let app: FastifyInstance
let token: string
let otherToken: string

beforeAll(async () => {
  app = await createApp()
  await app.ready()
  token = signTestToken(TEST_USER)
  otherToken = signTestToken({ sub: OTHER_USER_ID, email: 'other@college.edu', role: 'STUDENT' })
})

afterAll(async () => { await app.close() })

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.lostFoundItem.findMany.mockResolvedValue([])
  mockPrisma.lostFoundItem.count.mockResolvedValue(0)
})

// ── GET /api/lostfound ────────────────────────────────────────────────────────

describe('GET /api/lostfound', () => {
  it('returns 200 with an empty list by default', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/lostfound',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { items: unknown[]; total: number } }>()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  it('returns items when they exist', async () => {
    const item = makeLostFoundItem()
    mockPrisma.lostFoundItem.findMany.mockResolvedValue([item])
    mockPrisma.lostFoundItem.count.mockResolvedValue(1)

    const resp = await app.inject({
      method: 'GET',
      url: '/api/lostfound',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { items: Array<{ id: string }>; total: number } }>()
    expect(body.data.total).toBe(1)
    expect(body.data.items[0]!.id).toBe(item.id)
  })

  it('passes type filter to the query', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/api/lostfound?type=FOUND',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
  })

  it('returns 401 without authentication', async () => {
    const resp = await app.inject({ method: 'GET', url: '/api/lostfound' })
    expect(resp.statusCode).toBe(401)
  })
})

// ── POST /api/lostfound ───────────────────────────────────────────────────────

describe('POST /api/lostfound', () => {
  const validPayload = {
    type:        'LOST',
    category:    'ELECTRONICS',
    title:       'Lost Laptop HP Pavilion',
    description: 'Lost my laptop near the library. Has a GEU sticker.',
    location:    'Main Library',
    contactInfo: '9876543210',
  }

  it('creates an item and returns 201 when authenticated', async () => {
    const item = makeLostFoundItem()
    mockPrisma.lostFoundItem.create.mockResolvedValue(item)

    const resp = await app.inject({
      method: 'POST',
      url: '/api/lostfound',
      headers: { authorization: `Bearer ${token}` },
      payload: validPayload,
    })

    expect(resp.statusCode).toBe(201)
    const body = resp.json<{ success: true; data: { id: string } }>()
    expect(body.data.id).toBe(item.id)
  })

  it('returns 401 when not authenticated', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/lostfound',
      payload: validPayload,
    })
    expect(resp.statusCode).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/lostfound',
      headers: { authorization: `Bearer ${token}` },
      payload: { type: 'LOST', category: 'ELECTRONICS', description: 'desc' },
    })
    expect(resp.statusCode).toBe(400)
  })

  it('returns 400 when description is too short', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/lostfound',
      headers: { authorization: `Bearer ${token}` },
      payload: { type: 'LOST', category: 'ELECTRONICS', title: 'Valid Title', description: 'Short' },
    })
    expect(resp.statusCode).toBe(400)
  })
})

// ── DELETE /api/lostfound/:id ─────────────────────────────────────────────────

describe('DELETE /api/lostfound/:id', () => {
  it('deletes the item when the caller is the owner', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)
    mockPrisma.lostFoundItem.delete.mockResolvedValue(item)

    const resp = await app.inject({
      method: 'DELETE',
      url: `/api/lostfound/${item.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
  })

  it('returns 403 when a non-owner tries to delete', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)

    const resp = await app.inject({
      method: 'DELETE',
      url: `/api/lostfound/${item.id}`,
      headers: { authorization: `Bearer ${otherToken}` },
    })

    expect(resp.statusCode).toBe(403)
  })

  it('returns 404 when the item does not exist', async () => {
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(null)

    const resp = await app.inject({
      method: 'DELETE',
      url: '/api/lostfound/nonexistent',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(404)
  })
})

// ── PATCH /api/lostfound/:id/resolve ─────────────────────────────────────────

describe('PATCH /api/lostfound/:id/resolve', () => {
  it('resolves the item when the caller is the owner', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    const resolved = { ...item, status: 'RESOLVED' }
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)
    mockPrisma.lostFoundItem.update.mockResolvedValue(resolved)

    const resp = await app.inject({
      method: 'PATCH',
      url: `/api/lostfound/${item.id}/resolve`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { status: string } }>()
    expect(body.data.status).toBe('RESOLVED')
  })

  it('returns 403 when a non-owner tries to resolve', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)

    const resp = await app.inject({
      method: 'PATCH',
      url: `/api/lostfound/${item.id}/resolve`,
      headers: { authorization: `Bearer ${otherToken}` },
    })

    expect(resp.statusCode).toBe(403)
  })
})

// ── POST /api/lostfound/:id/claim ─────────────────────────────────────────────

describe('POST /api/lostfound/:id/claim', () => {
  it('allows a non-owner to claim an item', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    const claimData = {
      id: 'claim001',
      itemId: item.id,
      userId: OTHER_USER_ID,
      message: 'I found this laptop near the cafeteria.',
      createdAt: new Date(),
      user: { id: OTHER_USER_ID, name: 'Other', avatarUrl: null, branch: null, year: null },
    }
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)
    mockPrisma.lostFoundClaim.findUnique.mockResolvedValue(null)
    mockPrisma.lostFoundClaim.create.mockResolvedValue(claimData)

    const resp = await app.inject({
      method: 'POST',
      url: `/api/lostfound/${item.id}/claim`,
      headers: { authorization: `Bearer ${otherToken}` },
      payload: { message: 'I found this laptop near the cafeteria.' },
    })

    expect(resp.statusCode).toBe(201)
  })

  it('returns 400 when the owner tries to claim their own item', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)

    const resp = await app.inject({
      method: 'POST',
      url: `/api/lostfound/${item.id}/claim`,
      headers: { authorization: `Bearer ${token}` },
      payload: { message: 'I am the owner, claiming this.' },
    })

    expect(resp.statusCode).toBe(400)
  })

  it('returns 409 on duplicate claim', async () => {
    const item = makeLostFoundItem({ authorId: TEST_USER.sub })
    mockPrisma.lostFoundItem.findUnique.mockResolvedValue(item)
    mockPrisma.lostFoundClaim.findUnique.mockResolvedValue({ id: 'existing-claim' })

    const resp = await app.inject({
      method: 'POST',
      url: `/api/lostfound/${item.id}/claim`,
      headers: { authorization: `Bearer ${otherToken}` },
      payload: { message: 'Trying to claim again.' },
    })

    expect(resp.statusCode).toBe(409)
  })
})
