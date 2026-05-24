import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:5000/api'

// ── Test fixtures ─────────────────────────────────────────────────────────────

export const TEST_USER = {
  id:         'test-user-001',
  name:       'Test User',
  email:      'test@geu.ac.in',
  role:       'STUDENT' as const,
  college:    'Graphic Era University (GEU)',
  branch:     'B.Tech Computer Science Engineering (CSE)',
  year:       2,
  bio:        null,
  avatarUrl:  null,
  skills:     [],
  karma:      10,
  rollNumber: 'GEU21CS001',
  createdAt:  '2024-01-01T00:00:00.000Z',
}

export const TEST_POST = {
  id:        'post-001',
  title:     'Test Post',
  content:   'Test content for the post.',
  type:      'DISCUSSION' as const,
  viewCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  author: {
    id:        'test-user-001',
    name:      'Test User',
    avatarUrl: null,
    role:      'STUDENT' as const,
    college:   'Graphic Era University (GEU)',
  },
  tags:   [],
  media:  [],
  _count: { reactions: 0, comments: 0 },
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ success: true, data: { accessToken: 'mock-token', user: TEST_USER } }),
  ),

  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json(
      { success: true, data: { accessToken: 'mock-token', user: TEST_USER } },
      { status: 201 },
    ),
  ),

  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({ success: true, data: { accessToken: 'mock-token', user: TEST_USER } }),
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({ success: true, data: { user: TEST_USER } }),
  ),

  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json({ success: true, data: { message: 'Signed out successfully' } }),
  ),

  // Feed
  http.get(`${BASE}/feed`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [TEST_POST], nextCursor: null, hasMore: false, sort: 'latest' },
    }),
  ),

  // Posts
  http.get(`${BASE}/posts/:id`, ({ params }) =>
    HttpResponse.json({ success: true, data: { ...TEST_POST, id: params['id'] } }),
  ),

  http.post(`${BASE}/posts`, () =>
    HttpResponse.json({ success: true, data: TEST_POST }, { status: 201 }),
  ),

  http.delete(`${BASE}/posts/:id`, () =>
    HttpResponse.json({ success: true, data: { deleted: true } }),
  ),

  http.post(`${BASE}/posts/:id/bookmark`, () =>
    HttpResponse.json({ success: true, data: { bookmarked: true } }),
  ),

  // Comments
  http.get(`${BASE}/posts/:id/comments`, () =>
    HttpResponse.json({ success: true, data: { items: [], nextCursor: null, total: 0 } }),
  ),
]
