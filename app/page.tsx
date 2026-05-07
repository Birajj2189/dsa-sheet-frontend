'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, TrendingUp, BookOpen, CheckCircle2, BarChart2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Curated Problem Set',
    desc: '500+ hand-picked problems organized by topic and difficulty — no noise, just signal.',
    color: 'text-indigo-400',
    bg:   'bg-indigo-500/8',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Track every solve, build streaks, and see your improvement over time with real data.',
    color: 'text-emerald-400',
    bg:   'bg-emerald-500/8',
  },
  {
    icon: Activity,
    title: 'Activity Heatmap',
    desc: 'GitHub-style contribution graph to visualize your consistency and daily habits.',
    color: 'text-amber-400',
    bg:   'bg-amber-500/8',
  },
  {
    icon: Zap,
    title: 'Smart Insights',
    desc: 'Get personalized insights about your strengths, weak spots, and next best steps.',
    color: 'text-violet-400',
    bg:   'bg-violet-500/8',
  },
  {
    icon: BarChart2,
    title: 'Analytics Dashboard',
    desc: 'Detailed stats on difficulty distribution, weekly activity, and topic completion.',
    color: 'text-rose-400',
    bg:   'bg-rose-500/8',
  },
  {
    icon: CheckCircle2,
    title: 'Notes & Bookmarks',
    desc: 'Inline notes with auto-save and bookmarks to revisit tricky problems anytime.',
    color: 'text-cyan-400',
    bg:   'bg-cyan-500/8',
  },
]

const TOPICS = [
  { name: 'Arrays',      icon: '📊', count: 85  },
  { name: 'Strings',     icon: '🔤', count: 65  },
  { name: 'Linked Lists',icon: '🔗', count: 40  },
  { name: 'Trees',       icon: '🌳', count: 75  },
  { name: 'Graphs',      icon: '🕸️', count: 60  },
  { name: 'Dynamic Prog',icon: '⚡', count: 90  },
  { name: 'Backtracking',icon: '🔄', count: 35  },
  { name: 'Stack/Queue', icon: '📚', count: 50  },
]

const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const container = { visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden"
      >
        {/* Subtle glow bg */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <motion.div variants={item}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-500 mb-8">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open source · Free to use
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.1] mb-6"
          >
            The DSA learning
            <br />
            <span className="gradient-text-indigo">operating system</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed mb-10"
          >
            A structured, elegant platform to master data structures and algorithms.
            Track progress, gain insights, and build consistent habits.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="h-11 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium gap-2 border-0"
            >
              <Link href="/signup">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-11 px-6 rounded-xl border border-white/8 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 text-sm"
            >
              <Link href="/sheet/arrays">Explore problems</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={item} className="flex items-center justify-center gap-6 mt-10 text-xs text-zinc-700">
            {['500+ problems', '8 core topics', 'Free forever'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                {t}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Topics ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-zinc-900/30 py-12 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs text-zinc-600 text-center mb-8 uppercase tracking-widest">Topics covered</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOPICS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/sheet/${t.name.toLowerCase().replace(/ /g, '-').replace('/queue', 'queues')}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/8 transition-all group"
                >
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-200 transition-colors">{t.name}</p>
                    <p className="text-xs text-zinc-700">{t.count} problems</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-zinc-100 mb-3">Everything you need</h2>
            <p className="text-zinc-500 max-w-sm mx-auto">
              Designed for serious learners. Every feature exists to help you improve faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 hover:border-white/8 hover:bg-zinc-900/60 transition-all"
              >
                <div className={`h-9 w-9 rounded-xl ${f.bg} border border-white/5 flex items-center justify-center mb-4`}>
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1.5">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-zinc-100">
              Ready to start?
            </h2>
            <p className="text-zinc-500">
              Join thousands of developers preparing for interviews with structured DSA practice.
            </p>
            <Button
              asChild
              className="h-11 px-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium gap-2 border-0"
            >
              <Link href="/signup">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-400">DS</span>
            </div>
            <span className="text-xs text-zinc-600">DSA Sheet</span>
          </div>
          <p className="text-xs text-zinc-700">Built for learners. Free forever.</p>
        </div>
      </footer>
    </div>
  )
}
