import 'dotenv/config'
import { env } from './config/env.js'
import { createApp } from './app.js'
import { prisma } from './config/prisma.js'

const start = async () => {
  const app = await createApp()

  // Verify DB connectivity before accepting traffic
  try {
    await prisma.$connect()
    app.log.info('Database connected')
  } catch (err) {
    app.log.error('Failed to connect to database')
    app.log.error(err)
    process.exit(1)
  }

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully`)
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

void start()
