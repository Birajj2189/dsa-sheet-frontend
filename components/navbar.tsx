'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store'
import { Menu } from 'lucide-react'
import { useUIStore } from '@/store'

export function Navbar() {
  const { isAuthenticated } = useAuthStore()
  const { setSidebarOpen } = useUIStore()

  // In authenticated views the sidebar handles navigation — this bar is minimal
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-xl lg:hidden"
    >
      <div className="px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center transition-colors group-hover:bg-indigo-500/30">
                <span className="text-[10px] font-bold text-indigo-400">DS</span>
              </div>
              <span className="font-bold text-sm text-zinc-200 tracking-tight">DSA Sheet</span>
            </Link>
          </div>

          {/* Actions */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-zinc-400 hover:text-zinc-200 text-xs font-medium"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg h-8 px-4 border-0 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
