import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Redis — optional; falls back to in-memory presence when absent
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Cloudinary — optional; upload endpoints return 503 when absent
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('studium/uploads'),
  UPLOAD_MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),   // 5 MB
  UPLOAD_MAX_PDF_BYTES: z.coerce.number().int().positive().default(20 * 1024 * 1024),    // 20 MB
  UPLOAD_MAX_VIDEO_BYTES: z.coerce.number().int().positive().default(100 * 1024 * 1024), // 100 MB
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n')
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
