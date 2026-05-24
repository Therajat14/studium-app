import { prisma } from '../../config/prisma.js'

// ─── Selects ───────────────────────────────────────────────────────────────

export const participantSelect = {
  id:       true,
  name:     true,
  avatarUrl: true,
  role:     true,
} as const

export const messageSelect = {
  id:        true,
  content:   true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  sender: { select: participantSelect },
} as const

// ─── Conversation queries ──────────────────────────────────────────────────

/** Find a DM between exactly two users (unordered). */
export const findDirectConversation = async (
  userA: string,
  userB: string,
) => {
  return prisma.conversation.findFirst({
    where: {
      isGroup: false,
      participants: {
        every: { userId: { in: [userA, userB] } },
      },
      AND: [
        { participants: { some: { userId: userA } } },
        { participants: { some: { userId: userB } } },
      ],
    },
    include: {
      participants: { include: { user: { select: participantSelect } } },
    },
  })
}

/** Create a DM between two users. */
export const createDirectConversation = async (
  userA: string,
  userB: string,
) => {
  return prisma.conversation.create({
    data: {
      isGroup:      false,
      participants: {
        create: [{ userId: userA }, { userId: userB }],
      },
    },
    include: {
      participants: { include: { user: { select: participantSelect } } },
    },
  })
}

/** List all conversations a user participates in, most recently active first. */
export const findUserConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where:   { participants: { some: { userId } } },
    orderBy: { updatedAt: 'desc' },
    include: {
      participants: { include: { user: { select: participantSelect } } },
      messages: {
        where:   { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take:    1,
        select:  messageSelect,
      },
    },
  })
}

/** Check participant membership. */
export const isParticipant = async (
  conversationId: string,
  userId:         string,
): Promise<boolean> => {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  })
  return row !== null
}

// ─── Message queries ───────────────────────────────────────────────────────

/** Cursor-paginated messages — newest first. */
export const findMessages = async (
  conversationId: string,
  limit:          number,
  cursor?:        string,
) => {
  const items = await prisma.message.findMany({
    where:   { conversationId, deletedAt: null },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take:    limit + 1,
    ...(cursor !== undefined && {
      cursor: { id: cursor },
      skip:   1,
    }),
    select: messageSelect,
  })
  const hasMore = items.length > limit
  if (hasMore) items.pop()
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined
  return { items, nextCursor }
}

export const createMessage = async (
  conversationId: string,
  senderId:       string,
  content:        string,
) => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data:   { conversationId, senderId, content },
      select: messageSelect,
    }),
    // bump conversation.updatedAt for sort order
    prisma.conversation.update({
      where: { id: conversationId },
      data:  { updatedAt: new Date() },
    }),
  ])
  return message
}

export const softDeleteMessage = async (messageId: string) => {
  return prisma.message.update({
    where:  { id: messageId },
    data:   { deletedAt: new Date() },
    select: { id: true, conversationId: true, senderId: true },
  })
}

export const findMessageById = async (messageId: string) => {
  return prisma.message.findUnique({
    where:  { id: messageId },
    select: { id: true, conversationId: true, senderId: true, deletedAt: true },
  })
}

/** Update lastReadAt for a participant. */
export const markConversationRead = async (
  conversationId: string,
  userId:         string,
) => {
  return prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data:  { lastReadAt: new Date() },
  })
}
