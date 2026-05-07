'use client'

import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store'
import { getMe } from '@/lib/api/auth'
import { CommandPalette } from '@/components/command-palette'
import { AuthModalProvider } from '@/components/auth-modal'

// ─── Stable QueryClient (singleton per client render) ────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // High staleTime (5 min) to ensure tab switching feels instant and doesn't trigger API calls
        staleTime: 5 * 60_000,
        // Keep unused data in cache for 30 min
        gcTime: 30 * 60_000,
        retry: (failureCount, error) => {
          const status = (error as { response?: { status: number } })?.response?.status
          // Never retry auth errors or not-found
          if (status === 401 || status === 403 || status === 404) return false
          return failureCount < 1
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        // Surface mutation errors rather than silently failing
        onError: () => {},
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

// ─── Auth bootstrap — verifies session on every mount ────────────────────────

function AuthBootstrap() {
  const { login, logout, isHydrated } = useAuthStore()
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (!isHydrated || bootstrapped.current) return
    bootstrapped.current = true

    const handleLogout = () => logout()
    window.addEventListener('auth:logout', handleLogout)

    // Verify the cookie-based session with the server
    getMe()
      .then((user) => login(user))
      .catch(() => logout())

    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [isHydrated, login, logout])

  return null
}

// ─── Root provider component ──────────────────────────────────────────────────

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <CommandPalette />
      <AuthModalProvider>
      {children}
      </AuthModalProvider>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e4e4e7',
            borderRadius: '14px',
            fontSize: '13px',
          },
        }}
      />
    </QueryClientProvider>
  )
}
