import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import { useFeed } from '@/hooks/useFeed.js'
import { useAuth } from '@/hooks/useAuth.js'
import { socket } from '@/lib/socket.js'
import { SocketEvent } from '@/lib/socketEvents.js'
import { PostCard } from './PostCard.js'
import { PostComposer } from './PostComposer.js'
import type { FeedSort, FeedResponse, Post, PostType } from '@/types/index.js'

type FeedScope = 'branch' | 'college' | 'everyone'

const SCOPE_TABS: { value: FeedScope; label: string }[] = [
  { value: 'branch',   label: 'My Branch' },
  { value: 'college',  label: 'My College' },
  { value: 'everyone', label: 'Everyone' },
]

const SORT_TABS: { value: FeedSort; label: string }[] = [
  { value: 'latest',    label: 'Latest' },
  { value: 'trending',  label: 'Trending' },
  { value: 'following', label: 'Following' },
]

const TYPE_FILTERS: { value: PostType | undefined; label: string }[] = [
  { value: undefined,      label: 'All' },
  { value: 'DISCUSSION',   label: 'Discussions' },
  { value: 'QUESTION',     label: 'Questions' },
  { value: 'ANNOUNCEMENT', label: 'Announcements' },
  { value: 'RESOURCE',     label: 'Resources' },
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
  const { user } = useAuth()
  const [scope, setScope]       = useState<FeedScope>('branch')
  const [sort, setSort]         = useState<FeedSort>('latest')
  const [typeFilter, setTypeFilter] = useState<PostType | undefined>(undefined)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Derive college/branch params based on scope
  const college = scope !== 'everyone' ? ((user as any)?.college ?? undefined) : undefined
  const branch  = scope === 'branch'   ? ((user as any)?.branch  ?? undefined) : undefined

  // For branch/college scope, force latest sort
  const effectiveSort: FeedSort = scope !== 'everyone' ? 'latest' : sort

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useFeed(
    effectiveSort,
    typeFilter,
    college,
    branch,
  )

  const posts = data?.pages.flatMap((page) => page.items) ?? []

  // ─── Realtime: new post ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (payload: { post: Post }) => {
      // Only patch the feed if we're on 'everyone' + 'latest' to avoid stale scope data
      if (scope !== 'everyone' || sort !== 'latest') return
      queryClient.setQueryData<{ pages: FeedResponse[]; pageParams: unknown[] }>(
        ['feed', 'latest', typeFilter, null, null],
        (old) => {
          if (!old) return old
          const firstPage = old.pages[0]
          if (!firstPage) return old
          if (firstPage.items.some((p) => p.id === payload.post.id)) return old
          return {
            ...old,
            pages: [
              { ...firstPage, items: [payload.post, ...firstPage.items] },
              ...old.pages.slice(1),
            ],
          }
        },
      )
    }
    socket.on(SocketEvent.FEED_NEW_POST, handler)
    return () => { socket.off(SocketEvent.FEED_NEW_POST, handler) }
  }, [scope, sort, typeFilter, queryClient])

  // ─── Realtime: reaction counts ───────────────────────────────────────────
  useEffect(() => {
    const handler = (payload: { postId: string; counts: Record<string, number> }) => {
      queryClient.setQueriesData<{ pages: FeedResponse[]; pageParams: unknown[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === payload.postId
                  ? { ...post, _count: { ...post._count, reactions: Object.values(payload.counts).reduce((a, b) => a + b, 0) } }
                  : post,
              ),
            })),
          }
        },
      )
    }
    socket.on(SocketEvent.POST_REACTION_UPDATE, handler)
    return () => { socket.off(SocketEvent.POST_REACTION_UPDATE, handler) }
  }, [queryClient])

  // ─── Infinite scroll ──────────────────────────────────────────────────────
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

  const emptyMessage =
    scope === 'branch'  ? 'No posts from your branch yet. Be the first!' :
    scope === 'college' ? 'No posts from your college yet. Be the first!' :
    sort   === 'following' ? 'Follow some people to see their posts here.' :
    'No posts yet. Be the first to share something!'

  return (
    <div className="flex flex-col gap-4">
      <PostComposer />

      {/* Scope tabs */}
      <Tabs value={scope} onValueChange={(v) => { setScope(v as FeedScope); setSort('latest') }}>
        <TabsList className="w-full">
          {SCOPE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Sub-sort tabs — only for 'everyone' scope */}
      {scope === 'everyone' && (
        <Tabs value={sort} onValueChange={(v) => setSort(v as FeedSort)}>
          <TabsList>
            {SORT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

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

      {/* Scope label when branch/college has no user data */}
      {scope !== 'everyone' && !college && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Add your college and branch in your profile to see personalized posts.
        </div>
      )}

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
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

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
