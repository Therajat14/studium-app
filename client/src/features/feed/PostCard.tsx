import { Link } from 'react-router'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent } from '@/components/ui/card.js'
import { useTogglePostReaction } from '@/hooks/useReactions.js'
import { useDeletePost } from '@/hooks/usePosts.js'
import { useAuth } from '@/hooks/useAuth.js'
import type { Post, PostType } from '@/types/index.js'

const TYPE_LABELS: Record<PostType, string> = {
  DISCUSSION: 'Discussion',
  QUESTION: 'Question',
  ANNOUNCEMENT: 'Announcement',
  RESOURCE: 'Resource',
}

const TYPE_VARIANTS: Record<PostType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DISCUSSION: 'secondary',
  QUESTION: 'default',
  ANNOUNCEMENT: 'destructive',
  RESOURCE: 'outline',
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
  const { mutate: toggleReaction } = useTogglePostReaction(post.id)
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()

  const isOwner = user?.id === post.author.id
  const excerpt = post.content.length > 280 ? post.content.slice(0, 280) + '…' : post.content

  return (
    <Card className="gap-3 py-4 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3">
        {/* Author row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar
              src={post.author.avatarUrl}
              fallback={post.author.name}
              size="sm"
            />
            <div className="min-w-0">
              <span className="text-sm font-medium leading-none">{post.author.name}</span>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                <span>{post.author.college ?? post.author.role}</span>
                <span>·</span>
                <span>{relativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant={TYPE_VARIANTS[post.type]}>{TYPE_LABELS[post.type]}</Badge>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isDeleting}
                onClick={() => deletePost(post.id)}
                aria-label="Delete post"
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <Link to={`/post/${post.id}`} className="group block">
          {post.title && (
            <h3 className="group-hover:text-primary mb-1 font-semibold transition-colors">
              {post.title}
            </h3>
          )}
          <p className="text-muted-foreground text-sm leading-relaxed">{excerpt}</p>
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() => toggleReaction('LIKE')}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <Heart className="size-4" />
            <span>{post._count.reactions}</span>
          </button>
          <Link
            to={`/post/${post.id}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <MessageCircle className="size-4" />
            <span>{post._count.comments}</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
