import { useAuth } from '@/hooks/useAuth.js'
import LogoutButton from '@/components/auth/LogoutButton.js'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name} 👋</h1>
            <p className="text-muted-foreground mt-1 text-sm">{user?.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="border-border rounded-xl border p-6">
          <p className="text-muted-foreground text-center text-sm">
            Dashboard features are coming in Phase 4. The backend foundation is ready.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
