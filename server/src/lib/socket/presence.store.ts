import { redis } from '../../config/redis.js'

// Redis HASH: presence:{userId} → { [socketId]: "1" }
// A user is online when HLEN > 0.
// TTL of 1 hour acts as a safety-net; socket disconnect events are the primary cleanup path.

const key = (userId: string): string => `presence:${userId}`

/** Record a new socket connection. Returns true if this brings the user online. */
export const addConnection = async (userId: string, socketId: string): Promise<boolean> => {
  const k = key(userId)
  const pipeline = redis.multi()
  pipeline.hset(k, socketId, '1')
  pipeline.expire(k, 3600)
  pipeline.hlen(k)
  const results = await pipeline.exec()
  const count = results?.[2]?.[1]
  return typeof count === 'number' ? count === 1 : false
}

/** Remove a socket connection. Returns true if the user just went offline. */
export const removeConnection = async (userId: string, socketId: string): Promise<boolean> => {
  const k = key(userId)
  await redis.hdel(k, socketId)
  const count = await redis.hlen(k)
  return count === 0
}

export const isOnline = async (userId: string): Promise<boolean> => {
  const count = await redis.hlen(key(userId))
  return count > 0
}

/** Returns online status for a batch of user IDs. */
export const batchIsOnline = async (userIds: string[]): Promise<Record<string, boolean>> => {
  if (userIds.length === 0) return {}
  const pipeline = redis.pipeline()
  for (const id of userIds) pipeline.hlen(key(id))
  const results = await pipeline.exec()
  const out: Record<string, boolean> = {}
  userIds.forEach((id, i) => {
    const val = results?.[i]?.[1]
    out[id] = typeof val === 'number' ? val > 0 : false
  })
  return out
}
