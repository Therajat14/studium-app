import { Redis } from 'ioredis'
import { env } from './env.js'

const SHARED_OPTIONS = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
} as const

// Shared client for general use (cache, presence)
export const redis = new Redis(env.REDIS_URL, SHARED_OPTIONS)

// Factory used to create additional clients (pub/sub, BullMQ)
export const createRedisClient = (): Redis => new Redis(env.REDIS_URL, SHARED_OPTIONS)

redis.on('error', (err: Error) => {
  console.error('[Redis] connection error:', err.message)
})

export const closeRedis = async (): Promise<void> => {
  await redis.quit()
}
