import { useState } from 'react'
import { Link } from 'react-router'
import { TrendingUp, TrendingDown, MessageCircle, Bookmark, Share2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTogglePostReaction } from '@/hooks/useReactions.js'
import { useDeletePost } from '@/hooks/usePosts.js'
import { useAuth } from '@/hooks/useAuth.js'
import { postsApi } from '@/api/posts.js'
import { CommentThread } from '@/features/posts/CommentThread.js'
import type { Post, PostType } from '@/types/index.js'

const TYPE_COLORS: Record<PostType, string> = {
  DISCUSSION:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  QUESTION:     'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  ANNOUNCEMENT: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  RESOURCE:     'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
}

const TYPE_LABELS: Record<PostType, string> = {
  DISCUSSION:   'Discussion',
  QUESTION:     'Question',
  ANNOUNCEMENT: 'Announcement',
  RESOURCE:     'Resource',
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

interface PostCardProps {
  post: Post
}

export const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { mutate: toggleReaction } = useTogglePostReaction(post.id)
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()

  const [showComments, setShowComments] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const bookmarkMutation = useMutation({
    mutationFn: () => postsApi.toggleBookmark(post.id),
    onSuccess: (data) => setBookmarked(data.bookmarked),
  })

  const isOwner = user?.id === post.author.id
  const excerpt = post.content.length > 300 ? post.content.slice(0, 300) + '…' : post.content

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:border-border/80 transition-colors">
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{post.author.name[0]}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {post.author.college ?? post.author.role} · {relativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[post.type]}`}>
              {TYPE_LABELS[post.type]}
            </span>
            {isOwner && (
              <button
                disabled={isDeleting}
                onClick={() => deletePost(post.id)}
                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                aria-label="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <Link to={`/post/${post.id}`} className="block group mb-3">
          {post.title && (
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              {post.title}
            </h3>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map(({ tag }) => (
              <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Media thumbnails */}
        {post.media.length > 0 && post.media[0].resourceType === 'IMAGE' && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={post.media[0].url} alt="" className="w-full max-h-64 object-cover" />
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <button
              onClick={() => toggleReaction('UPVOTE')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{post._count.reactions}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => toggleReaction('DOWNVOTE')}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <TrendingDown className="h-4 w-4" />
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post._count.comments}</span>
              {showComments ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Bookmark */}
            <button
              onClick={() => bookmarkMutation.mutate()}
              className={`p-1.5 rounded-lg transition-colors ${
                bookmarked
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              aria-label="Bookmark"
            >
              <Bookmark className="h-4 w-4" />
            </button>

            {/* Share */}
            <button
              onClick={() => void navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <Link
              to={`/post/${post.id}`}
              className="text-xs text-primary hover:underline px-2"
            >
              View →
            </Link>
          </div>
        </div>
      </div>

      {/* Inline comment thread */}
      {showComments && (
        <div className="border-t bg-muted/20 p-4">
          <CommentThread postId={post.id} />
        </div>
      )}
    </div>
  )
}
