import { prisma, Prisma } from '../../config/prisma.js'
import type { UpdateProfileInput, UserListQuery } from './users.schemas.js'
import { toSkipTake } from '../../lib/pagination.js'
import { sanitizeUserInput } from '../../lib/sanitize.js'

// ─── Selectors ─────────────────────────────────────────────────────────────

export const publicProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  college: true,
  branch: true,
  year: true,
  bio: true,
  avatarUrl: true,
  links: true,
  createdAt: true,
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
} as const

// ─── Queries ───────────────────────────────────────────────────────────────

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, select: publicProfileSelect })

export const findUsers = async (query: UserListQuery) => {
  const { page, limit, search, college, role } = query
  const { skip, take } = toSkipTake({ page, limit })

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { college: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(college && { college: { equals: college, mode: 'insensitive' as const } }),
    ...(role && { role }),
  }

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take, select: publicProfileSelect, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ])

  return { items, total }
}

export const updateUser = (id: string, data: UpdateProfileInput) => {
  const updateData: Prisma.UserUpdateInput = {}
  if (data.name !== undefined) updateData.name = sanitizeUserInput(data.name)
  if (data.college !== undefined) updateData.college = data.college ? sanitizeUserInput(data.college) : null
  if (data.branch !== undefined) updateData.branch = data.branch ? sanitizeUserInput(data.branch) : null
  if (data.year !== undefined) updateData.year = data.year
  if (data.bio !== undefined) updateData.bio = data.bio ? sanitizeUserInput(data.bio) : null
  if (data.links !== undefined) updateData.links = data.links === null ? Prisma.DbNull : data.links

  return prisma.user.update({ where: { id }, data: updateData, select: publicProfileSelect })
}

// ─── Follow graph ──────────────────────────────────────────────────────────

export const createFollow = (followerId: string, followingId: string) =>
  prisma.follow.create({ data: { followerId, followingId } })

export const deleteFollow = (followerId: string, followingId: string) =>
  prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  })

export const findFollow = (followerId: string, followingId: string) =>
  prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })

export const findFollowers = async (userId: string, page: number, limit: number) => {
  const { skip, take } = toSkipTake({ page, limit })
  const where = { followingId: userId }

  const [follows, total] = await prisma.$transaction([
    prisma.follow.findMany({
      where,
      skip,
      take,
      select: { follower: { select: publicProfileSelect } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where }),
  ])

  return { items: follows.map((f) => f.follower), total }
}

export const findFollowing = async (userId: string, page: number, limit: number) => {
  const { skip, take } = toSkipTake({ page, limit })
  const where = { followerId: userId }

  const [follows, total] = await prisma.$transaction([
    prisma.follow.findMany({
      where,
      skip,
      take,
      select: { following: { select: publicProfileSelect } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where }),
  ])

  return { items: follows.map((f) => f.following), total }
}
