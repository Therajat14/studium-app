import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { ArrowLeft, Heart, MessageCircle, Trash2, FileImage, FileVideo, FileText } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/avatar.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import { usePost, useDeletePost } from '@/hooks/usePosts.js'
import { useTogglePostReaction } from '@/hooks/useReactions.js'
import { useAuth } from '@/hooks/useAuth.js'
import { socket } from '@/lib/socket.js'
import { SocketEvent } from '@/lib/socketEvents.js'
import { CommentThread } from './CommentThread.js'
import type { PostType, MediaType } from '@/types/index.js'

const TYPE_LABELS: Record<PostType, string> = {
  DISCUSSION: 'Discussion',
  QUESTION: 'Question',
  ANNOUNCEMENT: 'Announcement',
  RESOURCE: 'Resource',
}

const MEDIA_ICONS: Record<MediaType, React.ElementType> = {
  IMAGE: FileImage,
  VIDEO: FileVideo,
  PDF: FileText,
  DOCUMENT: FileText,
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

const PostDetailSkeleton = () => (
  <div className="flex flex-col gap-5">
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-7 w-3/4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
)

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading, isError } = usePost(id ?? '')
  const { mutate: toggleReaction } = useTogglePostReaction(id ?? '')
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()

  if (!id) return null

  const isOwner = user?.id === post?.author.id

  // Join/leave the post room so realtime comment + reaction events are received
  useEffect(() => {
    socket.emit(SocketEvent.ROOM_JOIN_POST, { postId: id })
    return () => { socket.emit(SocketEvent.ROOM_LEAVE_POST, { postId: id }) }
  }, [id])

  // When someone else comments, bump the comment count on the post card in feed
  const queryClient = useQueryClient()
  useEffect(() => {
    const handler = (payload: { postId: string }) => {
      if (payload.postId !== id) return
      queryClient.setQueryData<{ id: string; _count: { reactions: number; comments: number } }>(
        ['post', id],
        (old) => old ? { ...old, _count: { ...old._count, comments: old._count.comments + 1 } } : old,
      )
    }
    socket.on(SocketEvent.POST_NEW_COMMENT, handler)
    return () => { socket.off(SocketEvent.POST_NEW_COMMENT, handler) }
  }, [id, queryClient])

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {isLoading ? (
          <PostDetailSkeleton />
        ) : isError || !post ? (
          <div className="border-border rounded-xl border p-8 text-center">
            <p className="text-muted-foreground text-sm">Post not found.</p>
            <Link to="/dashboard" className="text-primary mt-2 block text-sm underline">
              Go back to feed
            </Link>
          </div>
        ) : (
          <>
            {/* Post content */}
            <article className="border-border mb-6 rounded-xl border p-6">
              {/* Author + meta */}
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar src={post.author.avatarUrl} fallback={post.author.name} size="md" />
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <span>{post.author.college ?? post.author.role}</span>
                      <span>·</span>
                      <span>{relativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary">{TYPE_LABELS[post.type]}</Badge>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isDeleting}
                      onClick={() =>
                        deletePost(post.id, { onSuccess: () => navigate('/dashboard') })
                      }
                      aria-label="Delete post"
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Title */}
              {post.title && <h1 className="mb-3 text-xl font-bold">{post.title}</h1>}

              {/* Body */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Media attachments */}
              {post.media.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {post.media.map((m) => {
                    const Icon = MEDIA_ICONS[m.resourceType]
                    return (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="border-border hover:bg-muted flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors"
                      >
                        <Icon className="text-muted-foreground size-4 shrink-0" />
                        <span className="flex-1 truncate">{m.originalName}</span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {formatBytes(m.bytes)}
                        </span>
                      </a>
                    )
                  })}
                </div>
              )}

              {/* Reactions row */}
              <div className="border-border mt-4 flex items-center gap-4 border-t pt-4">
                <button
                  onClick={() => toggleReaction('LIKE')}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
                >
                  <Heart className="size-4" />
                  <span>{post._count.reactions} likes</span>
                </button>
                <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <MessageCircle className="size-4" />
                  <span>{post._count.comments} comments</span>
                </span>
              </div>
            </article>

            {/* Comments */}
            <CommentThread postId={post.id} />
          </>
        )}
      </div>
    </div>
  )
}
