'use client'

import { cn } from '@/lib/utils'

// ─── Shimmer base ─────────────────────────────────────────────────────────────

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl shimmer bg-zinc-800/60',
        className,
      )}
    />
  )
}

// ─── Problem card skeleton ────────────────────────────────────────────────────

export function ProblemCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Bone className="h-4 w-4 mt-0.5 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Bone className="h-4 w-44" />
            <Bone className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <Bone className="h-4 w-16 rounded-full" />
            <Bone className="h-4 w-20 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <Bone className="h-3 w-14" />
            <div className="flex gap-2">
              <Bone className="h-6 w-20 rounded-lg" />
              <Bone className="h-6 w-6 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stat card skeleton ───────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-8 w-16" />
        </div>
        <Bone className="h-9 w-9 rounded-xl" />
      </div>
      <Bone className="h-1 w-full rounded-full" />
    </div>
  )
}

// ─── Dashboard skeleton ───────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4">
          <Bone className="h-12 w-12 rounded-2xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Bone className="h-6 w-48" />
            <Bone className="h-3 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-4">
        <Bone className="h-4 w-32" />
        <Bone className="h-20 w-full" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-4">
          <Bone className="h-4 w-28" />
          <Bone className="h-52 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-4">
          <Bone className="h-4 w-24" />
          <Bone className="h-52 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Topic page skeleton ──────────────────────────────────────────────────────

export function TopicPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Bone className="h-14 w-14 rounded-2xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72" />
        </div>
      </div>
      <Bone className="h-2.5 w-full rounded-full" />
      <div className="flex gap-3">
        <Bone className="h-9 flex-1 rounded-xl" />
        <Bone className="h-9 w-16 rounded-xl" />
        <Bone className="h-9 w-20 rounded-xl" />
        <Bone className="h-9 w-16 rounded-xl" />
        <Bone className="h-9 w-14 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Bone className="h-14 w-full rounded-2xl" />
        <div className="space-y-2 pl-2">
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
        </div>
      </div>
      <div className="space-y-3">
        <Bone className="h-14 w-full rounded-2xl" />
        <div className="space-y-2 pl-2">
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar topic skeleton ───────────────────────────────────────────────────

export function SidebarTopicSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Bone className="h-4 w-4 rounded-lg flex-shrink-0" />
          <Bone className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

// ─── Profile skeleton ─────────────────────────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Bone className="h-16 w-16 rounded-2xl flex-shrink-0" />
        <div className="space-y-2">
          <Bone className="h-7 w-40" />
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
