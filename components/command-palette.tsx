'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useUIStore } from '@/store'
import { getTopics } from '@/lib/api/topics'
import { queryKeys } from '@/lib/query-keys'
import {
  LayoutDashboard,
  User,
  BookOpen,
  LogIn,
  BarChart2,
} from 'lucide-react'

const STATIC_ACTIONS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'profile',   label: 'Go to Profile',   icon: User,           href: '/profile'   },
  { id: 'home',      label: 'Go to Home',       icon: BookOpen,       href: '/'          },
]

const TOPIC_ICON_MAP: Record<string, string> = {
  arrays: '📊',
  strings: '🔤',
  'linked-lists': '🔗',
  'stacks-queues': '📚',
  trees: '🌳',
  graphs: '🕸️',
  'dynamic-programming': '⚡',
  backtracking: '🔄',
}

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUIStore()
  const router = useRouter()

  const { data: topics } = useQuery({
    queryKey: queryKeys.topics.all(),
    queryFn: getTopics,
    staleTime: 30 * 60_000,
  })

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandOpen])

  const runAction = useCallback(
    (href: string) => {
      setCommandOpen(false)
      router.push(href)
    },
    [router, setCommandOpen],
  )

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Search topics, navigate, or type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {STATIC_ACTIONS.map((action) => (
            <CommandItem
              key={action.id}
              value={action.label}
              onSelect={() => runAction(action.href)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4 text-zinc-400" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {topics && topics.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Topics">
              {topics.map((t) => (
                <CommandItem
                  key={t._id}
                  value={t.title}
                  onSelect={() => runAction(`/sheet/${t.slug}`)}
                  className="gap-2"
                >
                  <span className="text-sm">{TOPIC_ICON_MAP[t.slug] ?? '📖'}</span>
                  <span>{t.title}</span>
                  <span className="ml-auto text-xs text-zinc-500">Topic</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
