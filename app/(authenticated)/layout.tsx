'use client'

import { Sidebar } from '@/components/sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Loading from './loading'
import { getMe } from '@/lib/api/auth'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/store'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { login, logout, isHydrated } = useAuthStore()

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: isHydrated,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (user) login(user)
  }, [login, user])

  useEffect(() => {
    if (!isHydrated || isLoading || !isError) return

    logout()
    router.replace(`/login?from=${encodeURIComponent(pathname)}`)
  }, [isError, isHydrated, isLoading, logout, pathname, router])

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Loading />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-x-hidden relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full"
          >
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
