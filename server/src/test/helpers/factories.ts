/** Lightweight in-memory factories for test data. */

export const makeUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id:         'cltest0000000000000user001',
  name:       'Test User',
  email:      'testuser@college.edu',
  password:   '$2a$10$hashedpasswordfortest1234567890123456789012',
  role:       'STUDENT' as const,
  college:    'Graphic Era University (GEU)',
  branch:     'B.Tech Computer Science Engineering (CSE)',
  year:       2,
  bio:        null,
  avatarUrl:  null,
  skills:     [],
  karma:      0,
  links:      null,
  rollNumber: 'GEU21CS001',
  createdAt:  new Date('2024-01-01'),
  ...overrides,
})

export const makePost = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id:        'cltest0000000000000post001',
  title:     'Test Post Title',
  content:   'Test post content that is more than enough characters.',
  type:      'DISCUSSION' as const,
  viewCount: 0,
  authorId:  'cltest0000000000000user001',
  deletedAt: null,
  createdAt:  new Date('2024-01-01'),
  updatedAt:  new Date('2024-01-01'),
  author: {
    id:        'cltest0000000000000user001',
    name:      'Test User',
    avatarUrl: null,
    role:      'STUDENT' as const,
    college:   'Graphic Era University (GEU)',
  },
  tags:  [],
  media: [],
  _count: { reactions: 0, comments: 0 },
  ...overrides,
})

export const makeLostFoundItem = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id:          'cltest0000000000000lf00001',
  type:        'LOST' as const,
  category:    'ELECTRONICS' as const,
  title:       'Lost Laptop',
  description: 'Lost my laptop in the library. It has a red sticker.',
  location:    'Main Library, 2nd Floor',
  imageUrl:    null,
  contactInfo: '9876543210',
  status:      'OPEN' as const,
  authorId:    'cltest0000000000000user001',
  createdAt:   new Date('2024-01-01'),
  updatedAt:   new Date('2024-01-01'),
  author: {
    id:        'cltest0000000000000user001',
    name:      'Test User',
    avatarUrl: null,
    branch:    'B.Tech Computer Science Engineering (CSE)',
    year:      2,
  },
  _count: { claims: 0 },
  ...overrides,
})

export const makeRefreshToken = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id:        'cltest0000000000000rt00001',
  token:     'test-refresh-token-opaque-string-12345678',
  userId:    'cltest0000000000000user001',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  ...overrides,
})
