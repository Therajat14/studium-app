import { Bell, Check, CheckCheck, MessageCircle, Heart, UserPlus, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button.js'
import { Skeleton } from '@/components/ui/skeleton.js'
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from '@/hooks/useNotifications.js'
import type { Notification, NotificationType } from '@/types/index.js'

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  COMMENT:          MessageCircle,
  REPLY:            Reply,
  FOLLOW:           UserPlus,
  POST_REACTION:    Heart,
  COMMENT_REACTION: Heart,
}

const TYPE_TEXT: Record<NotificationType, string> = {
  COMMENT:          'commented on your post',
  REPLY:            'replied to your comment',
  FOLLOW:           'started following you',
  POST_REACTION:    'liked your post',
  COMMENT_REACTION: 'liked your comment',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

const NotificationRow = ({ notification }: { notification: Notification }) => {
  const { mutate: markRead } = useMarkRead()
  const Icon = TYPE_ICON[notification.type]
  const isUnread = notification.readAt === null

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
        isUnread ? 'bg-primary/5' : ''
      } hover:bg-muted/50`}
    >
      <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="font-medium">{notification.actor.name}</span>{' '}
          <span className="text-muted-foreground">{TYPE_TEXT[notification.type]}</span>
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
      {isUnread && (
        <button
          onClick={() => markRead(notification.id)}
          className="text-muted-foreground hover:text-foreground mt-1 shrink-0 transition-colors"
          aria-label="Mark as read"
        >
          <Check className="size-4" />
        </button>
      )}
    </div>
  )
}

interface NotificationListProps {
  onClose: () => void
}

export const NotificationList = ({ onClose }: NotificationListProps) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()

  const notifications = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          disabled={isMarkingAll}
          onClick={() => markAllRead()}
        >
          <CheckCheck className="size-3.5" />
          Mark all read
        </Button>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-2">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Bell className="text-muted-foreground size-8 opacity-40" />
            <p className="text-muted-foreground text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
            {hasNextPage && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-border border-t px-4 py-2">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
