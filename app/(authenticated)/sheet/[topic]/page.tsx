'use client'

import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ProblemCard } from '@/components/problem-card'
import { TopicPageSkeleton } from '@/components/skeletons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react'
import { getTopicBySlug } from '@/lib/api/topics'
import { getSubtopicsByTopic } from '@/lib/api/subtopics'
import { getProblemsByTopic } from '@/lib/api/problems'
import { getMyProgress } from '@/lib/api/progress'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/store'
import type { BackendProblem, BackendSubtopic, ProgressMap } from '@/types/api'

type DiffFilter = 'all' | 'easy' | 'medium' | 'hard'
const DIFF_LABELS: Record<DiffFilter, string> = { all: 'All', easy: 'Easy', medium: 'Medium', hard: 'Hard' }

const TOPIC_ICONS: Record<string, string> = {
  arrays: '📊', strings: '🔤', 'linked-lists': '🔗', 'stacks-queues': '📚',
  trees: '🌳', graphs: '🕸️', 'dynamic-programming': '⚡', backtracking: '🔄',
}

function getSubtopicArticleLink(subtopic: BackendSubtopic, topicTitle?: string) {
  if (subtopic.articleLink) return subtopic.articleLink

  const query = encodeURIComponent(`${topicTitle ?? ''} ${subtopic.title} DSA article`)
  return `https://www.google.com/search?q=${query}`
}

