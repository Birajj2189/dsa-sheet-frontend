'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  LogOut,
  Loader2,
  Menu,
} from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store'
import { getTopics } from '@/lib/api/topics'
import { queryKeys } from '@/lib/query-keys'
import { SidebarTopicSkeleton } from '@/components/skeletons'
import { logout as logoutApi } from '@/lib/api/auth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  Database,
  Type,
  GitCommit,
  Layers,
  Trees as TreesIcon,
  Share2,
  Zap,
  RotateCcw,
} from 'lucide-react'

const TOPIC_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  arrays: {
    icon: Database,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  strings: {
    icon: Type,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  'linked-lists': {
    icon: GitCommit,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  'stacks-queues': {
    icon: Layers,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  trees: {
    icon: TreesIcon,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  graphs: {
    icon: Share2,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  'dynamic-programming': {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  backtracking: {
    icon: RotateCcw,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
}

const MAIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookmarks', label: 'Bookmarks', icon: BookOpen        },
  { href: '/profile',   label: 'Profile',   icon: User            },
]

// ─── Sidebar content (shared between desktop + mobile) ───────────────────────

interface SidebarContentProps {
  collapsed: boolean
  onClose?: () => void
}

function SidebarContent({ collapsed, onClose }: SidebarContentProps) {
  const pathname     = usePathname()
  const router       = useRouter()
  const queryClient  = useQueryClient()
  const { user, logout } = useAuthStore()
  const { setCommandOpen } = useUIStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { data: topics, isLoading } = useQuery({
    queryKey: queryKeys.topics.all(),
    queryFn: getTopics,
    staleTime: 30 * 60_000,  // topics rarely change
    gcTime:   60 * 60_000,
  })

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try { await logoutApi() } catch {}
    logout()
    queryClient.clear()
    router.push('/')
    toast.success('Logged out')
    setIsLoggingOut(false)
  }

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string
    icon: React.ElementType
    label: string
  }) => {
    const isActive = pathname === href
    const content = (
      <Link
        href={href}
        onClick={onClose}
        className={`
          group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150
          ${isActive
            ? 'bg-indigo-500/10 text-indigo-400'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }
          ${collapsed ? 'justify-center px-0 w-9 mx-auto' : ''}
        `}
      >
        <Icon className={`flex-shrink-0 h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} />
        {!collapsed && <span>{label}</span>}
        {!collapsed && isActive && (
          <motion.div layoutId="nav-active" className="ml-auto h-1 w-1 rounded-full bg-indigo-400" />
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
        </Tooltip>
      )
    }
    return content
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 h-14 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 flex-shrink-0 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-400">DS</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-sm text-zinc-200 truncate">DSA Sheet</span>
            )}
          </Link>
        </div>

        {/* Search / command trigger */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 w-full rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2 text-sm text-zinc-500 hover:text-zinc-400 hover:bg-white/5 transition-all"
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="flex-1 text-left text-xs">Search...</span>
              <kbd className="text-[10px] bg-white/5 border border-white/8 rounded px-1 py-0.5">⌘K</kbd>
            </button>
          </div>
        )}

        {collapsed && (
          <div className="px-2 pt-3 pb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCommandOpen(true)}
                  className="flex items-center justify-center w-9 h-9 mx-auto rounded-xl border border-white/6 bg-white/[0.03] text-zinc-500 hover:text-zinc-400 hover:bg-white/5 transition-all"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Search (⌘K)</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Main nav */}
        <nav className={`px-2 pt-2 space-y-0.5 ${collapsed ? 'px-0 flex flex-col items-center gap-0.5' : ''}`}>
          {MAIN_NAV.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Divider + Topics */}
        <div className={`mt-4 ${collapsed ? '' : 'px-3'}`}>
          {!collapsed && (
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2.5 mb-2">
              Topics
            </p>
          )}
          <div className={`space-y-0.5 ${collapsed ? 'flex flex-col items-center gap-0.5 px-0' : ''}`}>
            {isLoading && !collapsed && <SidebarTopicSkeleton />}
            {topics?.map((topic) => {
              const isActive = pathname === `/sheet/${topic.slug}`
              const config   = TOPIC_CONFIG[topic.slug] || { icon: BookOpen, color: 'text-zinc-400', bg: 'bg-zinc-500/10' }
              const Icon     = config.icon

              const content = (
                <Link
                  href={`/sheet/${topic.slug}`}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all duration-200 group/item
                    ${isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }
                    ${collapsed ? 'justify-center px-0 w-10 mx-auto' : ''}
                  `}
                >
                  <div className={`
                    flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110
                    ${isActive ? 'bg-indigo-500/20' : config.bg}
                  `}>
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : config.color}`} />
                  </div>
                  {!collapsed && (
                    <span className="truncate font-medium text-xs tracking-tight">{topic.title}</span>
                  )}
                  {!collapsed && isActive && (
                    <motion.div layoutId="topic-active" className="ml-auto h-1 w-1 rounded-full bg-indigo-400" />
                  )}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={topic._id}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">{topic.title}</TooltipContent>
                  </Tooltip>
                )
              }
              return <div key={topic._id}>{content}</div>
            })}
          </div>
        </div>

        <div className="flex-1" />

        {/* Profile section */}
        {user && (
          <div className={`border-t border-white/5 p-2 ${collapsed ? 'flex flex-col items-center gap-1' : ''}`}>
            {!collapsed ? (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-all group">
                <div className="h-7 w-7 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-300 flex-shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-300 truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-600 truncate">{user.xp} XP</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300"
                >
                  {isLoggingOut
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <LogOut className="h-3.5 w-3.5" />
                  }
                </button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all"
                  >
                    {user.name[0].toUpperCase()}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {user.name} · {user.xp} XP
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// ─── Main Sidebar component ───────────────────────────────────────────────────

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="hidden lg:flex flex-col sticky top-0 h-screen border-r border-white/5 bg-[#09090b] overflow-hidden flex-shrink-0 z-30"
      >
        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCollapsed}
          className="absolute bottom-20 -right-3 z-40 h-6 w-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all shadow-xl hover:scale-110 active:scale-95"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3 w-3" />
            : <ChevronLeft  className="h-3 w-3" />
          }
        </button>
      </motion.aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[220px] bg-[#0c0c0e] border-r border-white/5 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent collapsed={false} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
