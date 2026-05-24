import { Queue } from 'bullmq'
import { createRedisClient } from '../redis.js'

const connection = createRedisClient()

// ─── Queue definitions ─────────────────────────────────────────────────────

/** Delivers push notifications to users who are offline. */
export const notificationsQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts:    3,
    backoff:     { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail:     { count: 500 },
  },
})

/** Deletes Cloudinary assets for media rows that were never attached to a post. */
export const cleanupQueue = new Queue('cleanup', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff:  { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail:     { count: 200 },
  },
})

export const closeQueues = async (): Promise<void> => {
  await Promise.all([notificationsQueue.close(), cleanupQueue.close()])
}
