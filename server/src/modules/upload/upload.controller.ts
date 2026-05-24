import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { storageProvider } from '../../config/storage.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { StorageNotConfiguredError, getMimeInfo, ALLOWED_MIME_LIST } from '../../lib/storage.js'
import { env } from '../../config/env.js'

const SIZE_LIMITS: Record<'image' | 'pdf' | 'video', number> = {
  image: env.UPLOAD_MAX_IMAGE_BYTES,
  pdf:   env.UPLOAD_MAX_PDF_BYTES,
  video: env.UPLOAD_MAX_VIDEO_BYTES,
}

export const uploadFileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  // 1. Parse multipart
  const data = await request.file()
  if (!data) return sendError(reply, 'No file provided', 400)

  const mimeType = data.mimetype
  const mimeInfo = getMimeInfo(mimeType)

  // 2. MIME type validation
  if (!mimeInfo) {
    return sendError(
      reply,
      `Unsupported file type. Allowed: ${ALLOWED_MIME_LIST.join(', ')}`,
      415,
    )
  }

  // 3. Buffer the stream so we can check size
  const chunks: Buffer[] = []
  for await (const chunk of data.file) {
    chunks.push(chunk as Buffer)
  }
  const buffer = Buffer.concat(chunks)
  const sizeLimit = SIZE_LIMITS[mimeInfo.maxBytes]

  // 4. Size validation
  if (buffer.length > sizeLimit) {
    return sendError(
      reply,
      `File too large. Max size for this type: ${Math.round(sizeLimit / 1024 / 1024)} MB`,
      413,
    )
  }

  try {
    // 5. Upload to storage provider
    const result = await storageProvider.upload(buffer, {
      folder: env.CLOUDINARY_UPLOAD_FOLDER,
      resourceType: mimeInfo.cloudinaryType,
      originalName: data.filename,
    })

    // 6. Persist metadata — postId null until attached to a post
    const media = await prisma.media.create({
      data: {
        url:          result.url,
        publicId:     result.publicId,
        resourceType: result.resourceType,
        bytes:        result.bytes,
        originalName: data.filename,
        uploadedById: request.user.sub,
      },
      select: { id: true, url: true, resourceType: true, bytes: true, originalName: true },
    })

    return sendSuccess(reply, media, 201)
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      return sendError(reply, 'File uploads are not configured on this server', 503)
    }
    throw err
  }
}

export const deleteUploadHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string }
  const callerId = request.user.sub

  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) return sendError(reply, 'Media not found', 404)
  if (media.uploadedById !== callerId) return sendError(reply, 'Forbidden', 403)
  if (media.postId !== null) return sendError(reply, 'Cannot delete media attached to a post', 409)

  try {
    await storageProvider.delete(media.publicId, media.resourceType === 'VIDEO' ? 'video' : media.resourceType === 'PDF' ? 'raw' : 'image')
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      return sendError(reply, 'File uploads are not configured on this server', 503)
    }
    throw err
  }

  await prisma.media.delete({ where: { id } })
  return sendSuccess(reply, { message: 'Deleted' })
}
