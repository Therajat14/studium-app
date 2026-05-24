import { v2 as cloudinary } from 'cloudinary'
import type { StorageProvider, UploadOptions, UploadResult } from '../storage.js'
import { getMimeInfo } from '../storage.js'

export class CloudinaryProvider implements StorageProvider {
  constructor(cloudName: string, apiKey: string, apiSecret: string) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  }

  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType,
          use_filename: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'))

          const mimeInfo = getMimeInfo(result.format ? `image/${result.format}` : '')
          const resourceType = mimeInfo?.mediaType ?? 'IMAGE'

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            resourceType,
          })
        },
      )
      stream.end(buffer)
    })
  }

  async delete(publicId: string, resourceType: 'image' | 'video' | 'raw'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  }
}
