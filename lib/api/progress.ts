import { apiClient } from './client'
import type { ApiResponse, BackendProgress } from '@/types/api'

export async function getMyProgress(): Promise<BackendProgress[]> {
  const { data } = await apiClient.get<ApiResponse<{ progress: BackendProgress[]; count: number }>>(
    '/progress/me',
  )
  return data.data.progress
}

export async function toggleProgress(problemId: string): Promise<{
  progress: BackendProgress
  completed: boolean
}> {
  const { data } = await apiClient.post<ApiResponse<{ progress: BackendProgress; completed: boolean }>>(
    '/progress/toggle',
    { problemId },
  )
  return data.data
}

export async function updateNotes(problemId: string, notes: string): Promise<BackendProgress> {
  const { data } = await apiClient.patch<ApiResponse<{ progress: BackendProgress }>>(
    '/progress/notes',
    { problemId, notes },
  )
  return data.data.progress
}
