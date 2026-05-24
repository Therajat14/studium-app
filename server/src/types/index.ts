import '@fastify/jwt'

// ─── JWT Payload ───────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string   // user id
  email: string
  role: string
}

// Augment @fastify/jwt so request.user is typed everywhere
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

// ─── Safe User ─────────────────────────────────────────────────────────────

// Shape of a user object safe to return in API responses (no password)
export interface SafeUser {
  id: string
  name: string
  email: string
  role: string
  college: string | null
  branch: string | null
  year: number | null
  bio: string | null
  avatarUrl: string | null
  createdAt: Date
}
