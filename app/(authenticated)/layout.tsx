'use client'

import { Sidebar } from '@/components/sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

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
