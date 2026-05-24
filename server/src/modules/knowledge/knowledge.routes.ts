import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { prisma } from '../../config/prisma.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['PDF','DOC','SPREADSHEET','IMAGE','VIDEO','LINK','COLLABORATIVE']),
  subject: z.string().max(100).optional(),
  course: z.string().max(50).optional(),
  fileUrl: z.string().url().optional(),
  fileSize: z.number().int().optional(),
  isCollaborative: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export const knowledgeRoutes: FastifyPluginAsync = async (fastify) => {
  // List resources
  fastify.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { type, subject, search, page = '1', limit = '20' } = req.query as any
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (type) where.type = type
    if (subject) where.subject = { contains: subject, mode: 'insensitive' }
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true, avatarUrl: true, karma: true } },
          _count: { select: { bookmarks: true, ratings: true } },
          ratings: { select: { rating: true } },
          bookmarks: { where: { userId: req.user.sub }, select: { id: true } },
        },
      }),
      prisma.resource.count({ where }),
    ])

    const mapped = items.map((r) => ({
      ...r,
      avgRating: r.ratings.length ? r.ratings.reduce((a, b) => a + b.rating, 0) / r.ratings.length : 0,
      isBookmarked: r.bookmarks.length > 0,
      reviewCount: r._count.ratings,
    }))

    return sendSuccess(reply, { items: mapped, total, page: parseInt(page) })
  })

  // Create resource
  fastify.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const result = createSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid data', 400)

    const { description, subject, course, fileUrl, fileSize, isCollaborative, tags } = result.data
    const resource = await prisma.resource.create({
      data: {
        title: result.data.title,
        type: result.data.type,
        description: description ?? null,
        subject: subject ?? null,
        course: course ?? null,
        fileUrl: fileUrl ?? null,
        fileSize: fileSize ?? null,
        isCollaborative: isCollaborative ?? false,
        uploadedById: req.user.sub,
        tags: tags ?? [],
      },
      include: {
        uploadedBy: { select: { id: true, name: true, avatarUrl: true, karma: true } },
      },
    })
    return sendSuccess(reply, resource, 201)
  })

  // Bookmark / unbookmark
  fastify.post('/:id/bookmark', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const existing = await prisma.resourceBookmark.findUnique({
      where: { userId_resourceId: { userId: req.user.sub, resourceId: id } },
    })
    if (existing) {
      await prisma.resourceBookmark.delete({ where: { id: existing.id } })
      return sendSuccess(reply, { bookmarked: false })
    }
    await prisma.resourceBookmark.create({ data: { userId: req.user.sub, resourceId: id } })
    return sendSuccess(reply, { bookmarked: true })
  })

  // Rate resource
  fastify.post('/:id/rate', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { rating } = req.body as { rating: number }
    if (!rating || rating < 1 || rating > 5) return sendError(reply, 'Rating must be 1-5', 400)

    await prisma.resourceRating.upsert({
      where: { userId_resourceId: { userId: req.user.sub, resourceId: id } },
      create: { userId: req.user.sub, resourceId: id, rating },
      update: { rating },
    })
    return sendSuccess(reply, { rated: true })
  })

  // Increment download count
  fastify.post('/:id/download', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await prisma.resource.update({ where: { id }, data: { downloads: { increment: 1 } } })
    return sendSuccess(reply, { ok: true })
  })
}
