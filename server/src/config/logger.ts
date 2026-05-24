import { env } from './env.js'

// Fastify uses pino internally. We export a config object used when creating
// the Fastify instance, keeping logging setup in one place.
export const loggerConfig =
  env.NODE_ENV === 'production'
    ? {
        level: 'info',
      }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
