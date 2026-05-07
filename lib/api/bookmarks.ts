import { apiClient } from './client'
import type { ApiResponse, BackendProgress } from '@/types/api'

export async function getMyBookmarks(): Promise<BackendProgress[]> {
  const { data } = await apiClient.get<ApiResponse<{ bookmarks: BackendProgress[]; count: number }>>(
    '/bookmarks/me',
  )
  return data.data.bookmarks
}

export async function toggleBookmark(problemId: string): Promise<{
  progress: BackendProgress
  bookmarked: boolean
}> {
  const { data } = await apiClient.post<ApiResponse<{ progress: BackendProgress; bookmarked: boolean }>>(
    '/bookmarks/toggle',
    { problemId },
  )
  return data.data
}
