import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'

/** Create a fresh QueryClient with retries disabled (for deterministic tests). */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries:   { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

/** Wrap UI with all the providers the app requires. */
export const renderWithProviders = (
  ui: ReactElement,
  options?: { route?: string; renderOptions?: Omit<RenderOptions, 'wrapper'> },
) => {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[options?.route ?? '/']}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...options?.renderOptions }),
    queryClient,
  }
}

// Re-export everything from RTL for convenience
export * from '@testing-library/react'
export { renderWithProviders as render }
