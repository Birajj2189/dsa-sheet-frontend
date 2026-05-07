import { apiClient } from './client'
import type { ApiResponse, BackendSubtopic } from '@/types/api'

export async function getSubtopicsByTopic(topicId: string): Promise<BackendSubtopic[]> {
  const { data } = await apiClient.get<ApiResponse<{ subtopics: BackendSubtopic[]; count: number }>>(
    `/subtopics/${topicId}`,
  )
  return data.data.subtopics
}
