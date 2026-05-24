import { prisma, Prisma } from '../../config/prisma.js'
import { postSelect } from '../posts/posts.repository.js'
import type { PostType } from '@prisma/client'

// ─── Latest feed — cursor-based ────────────────────────────────────────────

export const getLatestFeed = async (opts: {
  cursor?: string
  limit: number
  type?: PostType
  college?: string
  branch?: string
}) => {
  const rows = await prisma.post.findMany({
    take: opts.limit + 1,
    ...(opts.cursor !== undefined && { cursor: { id: opts.cursor }, skip: 1 }),
    where: {
      deletedAt: null,
      ...(opts.type !== undefined && { type: opts.type }),
      ...(opts.college !== undefined && {
        author: {
          college: opts.college,
          ...(opts.branch !== undefined && { branch: opts.branch }),
        },
      }),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: postSelect,
  })

  const hasMore = rows.length > opts.limit
  const items   = hasMore ? rows.slice(0, opts.limit) : rows
  const last    = items[items.length - 1]
  return { items, nextCursor: hasMore && last ? last.id : null }
}

// ─── Following feed — cursor-based ─────────────────────────────────────────

export const getFollowingFeed = async (opts: {
  userId: string
  cursor?: string
  limit: number
  type?: PostType
  college?: string
  branch?: string
}) => {
  const follows = await prisma.follow.findMany({
    where:  { followerId: opts.userId },
    select: { followingId: true },
  })
  const followingIds = follows.map((f) => f.followingId)

  if (followingIds.length === 0) return { items: [], nextCursor: null }

  const rows = await prisma.post.findMany({
    take: opts.limit + 1,
    ...(opts.cursor !== undefined && { cursor: { id: opts.cursor }, skip: 1 }),
    where: {
      authorId:  { in: followingIds },
      deletedAt: null,
      ...(opts.type !== undefined && { type: opts.type }),
      ...(opts.college !== undefined && {
        author: {
          college: opts.college,
          ...(opts.branch !== undefined && { branch: opts.branch }),
        },
      }),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: postSelect,
  })

  const hasMore = rows.length > opts.limit
  const items   = hasMore ? rows.slice(0, opts.limit) : rows
  const last    = items[items.length - 1]
  return { items, nextCursor: hasMore && last ? last.id : null }
}

// ─── Trending feed — score-based, offset paginated ─────────────────────────
// Reddit Hot algorithm: (reactions + comments*2) / (age_hours + 1)^1.5
// Scoped to last 30 days. Uses Prisma.sql for the conditional type clause.

export const getTrendingFeed = async (opts: {
  page: number
  limit: number
  type?: PostType
}) => {
  const offset = (opts.page - 1) * opts.limit

  // Conditional type filter as a safe parameterized Prisma.sql fragment
  const typeClause = opts.type !== undefined
    ? Prisma.sql`AND p.type = ${opts.type}::"PostType"`
    : Prisma.sql``

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT p.id
    FROM "Post" p
    LEFT JOIN (
      SELECT "postId", COUNT(*) AS reaction_count
      FROM "PostReaction"
      GROUP BY "postId"
    ) r ON r."postId" = p.id
    LEFT JOIN (
      SELECT "postId", COUNT(*) AS comment_count
      FROM "Comment"
      WHERE "deletedAt" IS NULL
      GROUP BY "postId"
    ) c ON c."postId" = p.id
    WHERE p."deletedAt" IS NULL
      AND p."createdAt" > NOW() - INTERVAL '30 days'
      ${typeClause}
    ORDER BY
      (COALESCE(r.reaction_count, 0) + COALESCE(c.comment_count, 0) * 2.0)
        / POWER(EXTRACT(EPOCH FROM (NOW() - p."createdAt")) / 3600 + 1, 1.5) DESC,
      p."createdAt" DESC
    LIMIT ${opts.limit + 1}
    OFFSET ${offset}
  `

  const hasMore = rows.length > opts.limit
  const ids     = (hasMore ? rows.slice(0, opts.limit) : rows).map((r) => r.id)

  if (ids.length === 0) return { items: [], nextCursor: null }

  const posts = await prisma.post.findMany({
    where:  { id: { in: ids } },
    select: postSelect,
  })
  // Re-order to match trending rank
  const ordered = ids
    .map((id) => posts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  return { items: ordered, nextCursor: hasMore ? `page:${opts.page + 1}` : null }
}
