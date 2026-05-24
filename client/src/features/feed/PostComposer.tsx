import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card.js'
import { Button } from '@/components/ui/button.js'
import { Textarea } from '@/components/ui/textarea.js'
import { Input } from '@/components/ui/input.js'
import { Badge } from '@/components/ui/badge.js'
import { Avatar } from '@/components/ui/avatar.js'
import { useCreatePost } from '@/hooks/usePosts.js'
import { useAuth } from '@/hooks/useAuth.js'
import type { PostType } from '@/types/index.js'

const POST_TYPES: PostType[] = ['DISCUSSION', 'QUESTION', 'ANNOUNCEMENT', 'RESOURCE']
const TYPE_LABELS: Record<PostType, string> = {
  DISCUSSION: 'Discussion',
  QUESTION: 'Question',
  ANNOUNCEMENT: 'Announcement',
  RESOURCE: 'Resource',
}

export const PostComposer = () => {
  const { user } = useAuth()
  const { mutate: createPost, isPending } = useCreatePost()

  const [expanded, setExpanded] = useState(false)
  const [type, setType] = useState<PostType>('DISCUSSION')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const tagInputRef = useRef<HTMLInputElement>(null)

  const addTag = (value: string) => {
    const slug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (slug && !tags.includes(slug) && tags.length < 5) {
      setTags((prev) => [...prev, slug])
    }
    setTagInput('')
  }

  const reset = () => {
    setExpanded(false)
    setType('DISCUSSION')
    setTitle('')
    setContent('')
    setTagInput('')
    setTags([])
  }

  const submit = () => {
    if (!content.trim()) return
    createPost(
      {
        content: content.trim(),
        ...(title.trim() && { title: title.trim() }),
        type,
        ...(tags.length > 0 && { tags }),
      },
      { onSuccess: reset },
    )
  }

  if (!expanded) {
    return (
      <Card className="py-3">
        <CardContent>
          <button
            onClick={() => setExpanded(true)}
            className="bg-muted text-muted-foreground hover:bg-muted/80 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors"
          >
            <Avatar src={user?.avatarUrl} fallback={user?.name ?? ''} size="sm" />
            <span>Share something with your network…</span>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3">
        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5">
          {POST_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                type === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Title (optional) */}
        <Input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm"
        />

        {/* Content */}
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none text-sm"
          autoFocus
        />

        {/* Tags */}
        <div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                #{tag}
                <button
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          {tags.length < 5 && (
            <Input
              ref={tagInputRef}
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
              className="mt-2 text-sm"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={reset} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={isPending || !content.trim()}>
            {isPending ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
