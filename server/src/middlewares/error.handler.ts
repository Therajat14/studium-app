import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify'

// Centralised error handler registered with fastify.setErrorHandler().
// Normalises all unhandled errors into the standard API response shape.
export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
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
