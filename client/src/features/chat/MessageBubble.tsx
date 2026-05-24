import { Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar.js'
import { Button } from '@/components/ui/button.js'
import type { Message } from '@/types/index.js'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString()
}

interface Props {
  message:    Message
  isOwn:      boolean
  onDelete?:  (id: string) => void
  isDeleting?: boolean
}

export const MessageBubble = ({ message, isOwn, onDelete, isDeleting }: Props) => {
  if (message.deletedAt) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <span className="text-muted-foreground text-xs italic">Message deleted</span>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar src={message.sender.avatarUrl} fallback={message.sender.name} size="sm" />
      )}

      <div className={`group relative max-w-[75%]`}>
        {!isOwn && (
          <p className="text-muted-foreground mb-0.5 text-xs">{message.sender.name}</p>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={`mt-0.5 text-xs text-muted-foreground ${isOwn ? 'text-right' : 'text-left'}`}>
          {relativeTime(message.createdAt)}
        </p>

        {isOwn && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -left-8 hidden h-6 w-6 group-hover:flex"
            disabled={isDeleting}
            onClick={() => onDelete(message.id)}
            aria-label="Delete message"
          >
            <Trash2 className="text-destructive size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
