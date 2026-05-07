'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Check, X, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store'
import { register as registerApi } from '@/lib/api/auth'
import { getErrorMessage } from '@/lib/api/client'

function SignupForm() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const { login }    = useAuthStore()
  const from         = searchParams.get('from') || '/dashboard'

  const checks = {
    length:    password.length >= 8,
    upper:     /[A-Z]/.test(password),
    lower:     /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
  }
  const isValid  = Object.values(checks).every(Boolean)
  const matches  = password === confirm && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !matches) return
    setIsLoading(true)
    try {
      const user = await registerApi({ name, email, password })
      login(user)
      toast.success(`Account created! Welcome, ${user.name} 🎉`)
      router.push(from)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm space-y-8"
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-400">DS</span>
          </div>
          <span className="font-semibold text-sm text-zinc-200">DSA Sheet</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Create an account</h1>
          <p className="text-sm text-zinc-500 mt-1">Start your DSA learning journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Full Name</Label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="name"
              className="bg-zinc-900 border-white/8 text-zinc-200 placeholder:text-zinc-600 rounded-xl h-10 text-sm focus:border-indigo-500/50"
            />
          </div>

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
            <Label className="text-xs text-zinc-400">Password</Label>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                className="bg-zinc-900 border-white/8 text-zinc-200 placeholder:text-zinc-600 rounded-xl h-10 text-sm pr-10 focus:border-indigo-500/50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-1 pt-1"
              >
                {[
                  { key: 'length', label: '8+ characters' },
                  { key: 'upper',  label: 'Uppercase'      },
                  { key: 'lower',  label: 'Lowercase'      },
                  { key: 'number', label: 'Number'         },
                ].map(({ key, label }) => {
                  const ok = checks[key as keyof typeof checks]
                  return (
                    <div key={key} className="flex items-center gap-1.5 text-[11px]">
                      {ok
                        ? <Check className="h-3 w-3 text-emerald-500" />
                        : <X     className="h-3 w-3 text-zinc-700"    />
                      }
                      <span className={ok ? 'text-emerald-500' : 'text-zinc-600'}>{label}</span>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                className="bg-zinc-900 border-white/8 text-zinc-200 placeholder:text-zinc-600 rounded-xl h-10 text-sm pr-10 focus:border-indigo-500/50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirm && (
              <div className={`flex items-center gap-1.5 text-[11px] ${matches ? 'text-emerald-500' : 'text-rose-500'}`}>
                {matches ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {matches ? 'Passwords match' : "Passwords don't match"}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isValid || !matches}
            className="w-full h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium gap-2 border-0 mt-2"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
            ) : (
              <>Create account <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
