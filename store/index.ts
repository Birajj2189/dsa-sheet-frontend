import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BackendUser } from '@/types/api'

// ─── Auth Store (persisted) ───────────────────────────────────────────────────

interface AuthStore {
  user: BackendUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (user: BackendUser) => void
  logout: () => void
  updateUser: (user: Partial<BackendUser>) => void
  setHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'dsa-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIStore {
  /** Mobile drawer open/close */
  sidebarOpen: boolean
  /** Desktop collapsed (icon-only) / expanded */
  sidebarCollapsed: boolean
  /** Command palette open */
  commandOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setCommandOpen: (open: boolean) => void
  toggleCommand: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      commandOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandOpen: (open) => set({ commandOpen: open }),
      toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),
    }),
    {
      name: 'dsa-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)

// ─── Progress store shim (kept for backward compat; real state in React Query) ─

interface ProgressStore {
  solvedProblems: Set<string>
  bookmarkedProblems: Set<string>
  toggleSolved: (problemId: string) => void
  toggleBookmarked: (problemId: string) => void
  markSolved: (problemId: string) => void
  getSolveCount: () => number
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  solvedProblems: new Set(),
  bookmarkedProblems: new Set(),
  toggleSolved: (id) =>
    set((s) => {
      const n = new Set(s.solvedProblems)
      n.has(id) ? n.delete(id) : n.add(id)
      return { solvedProblems: n }
    }),
  toggleBookmarked: (id) =>
    set((s) => {
      const n = new Set(s.bookmarkedProblems)
      n.has(id) ? n.delete(id) : n.add(id)
      return { bookmarkedProblems: n }
    }),
  markSolved: (id) =>
    set((s) => {
      const n = new Set(s.solvedProblems)
      n.add(id)
      return { solvedProblems: n }
    }),
  getSolveCount: () => get().solvedProblems.size,
}))
