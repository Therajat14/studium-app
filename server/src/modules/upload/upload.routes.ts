import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { uploadFileHandler, deleteUploadHandler } from './upload.controller.js'

export const uploadRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/', { preHandler: [authenticate] }, uploadFileHandler)
  fastify.delete('/:id', { preHandler: [authenticate] }, deleteUploadHandler)
}
