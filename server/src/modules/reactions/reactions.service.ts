import { prisma } from '../../config/prisma.js'
import type { ReactionType } from '@prisma/client'

export interface ReactionResult {
  reacted: boolean   // true = reaction added, false = reaction removed
  type: ReactionType
  counts: Record<ReactionType, number>
}

// ─── Toggle post reaction ──────────────────────────────────────────────────
// Checks if the reaction exists:
//   - exists → delete (toggle off)
//   - absent → create (toggle on)
// Returns the new reaction state + updated counts.

export const togglePostReaction = async (
  userId: string,
  postId: string,
  type:   ReactionType,
): Promise<ReactionResult> => {
  const existing = await prisma.postReaction.findUnique({
    where: { userId_postId_type: { userId, postId, type } },
  })

  if (existing) {
    await prisma.postReaction.delete({ where: { id: existing.id } })
  } else {
    // Verify post exists
    const post = await prisma.post.findUnique({ where: { id: postId, deletedAt: null } })
    if (!post) {
      const err = new Error('Post not found')
      ;(err as Error & { code: string }).code = 'POST_NOT_FOUND'
      throw err
    }
    await prisma.postReaction.create({ data: { userId, postId, type } })
  }

  const counts = await getPostReactionCounts(postId)
  return { reacted: !existing, type, counts }
}

// ─── Toggle comment reaction ───────────────────────────────────────────────

export const toggleCommentReaction = async (
  userId:    string,
  commentId: string,
  type:      ReactionType,
): Promise<ReactionResult> => {
  const existing = await prisma.commentReaction.findUnique({
    where: { userId_commentId_type: { userId, commentId, type } },
  })

  if (existing) {
    await prisma.commentReaction.delete({ where: { id: existing.id } })
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: commentId, deletedAt: null } })
    if (!comment) {
      const err = new Error('Comment not found')
      ;(err as Error & { code: string }).code = 'COMMENT_NOT_FOUND'
      throw err
    }
    await prisma.commentReaction.create({ data: { userId, commentId, type } })
  }

  const counts = await getCommentReactionCounts(commentId)
  return { reacted: !existing, type, counts }
}

// ─── Count helpers ─────────────────────────────────────────────────────────

const getPostReactionCounts = async (postId: string): Promise<Record<ReactionType, number>> => {
  const rows = await prisma.postReaction.groupBy({
    by: ['type'],
    where: { postId },
    _count: { type: true },
  })
  return {
    LIKE:     rows.find((r) => r.type === 'LIKE')?._count.type     ?? 0,
    UPVOTE:   rows.find((r) => r.type === 'UPVOTE')?._count.type   ?? 0,
    DOWNVOTE: rows.find((r) => r.type === 'DOWNVOTE')?._count.type ?? 0,
  }
}

const getCommentReactionCounts = async (commentId: string): Promise<Record<ReactionType, number>> => {
  const rows = await prisma.commentReaction.groupBy({
    by: ['type'],
    where: { commentId },
    _count: { type: true },
  })
  return {
    LIKE:     rows.find((r) => r.type === 'LIKE')?._count.type     ?? 0,
    UPVOTE:   rows.find((r) => r.type === 'UPVOTE')?._count.type   ?? 0,
    DOWNVOTE: rows.find((r) => r.type === 'DOWNVOTE')?._count.type ?? 0,
  }
}
