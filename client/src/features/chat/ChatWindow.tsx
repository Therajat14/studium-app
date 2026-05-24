import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useMessages, useSendMessage, useDeleteMessage, useChatSocket, useMarkRead } from '@/hooks/useMessages.js'
import { MessageBubble } from './MessageBubble.js'
import type { Conversation } from '@/types/index.js'

interface Props {
  conversation: Conversation
}

export const ChatWindow = ({ conversation }: Props) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessages(conversation.id)
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversation.id)
  const { mutate: deleteMessage, isPending: isDeleting } = useDeleteMessage(conversation.id)
  const { mutate: markRead } = useMarkRead()

  useChatSocket(conversation.id)

  // Mark as read when window opens or receives new messages
  useEffect(() => {
    markRead(conversation.id)
  }, [conversation.id, data?.pages[0]?.items[0]?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.pages[0]?.items.length])

  // Messages come newest-first from API; reverse pages + items for display
  const messages = [...(data?.pages.flatMap((p) => p.items) ?? [])].reverse()

  const otherParticipants = conversation.participants.filter((p) => p.userId !== user?.id)
  const title = conversation.isGroup
    ? (conversation.name ?? 'Group chat')
    : (otherParticipants[0]?.user.name ?? 'Chat')

  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed || isSending) return
    sendMessage(trimmed, { onSuccess: () => setContent('') })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex h-14 items-center border-b px-4 font-medium">
        {title}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {hasNextPage && (
          <div className="mb-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load earlier messages'}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-3/4" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender.id === user?.id}
              onDelete={(id) => deleteMessage(id)}
              isDeleting={isDeleting}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-border flex items-end gap-2 border-t p-3">
        <textarea
          className="bg-muted flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          placeholder="Type a message…"
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          aria-label="Send"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
