import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { Badge } from '@/components/ui/badge.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import { useFeed } from '@/hooks/useFeed.js'
import { PostCard } from './PostCard.js'
import { PostComposer } from './PostComposer.js'
import type { FeedSort, PostType } from '@/types/index.js'

const SORT_TABS: { value: FeedSort; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'following', label: 'Following' },
]

const TYPE_FILTERS: { value: PostType | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'DISCUSSION', label: 'Discussions' },
  { value: 'QUESTION', label: 'Questions' },
  { value: 'ANNOUNCEMENT', label: 'Announcements' },
  { value: 'RESOURCE', label: 'Resources' },
]

const PostCardSkeleton = () => (
  <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
    <div className="flex items-center gap-2">
      <Skeleton className="h-7 w-7 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <div className="flex gap-3 pt-1">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
)

export const FeedPage = () => {
  const [sort, setSort] = useState<FeedSort>('latest')
  const [typeFilter, setTypeFilter] = useState<PostType | undefined>(undefined)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useFeed(
    sort,
    typeFilter,
  )

  const posts = data?.pages.flatMap((page) => page.items) ?? []

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="flex flex-col gap-4">
      <PostComposer />

      {/* Sort tabs */}
      <Tabs value={sort} onValueChange={(v) => setSort(v as FeedSort)}>
        <TabsList>
          {SORT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setTypeFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              typeFilter === f.value
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="border-border rounded-xl border p-8 text-center">
          <p className="text-muted-foreground text-sm">Failed to load feed. Please try again.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="border-border rounded-xl border p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {sort === 'following'
              ? 'Follow some people to see their posts here.'
              : 'No posts yet. Be the first to share something!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-muted-foreground py-4 text-center text-xs">
          You've reached the end
        </p>
      )}
    </div>
  )
}
