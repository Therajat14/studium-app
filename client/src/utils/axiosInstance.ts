import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios'

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:5000/api'

// Access token lives in memory only — never written to localStorage.
// This prevents XSS attacks from stealing tokens.
let _accessToken: string | null = null

export const injectToken = (token: string | null) => {
  _accessToken = token
}

export const getAccessToken = () => _accessToken

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send httpOnly refresh token cookie automatically
})

// Attach access token to every outgoing request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

// ─── Automatic token refresh on 401 ───────────────────────────────────────
// When the access token expires, transparently refresh it and retry the
// original request. A queue prevents multiple simultaneous refresh calls.

let isRefreshing = false
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }
let failedQueue: QueueEntry[] = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only intercept 401s on non-refresh, non-login endpoints
    const isAuthEndpoint =
      original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login')

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<{ success: true; data: { accessToken: string } }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        const newToken = data.data.accessToken
        injectToken(newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        injectToken(null)
        // Redirect to login — refresh token expired or was revoked
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
