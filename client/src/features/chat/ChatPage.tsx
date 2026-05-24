import { useParams } from 'react-router'
import { MessageCircle } from 'lucide-react'
import { useConversations } from '@/hooks/useConversations.js'
import { ConversationList } from './ConversationList.js'
import { ChatWindow } from './ChatWindow.js'

export const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { data: conversations } = useConversations()

  const activeConversation = conversations?.find((c) => c.id === conversationId)

  return (
    <div className="border-border flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border">
      {/* Sidebar */}
      <div className="border-border w-72 shrink-0 border-r">
        <ConversationList activeId={conversationId} />
      </div>

      {/* Main panel */}
      <div className="flex-1">
        {activeConversation ? (
          <ChatWindow conversation={activeConversation} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <MessageCircle className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
