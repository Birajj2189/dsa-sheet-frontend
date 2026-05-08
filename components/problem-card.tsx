'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Bookmark,
  ExternalLink,
  FileText,
  Check,
  Loader2,
  Clock,
  ChevronDown,
  Video,
  BookOpen,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toggleProgress } from '@/lib/api/progress'
import { toggleBookmark } from '@/lib/api/bookmarks'
import { updateNotes } from '@/lib/api/progress'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/store'
import { useAuthModal } from '@/components/auth-modal'
import type { BackendProblem } from '@/types/api'

interface ProblemCardProps {
  problem: BackendProblem
  isSolved: boolean
  isBookmarked: boolean
  notes?: string
}

const DIFFICULTY_STYLES = {
  easy:   { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  medium: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400'   },
  hard:   { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',           dot: 'bg-rose-400'    },
}

export function ProblemCard({ problem, isSolved, isBookmarked, notes = '' }: ProblemCardProps) {
  const queryClient        = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const { show: showAuthModal } = useAuthModal()

  const [showNotes, setShowNotes]     = useState(false)
  const [notesDraft, setNotesDraft]   = useState(notes)
  const [notesJustSaved, setNotesSaved] = useState(false)
  const saveTimeoutRef = useRef<any>(null)

  const diff      = problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
  const diffStyle = DIFFICULTY_STYLES[diff] ?? DIFFICULTY_STYLES.medium

  // ── Guard: show auth modal when unauthenticated ────────────────────────────

  const requireAuth = useCallback(
    (action: string, fn: () => void) => {
      if (!isAuthenticated) { showAuthModal(action); return }
      fn()
    },
    [isAuthenticated, showAuthModal],
  )

  // ── Toggle solved ──────────────────────────────────────────────────────────

  const { mutate: mutateSolved, isPending: isTogglingProgress } = useMutation({
    mutationFn: () => toggleProgress(problem._id),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.me() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      if (res.completed) toast.success('Problem marked complete ✓')
    },
    onError: () => toast.error('Failed to update — please retry'),
  })

  // ── Toggle bookmark ────────────────────────────────────────────────────────

  const { mutate: mutateBookmark, isPending: isTogglingBookmark } = useMutation({
    mutationFn: () => toggleBookmark(problem._id),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.me() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.me() })
      toast.success(res.bookmarked ? 'Bookmarked' : 'Bookmark removed')
    },
    onError: () => toast.error('Failed to update bookmark'),
  })

  // ── Auto-save notes ────────────────────────────────────────────────────────

  const { mutate: saveNotes, isPending: isSavingNotes } = useMutation({
    mutationFn: (text: string) => updateNotes(problem._id, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.me() })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    },
    onError: () => toast.error('Failed to save notes'),
  })

  const handleNotesChange = (text: string) => {
    setNotesDraft(text)
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveNotes(text), 1500)
  }

  // Keep draft in sync if parent updates (e.g. after optimistic reset)
  useEffect(() => setNotesDraft(notes), [notes])
  useEffect(() => () => clearTimeout(saveTimeoutRef.current), [])

  const handleNotesToggle = () => {
    if (!isAuthenticated && !showNotes) {
      showAuthModal('save notes for this problem')
      return
    }
    setShowNotes(!showNotes)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`group relative rounded-2xl border transition-colors duration-150 ${
        isSolved
          ? 'border-emerald-500/10 bg-emerald-500/[0.03]'
          : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-white/8'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => requireAuth('mark this problem as solved', () => mutateSolved())}
            disabled={isTogglingProgress && isAuthenticated}
            className="mt-0.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            aria-label={isSolved ? 'Mark unsolved' : 'Mark solved'}
          >
            <motion.div
              animate={isSolved ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.22 }}
              className={`h-4 w-4 rounded-[5px] border flex items-center justify-center transition-all duration-150 ${
                isSolved
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              {isTogglingProgress && isAuthenticated
                ? <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
                : isSolved && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              }
            </motion.div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title + Difficulty */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className={`text-sm font-medium leading-snug transition-colors ${
                isSolved ? 'line-through text-zinc-600' : 'text-zinc-200'
              }`}>
                {problem.title}
              </p>

              <div className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${diffStyle.badge}`}>
                <div className={`h-1 w-1 rounded-full ${diffStyle.dot}`} />
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </div>
            </div>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {problem.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="inline-block px-1.5 py-0.5 text-[10px] rounded-md bg-white/5 text-zinc-500 border border-white/5">
                    {tag}
                  </span>
                ))}
                {problem.tags && problem.tags.length > 4 && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] rounded-md bg-white/5 text-zinc-600">
                    +{problem.tags.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 flex-wrap">
              {problem.estimatedTime && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-600">
                  <Clock className="h-3 w-3" />
                  {problem.estimatedTime}m
                </div>
              )}

              <div className="flex items-center gap-1 ml-auto">
                {/* Notes */}
                <button
                  onClick={handleNotesToggle}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all ${
                    showNotes || (isAuthenticated && notesDraft)
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Notes</span>
                  {showNotes && <ChevronDown className="h-2.5 w-2.5 rotate-180" />}
                  {!showNotes && <ChevronDown className="h-2.5 w-2.5" />}
                </button>

                {problem.leetcodeLink && (
                  <a href={problem.leetcodeLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all">
                    <ExternalLink className="h-3 w-3" /> LC
                  </a>
                )}
                {problem.youtubeLink && (
                  <a href={problem.youtubeLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all">
                    <Video className="h-3 w-3" />
                  </a>
                )}
                {problem.articleLink && (
                  <a href={problem.articleLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all">
                    <BookOpen className="h-3 w-3" />
                  </a>
                )}

                {/* Bookmark */}
                <button
                  onClick={() => requireAuth('bookmark this problem', () => mutateBookmark())}
                  disabled={isTogglingBookmark && isAuthenticated}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all disabled:opacity-50"
                  aria-label="Bookmark"
                >
                  {isTogglingBookmark && isAuthenticated
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : (
                      <Bookmark className={`h-3.5 w-3.5 transition-colors ${
                        isBookmarked && isAuthenticated ? 'fill-amber-400 text-amber-400' : ''
                      }`} />
                    )
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expandable notes (auth-gated) ── */}
      <AnimatePresence initial={false}>
        {showNotes && isAuthenticated && (
          <motion.div
            key="notes"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }, opacity: { duration: 0.15 } }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
              <div className="relative">
                <Textarea
                  value={notesDraft}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add notes, your approach, key insights…"
                  className="min-h-[80px] text-xs resize-none bg-transparent border-white/8 text-zinc-300 placeholder:text-zinc-600 rounded-xl focus:border-indigo-500/40 focus:ring-0"
                  maxLength={5000}
                />
                <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] text-zinc-600">
                  {isSavingNotes  && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                  {notesJustSaved && <span className="text-emerald-500">Saved ✓</span>}
                  {!isSavingNotes && !notesJustSaved && <span>{notesDraft?.length || 0}/5000</span>}
                </div>
              </div>
              <p className="text-[10px] text-zinc-700">Auto-saves as you type</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
