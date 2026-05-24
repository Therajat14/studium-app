import { z } from 'zod'

// ─── Update Profile ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  college: z.string().max(100).trim().nullable().optional(),
  branch: z.string().max(100).trim().nullable().optional(),
  year: z.coerce.number().int().min(1).max(6).nullable().optional(),
  bio: z.string().max(500).trim().nullable().optional(),
  links: z
    .object({
      github: z.string().url().nullable().optional(),
      linkedin: z.string().url().nullable().optional(),
      portfolio: z.string().url().nullable().optional(),
      twitter: z.string().url().nullable().optional(),
    })
    .nullable()
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ─── User list query params ────────────────────────────────────────────────

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(100).optional(),
  college: z.string().trim().max(100).optional(),
  role: z.enum(['STUDENT', 'ALUMNI', 'MENTOR', 'ADMIN']).optional(),
})

export type UserListQuery = z.infer<typeof userListQuerySchema>

// ─── Follow/unfollow params ────────────────────────────────────────────────

export const userIdParamSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
})

export type UserIdParam = z.infer<typeof userIdParamSchema>
