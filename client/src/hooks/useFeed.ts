import { useInfiniteQuery } from '@tanstack/react-query'
import { feedApi } from '../api/feed.js'
import type { FeedSort, PostType } from '../types/index.js'

export const useFeed = (sort: FeedSort = 'latest', type?: PostType) =>
  useInfiniteQuery({
    queryKey: ['feed', sort, type],
    queryFn: ({ pageParam }) =>
      feedApi.get({
        sort,
        cursor: pageParam ?? undefined,
        limit: 20,
        type,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    staleTime: 60_000, // 1 min — feed is relatively stable
  })
