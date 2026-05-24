import { getLatestFeed, getFollowingFeed, getTrendingFeed } from './feed.repository.js'
import type { FeedQuery } from './feed.schemas.js'
import type { PostType } from '@prisma/client'

export interface FeedResult {
  items: unknown[]
  nextCursor: string | null
  hasMore: boolean
  sort: string
}

export const getFeed = async (
  userId: string | null,
  query: FeedQuery,
): Promise<FeedResult> => {
  // Strip undefined from optional fields so exactOptionalPropertyTypes is satisfied
  const type   = query.type as PostType | undefined
  const cursor = query.cursor

  if (query.sort === 'following') {
    if (!userId) {
      // Unauthenticated — fall back to latest
      const result = await getLatestFeed({
        limit: query.limit,
        ...(cursor !== undefined && { cursor }),
        ...(type   !== undefined && { type }),
      })
      return { ...result, hasMore: result.nextCursor !== null, sort: 'latest' }
    }
    const result = await getFollowingFeed({
      userId,
      limit: query.limit,
      ...(cursor !== undefined && { cursor }),
      ...(type   !== undefined && { type }),
    })
    return { ...result, hasMore: result.nextCursor !== null, sort: 'following' }
  }

  if (query.sort === 'trending') {
    const page = cursor?.startsWith('page:')
      ? parseInt(cursor.slice(5), 10)
      : query.page
    const result = await getTrendingFeed({
      page,
      limit: query.limit,
      ...(type !== undefined && { type }),
    })
    return { ...result, hasMore: result.nextCursor !== null, sort: 'trending' }
  }

  // Default: latest
  const result = await getLatestFeed({
    limit: query.limit,
    ...(cursor !== undefined && { cursor }),
    ...(type   !== undefined && { type }),
  })
  return { ...result, hasMore: result.nextCursor !== null, sort: 'latest' }
}
