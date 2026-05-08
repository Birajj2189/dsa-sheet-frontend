// ─── Generic API wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors: ApiErrorDetail[]
}

// ─── Backend model types (mirrors backend schema) ────────────────────────────

export interface BackendUser {
  _id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  streak: number
  xp: number
  lastActiveDate?: string
  createdAt: string
  updatedAt: string
}

export interface BackendTopic {
  _id: string
  title: string
  slug: string
  description?: string
  icon?: string
  order: number
  progressWeight: number
  isActive: boolean
  createdAt: string
}

export interface BackendSubtopic {
  _id: string
  title: string
  slug: string
  topicId: string
  description?: string
  articleLink?: string
  order: number
}

export type BackendDifficulty = 'easy' | 'medium' | 'hard'

export interface BackendProblem {
  _id: string
  title: string
  slug: string
  topicId: BackendTopic | string
  subtopicId?: BackendSubtopic | string
  difficulty: BackendDifficulty
  tags: string[]
  estimatedTime?: number
  leetcodeLink?: string
  codeforcesLink?: string
  articleLink?: string
  youtubeLink?: string
  description?: string
  order: number
  isActive: boolean
}

export interface BackendProgress {
  _id: string
  userId: string
  problemId: BackendProblem | string
  completed: boolean
  completedAt?: string
  bookmarked: boolean
  notes?: string
  updatedAt: string
  createdAt: string
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  problems: T[]
  total: number
  page: number
  totalPages: number
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface TopicCompletion {
  topicId: string
  title: string
  slug: string
  total: number
  completed: number
  percentage: number
}

export interface RecentlySolved {
  problemId: string
  title: string
  slug: string
  difficulty: string
  completedAt: string
}

export interface DashboardStatsResponse {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  totalProblems: number
  easyTotal: number
  mediumTotal: number
  hardTotal: number
  streak: number
  xp: number
  topicCompletion: TopicCompletion[]
  recentlySolved: RecentlySolved[]
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

/** Maps problemId → progress entry for O(1) lookups */
export type ProgressMap = Map<string, BackendProgress>
