import { useState } from 'react'
import { Menu } from 'lucide-react'
import { BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar.js'
import { NotificationBell } from '@/features/notifications/NotificationBell.js'
import { ThemeToggle } from '@/components/ui/ThemeToggle.js'

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="rounded-md bg-primary p-1">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            Studium
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
