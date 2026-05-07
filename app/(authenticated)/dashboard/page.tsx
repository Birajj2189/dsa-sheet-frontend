'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Flame, Target, Zap, TrendingUp, ArrowUpRight, BookOpen, Trophy, Lightbulb, CheckIcon } from 'lucide-react'
import { useAuthStore } from '@/store'
import { DashboardSkeleton } from '@/components/skeletons'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { ProgressRing } from '@/components/progress-ring'
import { getDashboardStats } from '@/lib/api/dashboard'
import { getMyProgress } from '@/lib/api/progress'
import { queryKeys } from '@/lib/query-keys'
import type { DashboardStatsResponse, BackendProblem } from '@/types/api'

// Dynamic imports for heavy chart components
const DashboardBarChart = dynamic(() => import('@/components/dashboard-bar-chart'), { ssr: false })

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#e4e4e7',
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
}

function greet(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name}`
  if (h < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

function generateInsights(stats: DashboardStatsResponse) {
  const insights: { icon: string; text: string; color: string }[] = []
  const { totalSolved, easySolved, mediumSolved, hardSolved, topicCompletion } = stats

  if (mediumSolved > 10)
    insights.push({ icon: '📈', text: 'Challenge yourself with more Medium problems.', color: 'indigo' })

  if (hardSolved >= 5)
    insights.push({ icon: '🏆', text: `You've tackled ${hardSolved} Hard problems. Impressive!`, color: 'emerald' })

  const weakest = topicCompletion.find(t => t.percentage < 20 && t.total > 5)
  if (weakest)
    insights.push({ icon: '💡', text: `${weakest.title} only at ${weakest.percentage}% — worth revisiting.`, color: 'violet' })

  const strongest = topicCompletion.find(t => t.percentage >= 80)
  if (strongest)
    insights.push({ icon: '⭐', text: `Strong in ${strongest.title} (${strongest.percentage}%)!`, color: 'emerald' })

  if (totalSolved === 0)
    insights.push({ icon: '🚀', text: 'Solve your first problem to start tracking insights.', color: 'indigo' })

  return insights.slice(0, 3)
}

