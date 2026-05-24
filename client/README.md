# Studium — Client

React 19 + TypeScript + Vite frontend for the Studium student platform.

## Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| TypeScript 5 | Strict typing |
| Vite 7 | Build tool + dev server |
| TailwindCSS v4 | Utility-first styles |
| TanStack Query v5 | Server state, caching, infinite scroll |
| React Hook Form + Zod | Forms and validation |
| shadcn/ui (Radix) | Accessible UI primitives |
| Axios | HTTP client with token refresh interceptor |
| Socket.IO client | Real-time events |
| Vitest + RTL + MSW | Unit and component tests |

## Dev

```bash
npm run dev          # Start Vite dev server → http://localhost:5173
npm run build        # Production build (tsc -b && vite build)
npm test             # vitest run (29 tests)
npm run test:watch   # vitest watch mode
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
```

## Structure

```
src/
├── api/          # Typed axios wrappers per feature
├── components/   # ui/ (shadcn) + shared app components
├── context/      # AuthContext
├── features/     # feed/, posts/, chat/, notifications/
├── hooks/        # useAuth, useFeed, usePosts, useReactions, useSocket…
├── pages/        # Route-level page components
├── routes/       # PrivateRoute guard
├── test/         # MSW handlers, RTL helpers, vitest setup
├── types/        # Shared TypeScript interfaces
└── utils/        # axiosInstance + interceptors
```

## Environment

```bash
VITE_API_URL=http://localhost:5000/api    # API base URL
VITE_SOCKET_URL=http://localhost:5000    # Socket.IO URL
```

Both variables default to localhost if not set.

## Tests

```bash
npm test                 # Run all tests once
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (threshold: 40% lines/functions)
```

Tests use:
- **Vitest** with `jsdom` environment and `globals: true`
- **React Testing Library** + `@testing-library/jest-dom`
- **MSW v2** for API mocking (handlers in `src/test/mocks/handlers.ts`)
- **renderWithProviders** in `src/test/utils.tsx` — wraps components with `QueryClientProvider` + `MemoryRouter`

See [TESTING.md](../TESTING.md) for the full test guide.
