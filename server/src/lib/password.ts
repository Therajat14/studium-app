import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS)

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash)
