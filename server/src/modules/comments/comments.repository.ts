import { prisma } from '../../config/prisma.js'
import { sanitizeUserInput } from '../../lib/sanitize.js'
import type { CreateCommentInput, UpdateCommentInput } from './comments.schemas.js'

// ─── Shared select ─────────────────────────────────────────────────────────

const commentSelect = {
  id:        true,
  content:   true,
  parentId:  true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  author: { select: { id: true, name: true, avatarUrl: true, role: true } },
  _count: { select: { reactions: true, replies: true } },
} as const

// ─── List top-level comments with their replies in one round-trip ──────────
// Strategy: fetch top-level comments (parentId IS NULL) with cursor pagination,
// then include their replies via Prisma's nested `replies` include.
// This avoids N+1 by loading all replies in a single JOIN — Prisma translates
// `include: { replies }` into a WHERE parentId IN (...) query, not N queries.

export const findCommentsByPost = async (opts: {
  postId: string
  cursor?: string
  limit: number
}) => {
  const rows = await prisma.comment.findMany({
    take: opts.limit + 1,
    ...(opts.cursor && { cursor: { id: opts.cursor }, skip: 1 }),
    where: { postId: opts.postId, parentId: null, deletedAt: null },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      ...commentSelect,
      // Load direct replies inline — one extra WHERE parentId IN (...) query
      replies: {
        where: { deletedAt: null },
        orderBy: [{ createdAt: 'asc' }],
        select: commentSelect,
      },
    },
  })

  const hasMore = rows.length > opts.limit
  const items   = hasMore ? rows.slice(0, opts.limit) : rows
  const last    = items[items.length - 1]
  return { items, nextCursor: hasMore && last ? last.id : null }
}

export const findCommentById = (id: string) =>
  prisma.comment.findUnique({ where: { id, deletedAt: null }, select: commentSelect })

export const createComment = (
  authorId: string,
  postId:   string,
  data:     CreateCommentInput,
) =>
  prisma.comment.create({
    data: {
      content:  sanitizeUserInput(data.content),
      authorId,
      postId,
      parentId: data.parentId ?? null,
    },
    select: commentSelect,
  })

export const updateComment = (id: string, data: UpdateCommentInput) =>
  prisma.comment.update({
    where: { id },
    data:  { content: sanitizeUserInput(data.content) },
    select: commentSelect,
  })

export const softDeleteComment = (id: string) =>
  prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } })
