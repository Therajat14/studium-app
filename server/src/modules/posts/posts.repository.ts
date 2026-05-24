import { prisma } from '../../config/prisma.js'
import { sanitizeUserInput } from '../../lib/sanitize.js'
import type { UpdatePostInput } from './posts.schemas.js'

// ─── Shared select ─────────────────────────────────────────────────────────

export const postSelect = {
  id:        true,
  title:     true,
  content:   true,
  type:      true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  author: {
    select: { id: true, name: true, avatarUrl: true, role: true, college: true },
  },
  tags: {
    select: { tag: { select: { id: true, name: true, slug: true } } },
  },
  media: {
    select: { id: true, url: true, resourceType: true, bytes: true, originalName: true },
  },
  _count: {
    select: { reactions: true, comments: true },
  },
} as const

// ─── Queries ───────────────────────────────────────────────────────────────

export const findPostById = (id: string) =>
  prisma.post.findUnique({ where: { id, deletedAt: null }, select: postSelect })

export const createPost = async (
  authorId: string,
  data: {
    title?: string
    content: string
    type: 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT' | 'RESOURCE'
    tagNames: string[]
    mediaIds: string[]
  },
) => {
  // Upsert tags by slug, then get their IDs
  const tagRecords = await Promise.all(
    data.tagNames.map((name) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
        select: { id: true },
      })
    }),
  )

  const post = await prisma.post.create({
    data: {
      title:    data.title ? sanitizeUserInput(data.title) : null,
      content:  sanitizeUserInput(data.content),
      type:     data.type,
      authorId,
      tags: {
        create: tagRecords.map((t) => ({ tagId: t.id })),
      },
    },
    select: postSelect,
  })

  // Attach media — verify ownership before linking
  if (data.mediaIds.length > 0) {
    await prisma.media.updateMany({
      where: { id: { in: data.mediaIds }, uploadedById: authorId, postId: null },
      data:  { postId: post.id },
    })
  }

  return findPostById(post.id)
}

export const updatePost = async (id: string, data: UpdatePostInput) => {
  if (data.tags !== undefined) {
    // Replace tag set: delete all PostTag rows for this post, recreate
    const tagRecords = await Promise.all(
      data.tags.map((name) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
          select: { id: true },
        })
      }),
    )

    await prisma.$transaction([
      prisma.postTag.deleteMany({ where: { postId: id } }),
      prisma.postTag.createMany({
        data: tagRecords.map((t) => ({ postId: id, tagId: t.id })),
        skipDuplicates: true,
      }),
    ])
  }

  await prisma.post.update({
    where: { id },
    data: {
      ...(data.title   !== undefined && { title:   sanitizeUserInput(data.title) }),
      ...(data.content !== undefined && { content: sanitizeUserInput(data.content) }),
    },
  })

  return findPostById(id)
}

export const softDeletePost = (id: string) =>
  prisma.post.update({ where: { id }, data: { deletedAt: new Date() } })

export const incrementViewCount = (id: string) =>
  prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } })
