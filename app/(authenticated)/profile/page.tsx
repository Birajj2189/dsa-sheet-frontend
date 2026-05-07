'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { ProgressRing } from '@/components/progress-ring'
import { ProfileSkeleton } from '@/components/skeletons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trophy, Flame, Target, Zap, Edit2, Check as CheckIcon, X, Loader2, Lock } from 'lucide-react'
import { getUserProfile, updateUserProfile } from '@/lib/api/user'
import { getDashboardStats } from '@/lib/api/dashboard'
import { getMyProgress } from '@/lib/api/progress'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/store'

// Dynamic imports for heavy chart components
const ProfileTrendChart = dynamic(() => import('@/components/profile-trend-chart'), { ssr: false })

const ACHIEVEMENTS = [
  { id: 1, title: 'First Steps',    icon: '🎉', threshold: 1,   desc: 'Solve 1 problem'    },
  { id: 2, title: 'Getting Warmed', icon: '⭐', threshold: 10,  desc: 'Solve 10 problems'  },
  { id: 3, title: 'On A Roll',      icon: '🔥', threshold: 25,  desc: 'Solve 25 problems'  },
  { id: 4, title: 'Century',        icon: '💯', threshold: 100, desc: 'Solve 100 problems' },
  { id: 5, title: 'Elite Coder',    icon: '👑', threshold: 250, desc: 'Solve 250 problems' },
  { id: 6, title: 'Legend',         icon: '🎯', threshold: 500, desc: 'Solve 500 problems' },
]

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#e4e4e7',
  },
}

export default function ProfilePage() {
  const { updateUser }    = useAuthStore()
  const queryClient       = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName]   = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn:  getUserProfile,
    staleTime: 5 * 60_000,
  })

  const { data: stats } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn:  getDashboardStats,
    staleTime: 2 * 60_000,
  })

  const { data: progressList = [] } = useQuery({
    queryKey: queryKeys.progress.me(),
    queryFn:  getMyProgress,
    staleTime: 2 * 60_000,
  })

  // 30-day activity data
  const activityData = (() => {
    const now = new Date()
    const counts: Record<number, number> = {}
    progressList.forEach(p => {
      if (!p.completedAt || !p.completed) return
      const diff = Math.floor((now.getTime() - new Date(p.completedAt).getTime()) / 86400000)
      if (diff >= 0 && diff < 30) counts[30 - diff] = (counts[30 - diff] ?? 0) + 1
    })
    return Array.from({ length: 30 }, (_, i) => ({ day: i + 1, problems: counts[i + 1] ?? 0 }))
  })()

  const { mutate: saveName, isPending: isSaving } = useMutation({
    mutationFn: () => updateUserProfile({ name: editName }),
    onSuccess: (updated) => {
      updateUser({ name: updated.name })
      queryClient.setQueryData(queryKeys.user.profile(), updated)
      setIsEditing(false)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const totalSolved = stats?.totalSolved ?? 0
  const overallPct  = stats ? Math.round((totalSolved / Math.max(stats.totalProblems, 1)) * 100) : 0

  const item      = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }
  const container = { visible: { transition: { staggerChildren: 0.06 } } }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">

          {/* ── Profile card ─────────────────────────────────────── */}
          <motion.div variants={item}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold text-indigo-300 flex-shrink-0">
                  {profile?.name?.[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="h-9 max-w-xs bg-zinc-800 border-white/10 text-zinc-200 rounded-xl text-sm"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setIsEditing(false) }}
                      />
                      <Button size="sm" variant="ghost" onClick={() => saveName()} disabled={isSaving || !editName.trim()} className="h-8 w-8 p-0 rounded-xl">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 rounded-xl">
                        <X className="h-3.5 w-3.5 text-zinc-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-zinc-100">{profile?.name}</h1>
                      <button
                        onClick={() => { setEditName(profile?.name ?? ''); setIsEditing(true) }}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-zinc-500">{profile?.email}</p>
                  {profile?.createdAt && (
                    <p className="text-xs text-zinc-700">
                      Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Overall ring */}
                <ProgressRing
                  value={overallPct}
                  size={72}
                  strokeWidth={5}
                  color="#6366f1"
                  label={`${overallPct}%`}
                  sublabel="solved"
                />
              </div>
            </div>
          </motion.div>

          {/* ── Stats strip ──────────────────────────────────────── */}
          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Target, label: 'Solved',  value: totalSolved,                          color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/15' },
              { icon: Flame,  label: 'Streak',  value: `${stats?.streak ?? 0}d`,             color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/15'   },
              { icon: Zap,    label: 'XP',      value: (stats?.xp ?? 0).toLocaleString(),    color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/15' },
              { icon: Trophy, label: 'Badges',  value: ACHIEVEMENTS.filter(a => totalSolved >= a.threshold).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-zinc-200">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Difficulty breakdown ────────────────────────────── */}
          {stats && (
            <motion.div variants={item}>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-300">Difficulty Progress</h2>
                {[
                  { label: 'Easy',   solved: stats.easySolved,   total: stats.easyTotal,   color: '#10b981' },
                  { label: 'Medium', solved: stats.mediumSolved, total: stats.mediumTotal, color: '#f59e0b' },
                  { label: 'Hard',   solved: stats.hardSolved,   total: stats.hardTotal,   color: '#f43f5e' },
                ].map(d => {
                  const pct = d.total > 0 ? (d.solved / d.total) * 100 : 0
                  return (
                    <div key={d.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: d.color }}>{d.label}</span>
                        <span className="text-zinc-600">{d.solved}/{d.total}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: d.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Activity heatmap ─────────────────────────────────── */}
          <motion.div variants={item}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-5">Activity</h2>
              <ActivityHeatmap progressList={progressList} weeks={20} />
            </div>
          </motion.div>

          {/* ── 30-day trend ─────────────────────────────────────── */}
          <motion.div variants={item}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-5">30-Day Trend</h2>
              <ProfileTrendChart data={activityData} tooltipConfig={CHART_TOOLTIP} />
            </div>
          </motion.div>

          {/* ── Achievements ─────────────────────────────────────── */}
          <motion.div variants={item}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-5">Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map(a => {
                  const unlocked = totalSolved >= a.threshold
                  return (
                    <motion.div
                      key={a.id}
                      whileHover={unlocked ? { scale: 1.02, y: -1 } : {}}
                      transition={{ duration: 0.15 }}
                      className={`relative rounded-2xl border p-4 text-center transition-all ${
                        unlocked
                          ? 'border-indigo-500/20 bg-indigo-500/5'
                          : 'border-white/5 bg-white/[0.02] opacity-40'
                      }`}
                    >
                      {!unlocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="h-2.5 w-2.5 text-zinc-700" />
                        </div>
                      )}
                      <div className="text-2xl mb-2 filter">{a.icon}</div>
                      <p className="text-xs font-semibold text-zinc-300">{a.title}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{a.desc}</p>
                      {unlocked && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                          <CheckIcon className="h-2.5 w-2.5" /> Unlocked
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  )
}
