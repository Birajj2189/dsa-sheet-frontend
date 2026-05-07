import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Token refresh queue ──────────────────────────────────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(null)))
  failedQueue = []
}

// ─── Response interceptor — auto-refresh on 401 ───────────────────────────────

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Don't retry refresh calls or already-retried calls
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(original))
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        await apiClient.post('/auth/refresh')
        processQueue(null)
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ─── Error message extractor ─────────────────────────────────────────────────

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: { message: string }[] }
    if (data?.message) return data.message
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (error.message === 'Network Error') return 'Cannot connect to server. Please check if the backend is running.'
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  }
  return fallback
}
