import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { prisma } from '../../config/prisma.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(['JOB','INTERNSHIP','HACKATHON','EVENT','SCHOLARSHIP','PROJECT']),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  salary: z.string().max(50).optional(),
  requirements: z.array(z.string()).optional(),
  deadline: z.string().datetime().optional(),
  eventDate: z.string().datetime().optional(),
  url: z.string().url().optional(),
  maxAttendees: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
})

export const opportunitiesRoutes: FastifyPluginAsync = async (fastify) => {
  // List
  fastify.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { type, search, page = '1', limit = '20' } = req.query as any
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (type) where.type = type
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          postedBy: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      }),
      prisma.opportunity.count({ where }),
    ])

    return sendSuccess(reply, { items, total, page: parseInt(page) })
  })

  // Create
  fastify.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const result = createSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid', 400)

    const data: any = {
      ...result.data,
      postedById: req.user.sub,
      requirements: result.data.requirements ?? [],
      tags: result.data.tags ?? [],
    }
    if (result.data.deadline) data.deadline = new Date(result.data.deadline)
    if (result.data.eventDate) data.eventDate = new Date(result.data.eventDate)

    const opp = await prisma.opportunity.create({
      data,
      include: { postedBy: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    })
    return sendSuccess(reply, opp, 201)
  })

  // Delete own
  fastify.delete('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const opp = await prisma.opportunity.findUnique({ where: { id } })
    if (!opp) return sendError(reply, 'Not found', 404)
    if (opp.postedById !== req.user.sub) return sendError(reply, 'Forbidden', 403)
    await prisma.opportunity.delete({ where: { id } })
    return sendSuccess(reply, { deleted: true })
  })
}
