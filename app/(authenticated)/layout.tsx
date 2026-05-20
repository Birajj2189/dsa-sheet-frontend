'use client'

import { Sidebar } from '@/components/sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Loading from './loading'
import { getMe } from '@/lib/api/auth'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore, useUIStore } from '@/store'
import { Menu } from 'lucide-react'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { login, logout, isHydrated } = useAuthStore()
  const { setSidebarOpen } = useUIStore()

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

      <main className="flex-1 min-w-0 overflow-x-hidden relative flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-white/5 bg-[#09090b] sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-indigo-400">DS</span>
              </div>
              <span className="font-semibold text-sm text-zinc-200">DSA Sheet</span>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 relative">
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
        </div>
      </main>
    </div>
  )
}
