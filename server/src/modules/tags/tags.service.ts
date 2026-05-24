import { prisma } from '../../config/prisma.js'
import { postSelect } from '../posts/posts.repository.js'
import type { PostType } from '@prisma/client'

export const listTags = () =>
  prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select:  { id: true, name: true, slug: true, _count: { select: { posts: true } } },
  })

export const getPostsByTag = async (opts: {
  slug:   string
  cursor?: string
  limit:  number
  type?:  PostType
}) => {
  const tag = await prisma.tag.findUnique({ where: { slug: opts.slug } })
  if (!tag) return null

  const rows = await prisma.post.findMany({
    take: opts.limit + 1,
    ...(opts.cursor !== undefined && { cursor: { id: opts.cursor }, skip: 1 }),
    where: {
      deletedAt: null,
      tags:      { some: { tagId: tag.id } },
      ...(opts.type !== undefined && { type: opts.type }),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select:  postSelect,
  })

  const hasMore    = rows.length > opts.limit
  const items      = hasMore ? rows.slice(0, opts.limit) : rows
  const last       = items[items.length - 1]
  const nextCursor = hasMore && last ? last.id : null
  return { tag, items, nextCursor, hasMore }
}
