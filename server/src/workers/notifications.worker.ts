import { Worker } from 'bullmq'
import { createRedisClient } from '../config/redis.js'
import { pushProvider } from '../lib/push/push.provider.js'
import type { PushPayload } from '../lib/push/push.provider.js'

export interface NotificationJobData {
  userId:  string
  payload: PushPayload
}

let _worker: Worker | null = null

export const startNotificationsWorker = (): Worker => {
  _worker = new Worker<NotificationJobData>(
    'notifications',
    async (job) => {
      await pushProvider.send(job.data.userId, job.data.payload)
    },
    {
      connection: createRedisClient(),
      concurrency: 10,
    },
  )

  _worker.on('failed', (job, err) => {
    console.error(`[notifications-worker] job ${job?.id ?? '?'} failed:`, err.message)
  })

  return _worker
}

export const stopNotificationsWorker = async (): Promise<void> => {
  await _worker?.close()
}
