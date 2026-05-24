import type { StorageProvider, UploadOptions, UploadResult } from '../storage.js'
import { StorageNotConfiguredError } from '../storage.js'

// Returned by the factory when Cloudinary env vars are absent.
// Every method immediately throws StorageNotConfiguredError, which the
// upload controller maps to a 503 response.
export class NullStorageProvider implements StorageProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  upload(_buffer: Buffer, _options: UploadOptions): Promise<UploadResult> {
    throw new StorageNotConfiguredError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(_publicId: string, _resourceType: 'image' | 'video' | 'raw'): Promise<void> {
    throw new StorageNotConfiguredError()
  }
}
