import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middlewares/auth.hooks.js'
import { prisma } from '../../config/prisma.js'
import { sendSuccess, sendError } from '../../lib/response.js'
import { z } from 'zod'

const questionSchema = z.object({
  title: z.string().min(10).max(300),
  content: z.string().min(20),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER','INTERMEDIATE','ADVANCED']).optional(),
  bounty: z.number().int().min(0).optional(),
})

const answerSchema = z.object({
  content: z.string().min(10),
})

const include = {
  author: { select: { id: true, name: true, avatarUrl: true, karma: true, branch: true, year: true } },
  _count: { select: { answers: true, votes: true } },
}

export const qnaRoutes: FastifyPluginAsync = async (fastify) => {
  // List questions
  fastify.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { filter = 'latest', search, page = '1', limit = '20' } = req.query as any
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
    if (filter === 'unanswered') where.answers = { none: {} }
    if (filter === 'bounty') where.bounty = { gt: 0 }

    const orderBy: any = filter === 'trending'
      ? { votes: { _count: 'desc' } }
      : { createdAt: 'desc' }

    const [items, total] = await Promise.all([
      prisma.qnaQuestion.findMany({ where, skip, take: parseInt(limit), orderBy, include }),
      prisma.qnaQuestion.count({ where }),
    ])

    return sendSuccess(reply, { items, total, page: parseInt(page) })
  })

  // Get single question with answers
  fastify.get('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await prisma.qnaQuestion.update({ where: { id }, data: { views: { increment: 1 } } })

    const question = await prisma.qnaQuestion.findUnique({
      where: { id },
      include: {
        ...include,
        votes: { where: { userId: req.user.sub }, select: { value: true } },
        answers: {
          orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
          include: {
            author: { select: { id: true, name: true, avatarUrl: true, karma: true } },
            _count: { select: { votes: true } },
            votes: { where: { userId: req.user.sub }, select: { value: true } },
          },
        },
      },
    })
    if (!question) return sendError(reply, 'Question not found', 404)
    return sendSuccess(reply, question)
  })

  // Create question
  fastify.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const result = questionSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid', 400)

    const { difficulty, bounty, ...rest } = result.data
    const question = await prisma.qnaQuestion.create({
      data: {
        ...rest,
        authorId: req.user.sub,
        tags: result.data.tags ?? [],
        ...(difficulty != null && { difficulty }),
        ...(bounty != null && { bounty }),
      },
      include,
    })
    return sendSuccess(reply, question, 201)
  })

  // Vote on question
  fastify.post('/:id/vote', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { value } = req.body as { value: 1 | -1 }
    if (value !== 1 && value !== -1) return sendError(reply, 'Value must be 1 or -1', 400)

    const existing = await prisma.qnaVote.findUnique({
      where: { questionId_userId: { questionId: id, userId: req.user.sub } },
    })
    if (existing) {
      if (existing.value === value) {
        await prisma.qnaVote.delete({ where: { id: existing.id } })
      } else {
        await prisma.qnaVote.update({ where: { id: existing.id }, data: { value } })
      }
    } else {
      await prisma.qnaVote.create({ data: { questionId: id, userId: req.user.sub, value } })
    }
    const sum = await prisma.qnaVote.aggregate({ where: { questionId: id }, _sum: { value: true } })
    return sendSuccess(reply, { score: sum._sum.value ?? 0 })
  })

  // Create answer
  fastify.post('/:id/answers', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const result = answerSchema.safeParse(req.body)
    if (!result.success) return sendError(reply, result.error.issues[0]?.message ?? 'Invalid', 400)

    const answer = await prisma.qnaAnswer.create({
      data: { questionId: id, content: result.data.content, authorId: req.user.sub },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, karma: true } },
        _count: { select: { votes: true } },
      },
    })
    return sendSuccess(reply, answer, 201)
  })

  // Accept answer
  fastify.patch('/answers/:answerId/accept', { preHandler: [authenticate] }, async (req, reply) => {
    const { answerId } = req.params as { answerId: string }
    const answer = await prisma.qnaAnswer.findUnique({
      where: { id: answerId },
      include: { question: { select: { authorId: true, id: true } } },
    })
    if (!answer) return sendError(reply, 'Answer not found', 404)
    if (answer.question.authorId !== req.user.sub) return sendError(reply, 'Only question author can accept', 403)

    await prisma.$transaction([
      prisma.qnaAnswer.updateMany({ where: { questionId: answer.questionId }, data: { isAccepted: false } }),
      prisma.qnaAnswer.update({ where: { id: answerId }, data: { isAccepted: true } }),
      prisma.qnaQuestion.update({ where: { id: answer.questionId }, data: { hasAccepted: true } }),
    ])
    return sendSuccess(reply, { accepted: true })
  })
}
