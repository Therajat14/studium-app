import type { FastifyReply } from 'fastify'
import type { PaginatedResult } from './pagination.js'

// All API responses share this shape to keep client-side parsing consistent.
// success: true  → data contains the result
// success: false → error.message describes the problem

export const sendSuccess = (reply: FastifyReply, data: unknown, statusCode = 200) =>
  reply.status(statusCode).send({ success: true, data })

export const sendError = (reply: FastifyReply, message: string, statusCode = 400) =>
  reply.status(statusCode).send({ success: false, error: { message } })

export const sendPaginated = <T>(reply: FastifyReply, result: PaginatedResult<T>) =>
  reply.status(200).send({ success: true, data: result })
