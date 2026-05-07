export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinedDate: Date
  totalSolved: number
  xp: number
  streak: number
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  solved: boolean
  bookmarked: boolean
  tags: string[]
  estimatedTime: number
  leetcodeLink?: string
  codeforcesLink?: string
  articleLink?: string
  youtubeLink?: string
  notes?: string
}

export interface SubTopic {
  id: string
  title: string
  problems: Problem[]
  progress: number
}

export interface Topic {
  id: string
  title: string
  description: string
  icon: string
  subtopics: SubTopic[]
  progress: number
  completed: number
}

export interface DashboardStats {
  totalProgress: number
  problemsSolved: number
  topicsCompleted: number
  dailyStreak: number
  easyCount: number
  mediumCount: number
  hardCount: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedDate?: Date
  points: number
}
