import {
  findUserById,
  findUsers,
  updateUser,
  createFollow,
  deleteFollow,
  findFollow,
  findFollowers,
  findFollowing,
} from './users.repository.js'
import { toPaginatedResult } from '../../lib/pagination.js'
import type { UpdateProfileInput, UserListQuery } from './users.schemas.js'

// ─── Error codes ───────────────────────────────────────────────────────────

export type UserErrorCode =
  | 'USER_NOT_FOUND'
  | 'SELF_FOLLOW'
  | 'ALREADY_FOLLOWING'
  | 'NOT_FOLLOWING'

export class UserError extends Error {
  constructor(public readonly code: UserErrorCode) {
    super(code)
    this.name = 'UserError'
  }
}

// ─── Profile ───────────────────────────────────────────────────────────────

export const getProfile = async (id: string) => {
  const user = await findUserById(id)
  if (!user) throw new UserError('USER_NOT_FOUND')
  return user
}

export const listUsers = async (query: UserListQuery) => {
  const { items, total } = await findUsers(query)
  return toPaginatedResult(items, total, { page: query.page, limit: query.limit })
}

export const updateProfile = async (id: string, data: UpdateProfileInput) => {
  const user = await findUserById(id)
  if (!user) throw new UserError('USER_NOT_FOUND')
  return updateUser(id, data)
}

// ─── Follow graph ──────────────────────────────────────────────────────────

export const followUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) throw new UserError('SELF_FOLLOW')

  const target = await findUserById(followingId)
  if (!target) throw new UserError('USER_NOT_FOUND')

  const existing = await findFollow(followerId, followingId)
  if (existing) throw new UserError('ALREADY_FOLLOWING')

  await createFollow(followerId, followingId)
}

export const unfollowUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) throw new UserError('SELF_FOLLOW')

  const existing = await findFollow(followerId, followingId)
  if (!existing) throw new UserError('NOT_FOLLOWING')

  await deleteFollow(followerId, followingId)
}

export const getFollowers = async (userId: string, page: number, limit: number) => {
  const user = await findUserById(userId)
  if (!user) throw new UserError('USER_NOT_FOUND')

  const { items, total } = await findFollowers(userId, page, limit)
  return toPaginatedResult(items, total, { page, limit })
}

export const getFollowing = async (userId: string, page: number, limit: number) => {
  const user = await findUserById(userId)
  if (!user) throw new UserError('USER_NOT_FOUND')

  const { items, total } = await findFollowing(userId, page, limit)
  return toPaginatedResult(items, total, { page, limit })
}
