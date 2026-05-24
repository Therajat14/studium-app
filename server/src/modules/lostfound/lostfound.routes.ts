import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { prisma } from '../../config/prisma.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { z } from 'zod'

const createSchema = z.object({
  type:        z.enum(['LOST', 'FOUND']),
  category:    z.enum(['ELECTRONICS','DOCUMENTS','CLOTHING','ACCESSORIES','BOOKS','KEYS','BAGS','OTHER']),
  title:       z.string().min(3).max(200),
  description: z.string().min(10),
  location:    z.string().max(200).optional(),
  imageUrl:    z.string().url().optional(),
  contactInfo: z.string().max(200).optional(),
})

const claimSchema = z.object({
  message: z.string().min(5),
})

const authorSelect = { id: true, name: true, avatarUrl: true, branch: true, year: true } as const

export const lostFoundRoutes: FastifyPluginAsync = async (fastify) => {
  // List items
  fastify.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { type, category, status, search, page = '1', limit = '20' } = req.query as any
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (type)     where.type     = type
    if (category) where.category = category
    if (status)   where.status   = status
    if (search)   where.OR = [
      { title:       { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location:    { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      prisma.lostFoundItem.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: authorSelect },
          _count: { select: { claims: true } },
        },
      }),
      prisma.lostFoundItem.count({ where }),
    ])

    return sendSuccess(reply, { items, total, page: parseInt(page) })
  })

  // Get single item
  fastify.get('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const item = await prisma.lostFoundItem.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        claims: {
          include: { user: { select: authorSelect } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { claims: true } },
      },
    })
    if (!item) return sendError(reply, 'Not found', 404)
    return sendSuccess(reply, item)
  })

  // Create item
  fastify.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const result = createSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid', 400)

    const { location, imageUrl, contactInfo, ...rest } = result.data
    const item = await prisma.lostFoundItem.create({
      data: {
        ...rest,
        location:    location    ?? null,
        imageUrl:    imageUrl    ?? null,
        contactInfo: contactInfo ?? null,
        authorId: req.user.sub,
      },
      include: { author: { select: authorSelect }, _count: { select: { claims: true } } },
    })
    return sendSuccess(reply, item, 201)
  })

  // Mark as resolved (author only)
  fastify.patch('/:id/resolve', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const item = await prisma.lostFoundItem.findUnique({ where: { id } })
    if (!item) return sendError(reply, 'Not found', 404)
    if (item.authorId !== req.user.sub) return sendError(reply, 'Forbidden', 403)
    const updated = await prisma.lostFoundItem.update({
      where: { id },
      data: { status: 'RESOLVED' },
      include: { author: { select: authorSelect }, _count: { select: { claims: true } } },
    })
    return sendSuccess(reply, updated)
  })

  // Delete own item
  fastify.delete('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const item = await prisma.lostFoundItem.findUnique({ where: { id } })
    if (!item) return sendError(reply, 'Not found', 404)
    if (item.authorId !== req.user.sub) return sendError(reply, 'Forbidden', 403)
    await prisma.lostFoundItem.delete({ where: { id } })
    return sendSuccess(reply, { deleted: true })
  })

  // Claim / "I found this" or "This is mine"
  fastify.post('/:id/claim', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const result = claimSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid', 400)

    const item = await prisma.lostFoundItem.findUnique({ where: { id } })
    if (!item) return sendError(reply, 'Not found', 404)
    if (item.authorId === req.user.sub) return sendError(reply, 'Cannot claim your own item', 400)

    const existing = await prisma.lostFoundClaim.findUnique({
      where: { itemId_userId: { itemId: id, userId: req.user.sub } },
    })
    if (existing) return sendError(reply, 'Already claimed', 409)

    const claim = await prisma.lostFoundClaim.create({
      data: { itemId: id, userId: req.user.sub, message: result.data.message },
      include: { user: { select: authorSelect } },
    })
    return sendSuccess(reply, claim, 201)
  })
}
