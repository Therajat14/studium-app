import { Worker } from 'bullmq'
import { createRedisClient } from '../config/redis.js'
import { storageProvider } from '../config/storage.js'
import { prisma } from '../config/prisma.js'

export interface CleanupJobData {
  mediaId:  string
  publicId: string
}

let _worker: Worker | null = null

export const startCleanupWorker = (): Worker => {
  _worker = new Worker<CleanupJobData>(
    'cleanup',
    async (job) => {
      const { mediaId, publicId } = job.data

      const media = await prisma.media.findUnique({ where: { id: mediaId } })
      if (!media || media.postId !== null) return // attached — skip deletion

      const cloudinaryType = media.resourceType === 'VIDEO'
        ? 'video'
        : media.resourceType === 'PDF' ? 'raw' : 'image'

      await storageProvider.delete(publicId, cloudinaryType)
      await prisma.media.delete({ where: { id: mediaId } })
    },
    {
      connection: createRedisClient(),
      concurrency: 5,
    },
  )

  _worker.on('failed', (job, err) => {
    console.error(`[cleanup-worker] job ${job?.id ?? '?'} failed:`, err.message)
  })

  return _worker
}

export const stopCleanupWorker = async (): Promise<void> => {
  await _worker?.close()
}