const INSIGHT_COLORS: Record<string, string> = {
  amber:   'bg-amber-500/8 border-amber-500/15 text-amber-400',
  indigo:  'bg-indigo-500/8 border-indigo-500/15 text-indigo-400',
  emerald: 'bg-emerald-500/8 border-emerald-500/15 text-emerald-400',
  violet:  'bg-violet-500/8 border-violet-500/15 text-violet-400',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn:  getDashboardStats,
    staleTime: 5 * 60_000,
  })

  const { data: progressList = [] } = useQuery({
    queryKey: queryKeys.progress.me(),
    queryFn:  getMyProgress,
    staleTime: 2 * 60_000,
  })

  // Weekly stats for BarChart
  const weeklyStats = useMemo(() => {
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now  = new Date()
    const map: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      map[DAYS[d.getDay()]] = 0
    }
    stats?.recentlySolved.forEach(p => {
      const day = DAYS[new Date(p.completedAt).getDay()]
      if (day in map) map[day] = (map[day] ?? 0) + 1
    })
    return Object.entries(map).map(([name, completed]) => ({ 
      name, 
      completed,
      color: completed > 0 ? '#6366f1' : 'rgba(99,102,241,0.12)'
    }))
  }, [stats])

  const bookmarkedProblems = useMemo(() => {
    return progressList
      .filter(p => p.bookmarked && typeof p.problemId !== 'string')
      .map(p => {
        const problem = p.problemId as BackendProblem
        const topicId = typeof problem.topicId === 'string' ? problem.topicId : problem.topicId?._id
        const topic   = stats?.topicCompletion.find(t => t.topicId === topicId)
        return {
          _id: problem._id,
          title: problem.title,
          topicSlug: topic?.slug ?? 'arrays'
        }
      })
      .slice(0, 6)
  }, [progressList, stats])

  const overallPct = stats
    ? Math.round((stats.totalSolved / Math.max(stats.totalProblems, 1)) * 100)
    : 0

  const insights = stats ? generateInsights(stats) : []

  const isLoading = statsLoading

  const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }
  const container = {
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Hero section */}
          <motion.div variants={item}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400 flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-zinc-100 truncate">
                      {user?.name ? greet(user.name) : 'Dashboard'} 👋
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {stats?.totalSolved
                        ? `You've solved ${stats.totalSolved} problems total · ${stats.streak} day streak`
                        : 'Start solving problems to track your progress'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ProgressRing
                    value={overallPct}
                    size={72}
                    strokeWidth={5}
                    color="#6366f1"
                    label={`${overallPct}%`}
                    sublabel="done"
                  />
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-zinc-500">Overall progress</p>
                    <p className="text-sm font-medium text-zinc-300">
                      {stats?.totalSolved ?? 0} / {stats?.totalProblems ?? '–'} solved
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
                {[
                  { icon: Target, label: 'Solved',  value: stats?.totalSolved ?? 0,                        color: 'text-indigo-400' },
                  { icon: Flame,  label: 'Streak',  value: `${stats?.streak ?? 0}d`,                       color: 'text-amber-400'  },
                  { icon: Zap,    label: 'XP',      value: (stats?.xp ?? 0).toLocaleString(),               color: 'text-violet-400' },
                  { icon: Trophy, label: 'Topics',  value: stats?.topicCompletion?.filter(t=>t.percentage===100).length ?? 0, color: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
                    <s.icon className={`h-4 w-4 flex-shrink-0 ${s.color}`} />
                    <div>
                      <p className="text-[11px] text-zinc-500">{s.label}</p>
                      <p className="text-base font-semibold text-zinc-200">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly bar */}
            <motion.div variants={item} className="lg:col-span-2">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-semibold text-zinc-300">This Week</h2>
                    <p className="text-[10px] text-zinc-600">Problems solved per day</p>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-zinc-600" />
                </div>
                <DashboardBarChart data={weeklyStats} tooltipConfig={CHART_TOOLTIP} />
              </div>
            </motion.div>

            {/* Smart insights */}
            <motion.div variants={item}>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-zinc-300">Insights</h2>
                  <Lightbulb className="h-3.5 w-3.5 text-zinc-600" />
                </div>
                {insights.length > 0 ? (
                  <div className="space-y-2.5">
                    {insights.map((ins, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border px-4 py-3 text-sm ${INSIGHT_COLORS[ins.color]}`}
                      >
                        <span className="mr-2">{ins.icon}</span>
                        {ins.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Lightbulb className="h-8 w-8 text-zinc-700 mb-2" />
                    <p className="text-xs text-zinc-600">Insights appear after you solve a few problems</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently solved */}
            {stats?.recentlySolved && stats.recentlySolved.length > 0 && (
              <motion.div variants={item}>
                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 h-full">
                  <h2 className="text-sm font-semibold text-zinc-300 mb-4">Recent Activity</h2>
                  <div className="space-y-1">
                    {stats.recentlySolved.slice(0, 6).map((p) => (
                      <div
                        key={p.problemId}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-all group"
                      >
                        <div className="h-5 w-5 rounded-md bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckIcon className="h-2.5 w-2.5 text-emerald-400" />
                        </div>
                        <span className="flex-1 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
                          {p.title}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                          p.difficulty === 'easy'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : p.difficulty === 'medium'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {p.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bookmarks */}
            {bookmarkedProblems.length > 0 && (
              <motion.div variants={item}>
                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-zinc-300">Bookmarks</h2>
                    <BookOpen className="h-3.5 w-3.5 text-zinc-600" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {bookmarkedProblems.map((p) => (
                      <Link
                        key={p._id}
                        href={`/sheet/${p.topicSlug}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/5 transition-all group"
                      >
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-300 truncate group-hover:text-white transition-colors">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 capitalize">{p.topicSlug.replace('-', ' ')}</p>
                        </div>
                        <ArrowUpRight className="h-3 w-3 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div variants={item}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-5">Topic Progress</h2>
              <ActivityHeatmap progressList={progressList} weeks={16} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