interface AccordionSectionProps {
  id: string
  header: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionSection({ id, header, action, children, defaultOpen = true }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <div className="w-full flex items-center gap-2 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/8 transition-colors duration-150 group">
        <button
          onClick={() => setOpen(o => !o)}
          className="min-w-0 flex-1 flex items-center justify-between px-4 py-3 text-left"
          aria-expanded={open}
        >
          <div className="min-w-0 flex items-center gap-2">{header}</div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
          </motion.div>
        </button>
        {action && <div className="pr-3">{action}</div>}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height:  { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-2 pb-1 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TopicPage() {
  const params    = useParams()
  const topicSlug = Array.isArray(params.topic) ? params.topic[0] : (params.topic as string)
  const { isAuthenticated } = useAuthStore()

  const [search, setSearch] = useState('')
  const [diff, setDiff]     = useState<DiffFilter>('all')

  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: queryKeys.topics.bySlug(topicSlug),
    queryFn:  () => getTopicBySlug(topicSlug),
    enabled:  !!topicSlug,
    staleTime: 20 * 60_000,
  })

  const { data: subtopics = [], isLoading: subtopicsLoading } = useQuery({
    queryKey: queryKeys.subtopics.byTopic(topic?._id ?? ''),
    queryFn:  () => getSubtopicsByTopic(topic!._id),
    enabled:  !!topic?._id,
    staleTime: 20 * 60_000,
  })

  const { data: problemsPage, isLoading: problemsLoading } = useQuery({
    queryKey: queryKeys.problems.byTopic(topic?._id ?? '', { limit: 200 }),
    queryFn:  () => getProblemsByTopic(topic!._id, { limit: 200 }),
    enabled:  !!topic?._id,
    staleTime: 10 * 60_000,
  })

  const { data: progressList = [] } = useQuery({
    queryKey: queryKeys.progress.me(),
    queryFn:  getMyProgress,
    enabled:  isAuthenticated,
    staleTime: 2 * 60_000,
  })

  const progressMap = useMemo<ProgressMap>(() => {
    const m: ProgressMap = new Map()
    progressList.forEach(p => {
      const id = typeof p.problemId === 'string' ? p.problemId : p.problemId?._id
      if (id) m.set(id, p)
    })
    return m
  }, [progressList])

  const problems  = problemsPage?.problems ?? []
  const isLoading = topicLoading || subtopicsLoading || problemsLoading

  const totalSolved = useMemo(
    () => problems.filter(p => progressMap.get(p._id)?.completed).length,
    [problems, progressMap],
  )

  const filtered = useMemo(
    () => problems.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(search.toLowerCase())
      const matchDiff  = diff === 'all' || p.difficulty === diff
      return matchTitle && matchDiff
    }),
    [problems, search, diff],
  )

  const bySubtopic = useMemo(() => {
    const map  = new Map<string, BackendProblem[]>()
    const none: BackendProblem[] = []
    filtered.forEach(p => {
      const stId = typeof p.subtopicId === 'string' ? p.subtopicId : (p.subtopicId as BackendSubtopic | undefined)?._id
      if (stId) { if (!map.has(stId)) map.set(stId, []); map.get(stId)!.push(p) }
      else none.push(p)
    })
    return { map, none }
  }, [filtered])

  const progressPct = problems.length > 0 ? Math.round((totalSolved / problems.length) * 100) : 0
  const clearFilters = useCallback(() => { setSearch(''); setDiff('all') }, [])

  if (topicError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-zinc-600 mx-auto" />
          <h1 className="text-xl font-semibold text-zinc-300">Topic not found</h1>
          <p className="text-sm text-zinc-600">The topic "{topicSlug}" doesn't exist.</p>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl mt-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <TopicPageSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl flex-shrink-0">
                {TOPIC_ICONS[topic?.slug ?? ''] ?? topic?.icon ?? '📖'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-zinc-100">{topic?.title}</h1>
                {topic?.description && (
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{topic.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{progressPct}% complete</span>
                <span>{totalSolved} / {problems.length} solved</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
              <Input
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-zinc-900/50 border-white/8 text-zinc-300 placeholder:text-zinc-600 rounded-xl h-9 text-sm focus:border-indigo-500/40"
              />
            </div>
            <div className="flex gap-1.5">
              {(Object.keys(DIFF_LABELS) as DiffFilter[]).map(f => (
                <Button
                  key={f}
                  size="sm"
                  onClick={() => setDiff(f)}
                  className={`rounded-xl h-9 px-3 text-xs transition-all ${
                    diff === f
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/30'
                      : 'bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {DIFF_LABELS[f]}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {subtopics.map((st: BackendSubtopic, idx: number) => {
              const stProblems = bySubtopic.map.get(st._id) ?? []
              if (stProblems.length === 0) return null

              const stSolved = isAuthenticated
                ? stProblems.filter(p => progressMap.get(p._id)?.completed).length
                : 0
              const stPct = stProblems.length > 0 ? Math.round((stSolved / stProblems.length) * 100) : 0

              return (
                <motion.div
                  key={st._id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                >
                  <AccordionSection
                    id={st._id}
                    defaultOpen={idx < 3}
                    action={
                      <a
                        href={getSubtopicArticleLink(st, topic?.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-zinc-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                        aria-label={`Open article for ${st.title}`}
                        title={st.articleLink ? `Read curated article for ${st.title}` : `Search articles for ${st.title}`}
                      >
                        <BookOpen className="h-3 w-3" />
                        <span className="hidden sm:inline">Guide</span>
                      </a>
                    }
                    header={
                      <>
                        <span className="text-sm font-medium text-zinc-300">{st.title}</span>
                        <span className="text-xs text-zinc-600">
                          {isAuthenticated ? `${stSolved}/` : ''}{stProblems.length}
                        </span>
                        {isAuthenticated && stProblems.length > 0 && (
                          <div className="hidden sm:flex h-1 w-16 bg-zinc-800 rounded-full overflow-hidden ml-1">
                            <div
                              className="h-full bg-indigo-500/60 rounded-full transition-all duration-500"
                              style={{ width: `${stPct}%` }}
                            />
                          </div>
                        )}
                      </>
                    }
                  >
                    {stProblems.map(p => (
                      <ProblemCard
                        key={p._id}
                        problem={p}
                        isSolved={progressMap.get(p._id)?.completed ?? false}
                        isBookmarked={progressMap.get(p._id)?.bookmarked ?? false}
                        notes={progressMap.get(p._id)?.notes ?? ''}
                      />
                    ))}
                  </AccordionSection>
                </motion.div>
              )
            })}

            {bySubtopic.none.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
              >
                <AccordionSection
                  id="general"
                  defaultOpen
                  header={<span className="text-sm font-medium text-zinc-300">General</span>}
                >
                  {bySubtopic.none.map(p => (
                    <ProblemCard
                      key={p._id}
                      problem={p}
                      isSolved={progressMap.get(p._id)?.completed ?? false}
                      isBookmarked={progressMap.get(p._id)?.bookmarked ?? false}
                      notes={progressMap.get(p._id)?.notes ?? ''}
                    />
                  ))}
                </AccordionSection>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {filtered.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <Search className="h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500">No problems match your filters</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs"
                >
                  Clear filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
