import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '@/hooks/useNotifications.js'
import { NotificationList } from './NotificationList.js'

export const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: unread = 0 } = useUnreadCount()

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:text-foreground relative p-1.5 transition-colors"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="border-border bg-popover absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border shadow-lg">
          <NotificationList onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
