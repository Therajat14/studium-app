import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    tag: { findFirst: vi.fn(), create: vi.fn(), upsert: vi.fn() },
    postTag: { create: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    media: { updateMany: vi.fn() },
    postBookmark: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    follow: { findMany: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  Prisma: { JsonNull: 'JsonNull', sql: vi.fn() },
}))

// ── Imports ───────────────────────────────────────────────────────────────────

import { createApp } from '../../../app.js'
import { prisma } from '../../../config/prisma.js'
import { signTestToken, TEST_USER } from '../../../test/helpers/auth.js'
import { makePost } from '../../../test/helpers/factories.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any

let app: FastifyInstance
let token: string
let otherToken: string

beforeAll(async () => {
  app = await createApp()
  await app.ready()
  token = signTestToken(TEST_USER)
  otherToken = signTestToken({ sub: 'other-user-000001', email: 'other@college.edu', role: 'STUDENT' })
})

afterAll(async () => { await app.close() })

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.follow.findMany.mockResolvedValue([])
})

// ── GET /api/posts/:id ────────────────────────────────────────────────────────

describe('GET /api/posts/:id', () => {
  it('returns 200 with post data', async () => {
    const post = makePost()
    mockPrisma.post.findUnique.mockResolvedValue(post)
    mockPrisma.post.update.mockResolvedValue(post)

    const resp = await app.inject({ method: 'GET', url: `/api/posts/${post.id}` })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { id: string } }>()
    expect(body.data.id).toBe(post.id)
  })

  it('returns 404 when post is not found', async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null)

    // Must be a valid CUID format — the route validates the :id param
    const resp = await app.inject({ method: 'GET', url: '/api/posts/cltest0000000000000xxxx99' })

    expect(resp.statusCode).toBe(404)
  })
})

// ── POST /api/posts ───────────────────────────────────────────────────────────

describe('POST /api/posts', () => {
  it('creates a post when authenticated', async () => {
    const post = makePost()
    // createPost calls prisma.post.create THEN findPostById (prisma.post.findUnique)
    mockPrisma.post.create.mockResolvedValue(post)
    mockPrisma.post.findUnique.mockResolvedValue(post)
    mockPrisma.media.updateMany.mockResolvedValue({ count: 0 })

    const resp = await app.inject({
      method: 'POST',
      url: '/api/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: { content: 'This is a new test post with enough content.', type: 'DISCUSSION' },
    })

    expect(resp.statusCode).toBe(201)
    const body = resp.json<{ success: true; data: { id: string } }>()
    expect(body.data.id).toBe(post.id)
  })

  it('returns 401 when not authenticated', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/posts',
      payload: { content: 'Content here.', type: 'DISCUSSION' },
    })
    expect(resp.statusCode).toBe(401)
  })

  it('returns 400 for missing required fields', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: { type: 'DISCUSSION' },
    })
    expect(resp.statusCode).toBe(400)
  })

  it('returns 400 for invalid post type', async () => {
    const resp = await app.inject({
      method: 'POST',
      url: '/api/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: { content: 'Valid content', type: 'INVALID_TYPE' },
    })
    expect(resp.statusCode).toBe(400)
  })
})

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────────

describe('DELETE /api/posts/:id', () => {
  it('soft-deletes the post when the caller is the owner', async () => {
    const post = makePost({ authorId: TEST_USER.sub, author: { id: TEST_USER.sub, name: 'Test', avatarUrl: null, role: 'STUDENT', college: null } })
    mockPrisma.post.findUnique.mockResolvedValue(post)
    mockPrisma.post.update.mockResolvedValue({ ...post, deletedAt: new Date() })

    const resp = await app.inject({
      method: 'DELETE',
      url: `/api/posts/${post.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
  })

  it('returns 403 when a non-owner tries to delete', async () => {
    const post = makePost()
    mockPrisma.post.findUnique.mockResolvedValue(post)

    const resp = await app.inject({
      method: 'DELETE',
      url: `/api/posts/${post.id}`,
      headers: { authorization: `Bearer ${otherToken}` },
    })

    expect(resp.statusCode).toBe(403)
  })

  it('returns 404 when the post does not exist', async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null)

    // Must use a valid CUID-format ID — the route validates the ID param
    const resp = await app.inject({
      method: 'DELETE',
      url: '/api/posts/cltest0000000000000xxxx01',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    const resp = await app.inject({ method: 'DELETE', url: '/api/posts/any-id' })
    expect(resp.statusCode).toBe(401)
  })
})

// ── POST /api/posts/:id/bookmark ──────────────────────────────────────────────

describe('POST /api/posts/:id/bookmark', () => {
  it('toggles bookmark on for a post', async () => {
    mockPrisma.postBookmark.findUnique.mockResolvedValue(null)
    mockPrisma.postBookmark.create.mockResolvedValue({ id: 'bm1', userId: TEST_USER.sub, postId: 'post1' })

    const resp = await app.inject({
      method: 'POST',
      url: '/api/posts/post1/bookmark',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { bookmarked: boolean } }>()
    expect(body.data.bookmarked).toBe(true)
  })

  it('toggles bookmark off when already bookmarked', async () => {
    mockPrisma.postBookmark.findUnique.mockResolvedValue({ id: 'bm1', userId: TEST_USER.sub, postId: 'post1' })
    mockPrisma.postBookmark.delete.mockResolvedValue({ id: 'bm1' })

    const resp = await app.inject({
      method: 'POST',
      url: '/api/posts/post1/bookmark',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resp.statusCode).toBe(200)
    const body = resp.json<{ success: true; data: { bookmarked: boolean } }>()
    expect(body.data.bookmarked).toBe(false)
  })
})
