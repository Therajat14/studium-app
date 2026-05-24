import { useNavigate } from 'react-router'
import { MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useConversations } from '@/hooks/useConversations.js'
import type { Conversation } from '@/types/index.js'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

const ConversationItem = ({
  conversation,
  active,
  currentUserId,
}: {
  conversation: Conversation
  active:        boolean
  currentUserId: string
}) => {
  const navigate = useNavigate()
  const other = conversation.participants.find((p) => p.userId !== currentUserId)
  const name  = conversation.isGroup
    ? (conversation.name ?? 'Group chat')
    : (other?.user.name ?? 'Unknown')
  const avatar = conversation.isGroup ? null : (other?.user.avatarUrl ?? null)
  const lastMsg = conversation.messages[0]

  return (
    <button
      onClick={() => navigate(`/messages/${conversation.id}`)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
        active ? 'bg-accent' : 'hover:bg-muted'
      }`}
    >
      <Avatar src={avatar} fallback={name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium">{name}</p>
          {lastMsg && (
            <span className="text-muted-foreground ml-2 shrink-0 text-xs">
              {relativeTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {lastMsg ? (lastMsg.deletedAt ? 'Message deleted' : lastMsg.content) : 'No messages yet'}
        </p>
      </div>
    </button>
  )
}

interface Props {
  activeId?: string
}

export const ConversationList = ({ activeId }: Props) => {
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversations()

  if (!user) return null

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex h-14 items-center border-b px-4 font-semibold">
        Messages
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageCircle className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === activeId}
              currentUserId={user.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
