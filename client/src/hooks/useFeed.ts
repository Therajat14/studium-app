import { useInfiniteQuery } from '@tanstack/react-query'
import { feedApi } from '../api/feed.js'
import type { FeedSort, PostType } from '../types/index.js'

export const useFeed = (
  sort: FeedSort = 'latest',
  type?: PostType,
  college?: string,
  branch?: string,
) =>
  useInfiniteQuery({
    queryKey: ['feed', sort, type, college ?? null, branch ?? null],
    queryFn: ({ pageParam }) =>
      feedApi.get({
        sort,
        cursor: pageParam ?? undefined,
        limit: 20,
        type,
        ...(college !== undefined && { college }),
        ...(branch  !== undefined && { branch }),
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    staleTime: 60_000,
  })
