import { env } from './env.js'
import { CloudinaryProvider } from '../lib/storage/cloudinary.provider.js'
import { NullStorageProvider } from '../lib/storage/null.provider.js'
import type { StorageProvider } from '../lib/storage.js'

// Returns the real Cloudinary provider when credentials are present,
// or NullStorageProvider (throws 503-mapped errors) when they are absent.
// The server boots cleanly either way.
const createStorageProvider = (): StorageProvider => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    return new CloudinaryProvider(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
  }
  return new NullStorageProvider()
}

export const storageProvider: StorageProvider = createStorageProvider()

export const isStorageConfigured = (): boolean =>
  !(storageProvider instanceof NullStorageProvider)
