import type { MediaType } from '@prisma/client'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UploadOptions {
  folder: string
  resourceType: 'image' | 'video' | 'raw' // Cloudinary resource type categories
  originalName: string
}

export interface UploadResult {
  url: string
  publicId: string
  bytes: number
  resourceType: MediaType
}

// ─── Interface ─────────────────────────────────────────────────────────────

export interface StorageProvider {
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>
  delete(publicId: string, resourceType: 'image' | 'video' | 'raw'): Promise<void>
}

// ─── Error ─────────────────────────────────────────────────────────────────

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Storage provider is not configured')
    this.name = 'StorageNotConfiguredError'
  }
}

// ─── MIME → MediaType mapping ──────────────────────────────────────────────

const ALLOWED_MIME_TYPES: Record<string, { mediaType: MediaType; cloudinaryType: 'image' | 'video' | 'raw'; maxBytes: 'image' | 'pdf' | 'video' }> = {
  'image/jpeg':      { mediaType: 'IMAGE',    cloudinaryType: 'image', maxBytes: 'image' },
  'image/png':       { mediaType: 'IMAGE',    cloudinaryType: 'image', maxBytes: 'image' },
  'image/webp':      { mediaType: 'IMAGE',    cloudinaryType: 'image', maxBytes: 'image' },
  'image/gif':       { mediaType: 'IMAGE',    cloudinaryType: 'image', maxBytes: 'image' },
  'video/mp4':       { mediaType: 'VIDEO',    cloudinaryType: 'video', maxBytes: 'video' },
  'video/webm':      { mediaType: 'VIDEO',    cloudinaryType: 'video', maxBytes: 'video' },
  'application/pdf': { mediaType: 'PDF',      cloudinaryType: 'raw',   maxBytes: 'pdf'   },
}

export const getMimeInfo = (mimeType: string) => ALLOWED_MIME_TYPES[mimeType] ?? null

export const ALLOWED_MIME_LIST = Object.keys(ALLOWED_MIME_TYPES)
