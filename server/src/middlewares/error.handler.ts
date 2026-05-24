import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

// Centralised error handler registered with fastify.setErrorHandler().
// Normalises all unhandled errors into the standard API response shape.
export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // ZodError: schema validation threw instead of using safeParse — treat as 400
  if (error instanceof ZodError) {
    const msg = error.issues[0]?.message ?? 'Validation failed'
    return reply.status(400).send({ success: false, error: { message: msg } })
  }

  const statusCode = error.statusCode ?? 500

  if (statusCode >= 500) {
    request.log.error({ err: error, req: { method: request.method, url: request.url } })
  }

  const message =
    statusCode >= 500
      ? 'An unexpected error occurred. Please try again later.'
      : (error.message ?? 'Something went wrong')

  return reply.status(statusCode).send({
    success: false,
    error: { message },
  })
}
