import type { ProblemFilters } from './api/problems'

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  topics: {
    all: () => ['topics'] as const,
    bySlug: (slug: string) => ['topics', slug] as const,
  },
  subtopics: {
    byTopic: (topicId: string) => ['subtopics', topicId] as const,
  },
  problems: {
    all: (filters?: ProblemFilters) => ['problems', filters] as const,
    byTopic: (topicId: string, filters?: ProblemFilters) =>
      ['problems', 'topic', topicId, filters] as const,
    bySlug: (slug: string) => ['problems', 'slug', slug] as const,
  },
  progress: {
    me: () => ['progress', 'me'] as const,
  },
  bookmarks: {
    me: () => ['bookmarks', 'me'] as const,
  },
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
  },
  user: {
    profile: () => ['user', 'profile'] as const,
  },
} as const
