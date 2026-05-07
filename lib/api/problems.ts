import { apiClient } from './client'
import type { ApiResponse, BackendProblem, PaginatedResponse } from '@/types/api'

export interface ProblemFilters {
  page?: number
  limit?: number
  difficulty?: string
  tags?: string
}

export async function getProblems(filters?: ProblemFilters): Promise<PaginatedResponse<BackendProblem>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<BackendProblem>>>('/problems', {
    params: filters,
  })
  return data.data
}

export async function getProblemBySlug(slug: string): Promise<BackendProblem> {
  const { data } = await apiClient.get<ApiResponse<{ problem: BackendProblem }>>(`/problems/${slug}`)
  return data.data.problem
}

export async function getProblemsByTopic(
  topicId: string,
  filters?: ProblemFilters,
): Promise<PaginatedResponse<BackendProblem>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<BackendProblem>>>(
    `/problems/topic/${topicId}`,
    { params: filters },
  )
  return data.data
}
