'use client'

import { useState, createContext, useContext, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthModalState {
  open: boolean
  action?: string
  show: (action?: string) => void
  hide: () => void
}

const AuthModalContext = createContext<AuthModalState>({
  open: false,
  show: () => {},
  hide: () => {},
})

export function useAuthModal() {
  return useContext(AuthModalContext)
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen]       = useState(false)
  const [action, setAction]   = useState<string | undefined>()

  const show = useCallback((a?: string) => { setAction(a); setOpen(true)  }, [])
  const hide = useCallback(()           => { setOpen(false)                }, [])

  return (
    <AuthModalContext.Provider value={{ open, action, show, hide }}>
      {children}
      <AuthModalDialog />
    </AuthModalContext.Provider>
  )
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

function AuthModalDialog() {
  const { open, action, hide } = useAuthModal()
  const pathname = usePathname()
  const from = encodeURIComponent(pathname)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={hide}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
          >
            <div className="rounded-2xl border border-white/8 bg-zinc-900 shadow-2xl p-6">
              {/* Close */}
              <button
                onClick={hide}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon */}
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              </div>

              <h2 className="text-base font-semibold text-zinc-100 mb-1">
                Sign in to continue
              </h2>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                {action
                  ? `Create a free account to ${action}.`
                  : 'Create a free account to track your progress, add notes, and bookmark problems.'
                }
              </p>

              <div className="space-y-2.5">
                <Button
                  asChild
                  className="w-full h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium border-0 gap-2"
                  onClick={hide}
                >
                  <Link href={`/login?from=${from}`}>
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-10 rounded-xl border border-white/8 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 text-sm"
                  onClick={hide}
                >
                  <Link href={`/signup?from=${from}`}>
                    Create free account
                  </Link>
                </Button>
              </div>

              <p className="text-center text-[11px] text-zinc-700 mt-4">
                Free forever · No credit card required
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
