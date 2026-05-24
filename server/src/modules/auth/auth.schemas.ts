import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
  rollNumber: z.string().trim().optional(),
  college: z.string().max(100).trim().optional(),
  branch: z.string().max(100).trim().optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  bio: z.string().max(500).trim().optional(),
  skills: z.array(z.string().max(50)).optional(),
  links: z.object({
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
