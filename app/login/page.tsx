'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store'
import { login as loginApi } from '@/lib/api/auth'
import { getErrorMessage } from '@/lib/api/client'

function LoginForm() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [isLoading, setIsLoading]     = useState(false)

  const router      = useRouter()
  const searchParams = useSearchParams()
  const { login }   = useAuthStore()
  const from        = searchParams.get('from') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setIsLoading(true)
    try {
      const user = await loginApi({ email, password })
      login(user)
      toast.success(`Welcome back, ${user.name}!`)
      router.push(from)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid email or password'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/5 bg-[#0c0c0e]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-400">DS</span>
          </div>
          <span className="font-semibold text-zinc-200">DSA Sheet</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-zinc-100 leading-tight">
              Master DSA with<br />structured practice
            </h2>
            <p className="text-zinc-500 leading-relaxed max-w-sm">
              Track your progress across hundreds of curated problems, build streaks, and prepare for interviews.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              '500+ curated problems across 8 topics',
              'GitHub-style activity heatmap',
              'Smart learning insights',
              'Inline notes with auto-save',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-700">© 2025 DSA Sheet. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-400">DS</span>
            </div>
            <span className="font-semibold text-sm text-zinc-200">DSA Sheet</span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Welcome back</h1>
            <p className="text-sm text-zinc-500 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="bg-zinc-900 border-white/8 text-zinc-200 placeholder:text-zinc-600 rounded-xl h-10 text-sm focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs text-zinc-400">Password</Label>
                <Link href="#" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="bg-zinc-900 border-white/8 text-zinc-200 placeholder:text-zinc-600 rounded-xl h-10 text-sm pr-10 focus:border-indigo-500/50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium gap-2 border-0 transition-all"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/6" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-950 px-3 text-[11px] text-zinc-600">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Google', 'GitHub'].map(p => (
              <button
                key={p}
                disabled
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-white/8 bg-white/[0.03] text-sm text-zinc-500 cursor-not-allowed opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-zinc-600">
            No account?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
