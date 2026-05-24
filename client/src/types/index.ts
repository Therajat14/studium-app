// ─── User ──────────────────────────────────────────────────────────────────

export type Role = 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN'

export interface UserLinks {
  github?: string | null
  linkedin?: string | null
  portfolio?: string | null
  twitter?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  college: string | null
  branch: string | null
  year: number | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
}

// Richer profile returned by GET /users/:id (includes social counts + links)
export interface UserProfile extends User {
  links: UserLinks | null
  _count: {
    followers: number
    following: number
  }
}

// ─── Post ──────────────────────────────────────────────────────────────────

export type PostType = 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT' | 'RESOURCE'
export type ReactionType = 'LIKE' | 'UPVOTE'
export type MediaType = 'IMAGE' | 'VIDEO' | 'PDF' | 'DOCUMENT'

export interface PostAuthor {
  id: string
  name: string
  avatarUrl: string | null
  role: Role
  college: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Media {
  id: string
  url: string
  resourceType: MediaType
  bytes: number
  originalName: string
}

export interface Post {
  id: string
  title: string | null
  content: string
  type: PostType
  viewCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: PostAuthor
  tags: Array<{ tag: Tag }>
  media: Media[]
  _count: { reactions: number; comments: number }
}

// ─── Comment ───────────────────────────────────────────────────────────────

export interface Comment {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: PostAuthor
  _count: { reactions: number; replies: number }
  replies?: Comment[]
}

// ─── Feed ──────────────────────────────────────────────────────────────────

export type FeedSort = 'latest' | 'trending' | 'following'

export interface FeedResponse {
  items: Post[]
  nextCursor: string | null
  hasMore: boolean
  sort: string
}

// ─── Reaction ──────────────────────────────────────────────────────────────

export interface ReactionResult {
  reacted: boolean
  type: ReactionType
  counts: Record<ReactionType, number>
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ─── API response envelope ─────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: { message: string }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string
  user: User
}
