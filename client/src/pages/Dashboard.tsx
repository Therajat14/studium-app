import { useAuth } from '@/hooks/useAuth.js'
import LogoutButton from '@/components/auth/LogoutButton.js'
import { Avatar } from '@/components/ui/avatar.js'
import { FeedPage } from '@/features/feed/FeedPage.js'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="bg-background min-h-screen">
      {/* Top nav */}
      <header className="border-border sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="font-bold tracking-tight">Studium</span>
          <div className="flex items-center gap-2">
            <Avatar src={user?.avatarUrl} fallback={user?.name ?? ''} size="sm" />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <FeedPage />
      </main>
    </div>
  )
}

export default Dashboard
