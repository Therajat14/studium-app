import { redis } from '../../config/redis.js'

const DEFAULT_TTL = 300 // 5 minutes

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const raw = await redis.get(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const cacheSet = async <T>(
  key:  string,
  value: T,
  ttl:  number = DEFAULT_TTL,
): Promise<void> => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl)
}

export const cacheDel = async (key: string): Promise<void> => {
  await redis.del(key)
}

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}
