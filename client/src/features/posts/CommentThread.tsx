import { useState } from 'react'
import { Heart, Reply, ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar.js'
import { Button } from '@/components/ui/button.js'
import { Textarea } from '@/components/ui/textarea.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import { useComments, useCreateComment } from '@/hooks/useComments.js'
import { useToggleCommentReaction } from '@/hooks/useReactions.js'
import { useAuth } from '@/hooks/useAuth.js'
import type { Comment } from '@/types/index.js'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ─── Reply form ───────────────────────────────────────────────────────────────

interface ReplyFormProps {
  postId: string
  parentId: string
  onDone: () => void
}

const ReplyForm = ({ postId, parentId, onDone }: ReplyFormProps) => {
  const [content, setContent] = useState('')
  const { mutate: createComment, isPending } = useCreateComment(postId)

  const submit = () => {
    if (!content.trim()) return
    createComment({ content: content.trim(), parentId }, { onSuccess: onDone })
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <Textarea
        placeholder="Write a reply…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[70px] resize-none text-sm"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={isPending || !content.trim()}>
          {isPending ? 'Posting…' : 'Reply'}
        </Button>
      </div>
    </div>
  )
}

// ─── Single comment row ───────────────────────────────────────────────────────

interface CommentRowProps {
  comment: Comment
  postId: string
  isReply?: boolean
}

const CommentRow = ({ comment, postId, isReply = false }: CommentRowProps) => {
  const { user } = useAuth()
  const [replyOpen, setReplyOpen] = useState(false)
  const [repliesOpen, setRepliesOpen] = useState(false)
  const { mutate: toggleReaction } = useToggleCommentReaction(comment.id, postId)

  const replies = comment.replies ?? []
  const hasReplies = replies.length > 0

  return (
    <div className={isReply ? 'pl-8' : ''}>
      <div className="flex gap-2.5">
        <Avatar src={comment.author.avatarUrl} fallback={comment.author.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="bg-muted rounded-xl px-3 py-2">
            <div className="mb-0.5 flex items-baseline gap-1.5">
              <span className="text-sm font-medium">{comment.author.name}</span>
              <span className="text-muted-foreground text-xs">{relativeTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </div>

          {/* Actions row */}
          <div className="mt-1 flex items-center gap-3 px-1">
            <button
              onClick={() => toggleReaction('LIKE')}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
            >
              <Heart className="size-3.5" />
              {comment._count.reactions > 0 && <span>{comment._count.reactions}</span>}
            </button>
            {!isReply && user && (
              <button
                onClick={() => setReplyOpen((v) => !v)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                <Reply className="size-3.5" />
                <span>Reply</span>
              </button>
            )}
            {!isReply && hasReplies && (
              <button
                onClick={() => setRepliesOpen((v) => !v)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                {repliesOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                <span>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
          </div>

          {replyOpen && (
            <ReplyForm postId={postId} parentId={comment.id} onDone={() => setReplyOpen(false)} />
          )}
        </div>
      </div>

      {/* Nested replies */}
      {!isReply && repliesOpen && replies.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} postId={postId} isReply />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Top-level comment input ──────────────────────────────────────────────────

interface TopCommentInputProps {
  postId: string
}

const TopCommentInput = ({ postId }: TopCommentInputProps) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const { mutate: createComment, isPending } = useCreateComment(postId)

  if (!user) return null

  const submit = () => {
    if (!content.trim()) return
    createComment({ content: content.trim() }, { onSuccess: () => setContent('') })
  }

  return (
    <div className="flex gap-2.5">
      <Avatar src={user.avatarUrl} fallback={user.name} size="sm" />
      <div className="flex-1">
        <Textarea
          placeholder="Write a comment…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[70px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={submit} disabled={isPending || !content.trim()}>
            {isPending ? 'Posting…' : 'Comment'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Thread ───────────────────────────────────────────────────────────────────

interface CommentThreadProps {
  postId: string
}

export const CommentThread = ({ postId }: CommentThreadProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useComments(postId)

  const comments = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Comments</h3>

      <TopCommentInput postId={postId} />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="self-center"
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more comments'}
        </Button>
      )}
    </div>
  )
}
