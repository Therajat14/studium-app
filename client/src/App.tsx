import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider.js'
import { AuthProvider } from '@/context/AuthContext.js'
import PrivateRoute from '@/routes/PrivateRoute.js'
import LoginPage from '@/pages/Login.js'
import Dashboard from '@/pages/Dashboard.js'
import Home from '@/pages/Home.js'
import UnderDevelopment from '@/pages/UnderDevelopment.js'
import { queryClient } from '@/lib/queryClient.js'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="studium-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Redirect /signup → /login (signup is handled inside LoginPage) */}
              <Route path="/signup" element={<Navigate to="/login" replace />} />

              {/* Catch-all for routes not yet implemented */}
              <Route path="*" element={<UnderDevelopment />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>

      {/* TanStack Query devtools — removed in production build */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
