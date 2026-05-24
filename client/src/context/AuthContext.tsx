import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '../api/auth.js'
import { injectToken } from '../utils/axiosInstance.js'
import type { User } from '../types/index.js'

// ─── Types ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  loading: boolean // true while restoring session on page load
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    name: string
    email: string
    password: string
    rollNumber?: string
  }) => Promise<void>
  logout: () => Promise<void>
}

// ─── Context ───────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  // loading=true until we've attempted to restore the session.
  // This prevents PrivateRoute from flash-redirecting to /login
  // before we know whether a valid refresh token exists.
  const [loading, setLoading] = useState(true)

  // On mount: try to restore session from the httpOnly refresh token cookie.
  // If it succeeds, the user is silently re-authenticated.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken, user } = await authApi.refresh()
        injectToken(accessToken)
        setUser(user)
      } catch {
        // No valid session — user must log in. This is the normal unauthenticated state.
        injectToken(null)
      } finally {
        setLoading(false)
      }
    }

    void restoreSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authApi.login({ email, password })
    injectToken(accessToken)
    setUser(user)
  }, [])

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; rollNumber?: string }) => {
      const { accessToken, user } = await authApi.register(payload)
      injectToken(accessToken)
      setUser(user)
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      // Always clear local state even if the request fails
      injectToken(null)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
