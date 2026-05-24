import { Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth.js'
import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

// Waits for auth session restore before making redirect decisions.
// Without the loading check, this would flash-redirect to /login on every
// page refresh while the refresh token round-trip is in flight.
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default PrivateRoute
