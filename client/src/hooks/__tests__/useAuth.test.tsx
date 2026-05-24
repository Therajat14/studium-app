import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server.js'
import { TEST_USER } from '../../test/mocks/handlers.js'
import { useAuth } from '../useAuth.js'
import { AuthProvider } from '../../context/AuthContext.js'
import { MemoryRouter } from 'react-router'

// ── Helpers ───────────────────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  it('starts with loading=true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    // On first render, loading is true while session is being restored
    expect(result.current.loading).toBe(true)
  })

  it('resolves to a user when refresh token succeeds', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toMatchObject({ email: TEST_USER.email })
  })

  it('resolves to null user when refresh token fails', async () => {
    server.use(
      http.post('http://localhost:5000/api/auth/refresh', () =>
        HttpResponse.json({ success: false, error: { message: 'No refresh token' } }, { status: 401 }),
      ),
    )

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('provides a login function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    expect(typeof result.current.login).toBe('function')
  })

  it('provides a logout function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    expect(typeof result.current.logout).toBe('function')
  })

  it('provides a register function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    expect(typeof result.current.register).toBe('function')
  })
})
