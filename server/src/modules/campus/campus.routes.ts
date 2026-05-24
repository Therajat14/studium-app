import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { prisma } from '../../config/prisma.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { z } from 'zod'

const createSchema = z.object({
  category: z.enum(['FACULTY','COURSE','FACILITY','FOOD','TRANSPORT','OTHER']),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  rating: z.number().min(1).max(5),
})

export const campusRoutes: FastifyPluginAsync = async (fastify) => {
  // List reviews
  fastify.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { category, search, page = '1', limit = '20' } = req.query as any
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (category) where.category = category
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      prisma.campusReview.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, branch: true, year: true } },
          votes: { where: { userId: req.user.sub }, select: { helpful: true } },
        },
      }),
      prisma.campusReview.count({ where }),
    ])

    const mapped = items.map((r) => ({
      ...r,
      userVote: r.votes[0]?.helpful ?? null,
      votes: undefined,
    }))

    return sendSuccess(reply, { items: mapped, total, page: parseInt(page) })
  })

  // Create review
  fastify.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const result = createSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid', 400)

    const review = await prisma.campusReview.create({
      data: { ...result.data, authorId: req.user.sub },
      include: { author: { select: { id: true, name: true, avatarUrl: true, branch: true, year: true } } },
    })
    return sendSuccess(reply, review, 201)
  })

  // Vote helpful
  fastify.post('/:id/vote', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { helpful } = req.body as { helpful: boolean }

    const existing = await prisma.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId: id, userId: req.user.sub } },
    })

    if (existing) {
      if (existing.helpful === helpful) {
        await prisma.reviewVote.delete({ where: { id: existing.id } })
        const delta = helpful ? -1 : 0
        const ndelta = helpful ? 0 : -1
        await prisma.campusReview.update({
          where: { id },
          data: { helpful: { increment: delta }, notHelpful: { increment: ndelta } },
        })
        return sendSuccess(reply, { voted: false })
      }
      await prisma.reviewVote.update({ where: { id: existing.id }, data: { helpful } })
    } else {
      await prisma.reviewVote.create({ data: { reviewId: id, userId: req.user.sub, helpful } })
    }

    const prev = existing
    const helpfulDelta = helpful ? 1 : (prev?.helpful ? -1 : 0)
    const notHelpfulDelta = !helpful ? 1 : (prev && !prev.helpful ? -1 : 0)
    await prisma.campusReview.update({
      where: { id },
      data: { helpful: { increment: helpfulDelta }, notHelpful: { increment: notHelpfulDelta } },
    })

    return sendSuccess(reply, { voted: true, helpful })
  })
}
