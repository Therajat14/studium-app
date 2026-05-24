import { randomBytes } from 'crypto'

// Generates a cryptographically secure opaque refresh token stored in the DB.
// Not a JWT — intentionally opaque so it can be revoked server-side.
export const generateRefreshToken = (): string => randomBytes(40).toString('hex')
