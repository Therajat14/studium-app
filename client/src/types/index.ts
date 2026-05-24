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
