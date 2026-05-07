'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, Filter, Trash2, ArrowRight, BookMarked, Sparkles } from 'lucide-react'
import { getMyProgress } from '@/lib/api/progress'
import { getTopics } from '@/lib/api/topics'
import { queryKeys } from '@/lib/query-keys'
import { ProblemCard } from '@/components/problem-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { BackendProblem, BackendTopic } from '@/types/api'

type DiffFilter = 'all' | 'easy' | 'medium' | 'hard'

export default function BookmarksPage() {
  const [search, setSearch] = useState('')
  const [diff, setDiff] = useState<DiffFilter>('all')

  const { data: progressList = [], isLoading: progressLoading } = useQuery({
    queryKey: queryKeys.progress.me(),
    queryFn:  getMyProgress,
    staleTime: 2 * 60_000,
  })

  const { data: topics = [] } = useQuery({
    queryKey: queryKeys.topics.all(),
    queryFn:  getTopics,
    staleTime: 30 * 60_000,
  })

  const bookmarked = useMemo(() => {
    return progressList
      .filter(p => p.bookmarked && p.problemId && typeof p.problemId !== 'string')
      .map(p => {
        const problem = p.problemId as BackendProblem
        if (!problem) return null
        const topicId = typeof problem.topicId === 'string' ? problem.topicId : problem.topicId?._id
        const topic   = topics.find(t => t._id === topicId)
        return {
          ...p,
          problem: {
            ...problem,
            topicSlug: topic?.slug ?? 'arrays'
          }
        }
      })
      .filter((p): p is NonNullable<typeof p> => !!p)
      .filter(p => {
        const matchSearch = p.problem.title.toLowerCase().includes(search.toLowerCase())
        const matchDiff   = diff === 'all' || p.problem.difficulty.toLowerCase() === diff
        return matchSearch && matchDiff
      })
  }, [progressList, topics, search, diff])

  const isLoading = progressLoading

  const container = { visible: { transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5">
              <BookMarked className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Review Bookmarks</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Your curated list of problems to revisit</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-zinc-400">
              <span className="text-zinc-100 font-medium">{bookmarked.length}</span> saved
            </div>
            {bookmarked.length > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>Keep going!</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <Input
              placeholder="Filter bookmarked problems..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-white/8 text-zinc-200 placeholder:text-zinc-600 rounded-2xl h-11 text-sm focus:border-indigo-500/40 transition-all"
            />
          </div>
          <div className="flex gap-1.5 bg-zinc-900/40 p-1 rounded-2xl border border-white/5">
            {(['all', 'easy', 'medium', 'hard'] as DiffFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setDiff(f)}
                className={`px-4 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  diff === f
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Section */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 w-full bg-zinc-900/40 rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {bookmarked.length > 0 ? (
              <motion.div 
                key="list"
                layout
                className="space-y-3"
              >
                {bookmarked.map((p) => (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProblemCard
                      problem={p.problem as any}
                      isSolved={p.completed}
                      isBookmarked={p.bookmarked}
                      notes={p.notes ?? ''}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-white/5 bg-zinc-900/20"
              >
                <div className="h-20 w-20 rounded-full bg-zinc-900/60 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                  <BookOpen className="h-10 w-10 text-zinc-700" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-300">
                  {search || diff !== 'all' ? 'No matches found' : 'No bookmarks yet'}
                </h2>
                <p className="text-sm text-zinc-600 mt-2 max-w-xs leading-relaxed">
                  {search || diff !== 'all' 
                    ? "Try adjusting your filters or search term to find what you're looking for."
                    : "Save problems while practicing to see them here for later review. It's a great way to track difficult ones!"
                  }
                </p>
                {(search || diff !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSearch(''); setDiff('all') }}
                    className="mt-6 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 rounded-xl"
                  >
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}
