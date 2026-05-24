import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider.js'
import { AuthProvider } from '@/context/AuthContext.js'
import PrivateRoute from '@/routes/PrivateRoute.js'
import { AppLayout } from '@/components/layout/AppLayout.js'
import LoginPage from '@/pages/Login.js'
import Dashboard from '@/pages/Dashboard.js'
import Home from '@/pages/Home.js'
import ProfilePage from '@/pages/ProfilePage.js'
import SearchPage from '@/pages/SearchPage.js'
import KnowledgePage from '@/pages/KnowledgePage.js'
import QnaPage from '@/pages/QnaPage.js'
import OpportunitiesPage from '@/pages/OpportunitiesPage.js'
import CampusPage from '@/pages/CampusPage.js'
import LostFoundPage from '@/pages/LostFoundPage.js'
import { PostDetail } from '@/features/posts/PostDetail.js'
import { ChatPage } from '@/features/chat/ChatPage.js'
import { queryClient } from '@/lib/queryClient.js'

const PrivatePage = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    <AppLayout>{children}</AppLayout>
  </PrivateRoute>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="studium-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />

              <Route path="/dashboard"     element={<PrivatePage><Dashboard /></PrivatePage>} />
              <Route path="/post/:id"      element={<PrivatePage><PostDetail /></PrivatePage>} />
              <Route path="/messages"      element={<PrivatePage><ChatPage /></PrivatePage>} />
              <Route path="/messages/:conversationId" element={<PrivatePage><ChatPage /></PrivatePage>} />
              <Route path="/profile"       element={<PrivatePage><ProfilePage /></PrivatePage>} />
              <Route path="/profile/:id"   element={<PrivatePage><ProfilePage /></PrivatePage>} />
              <Route path="/search"        element={<PrivatePage><SearchPage /></PrivatePage>} />
              <Route path="/knowledge"     element={<PrivatePage><KnowledgePage /></PrivatePage>} />
              <Route path="/qna"           element={<PrivatePage><QnaPage /></PrivatePage>} />
              <Route path="/opportunities" element={<PrivatePage><OpportunitiesPage /></PrivatePage>} />
              <Route path="/campus"        element={<PrivatePage><CampusPage /></PrivatePage>} />
              <Route path="/lostfound"    element={<PrivatePage><LostFoundPage /></PrivatePage>} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
