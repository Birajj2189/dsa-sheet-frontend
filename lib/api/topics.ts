import { apiClient } from './client'
import type { ApiResponse, BackendTopic } from '@/types/api'

export async function getTopics(): Promise<BackendTopic[]> {
  const { data } = await apiClient.get<ApiResponse<{ topics: BackendTopic[]; count: number }>>('/topics')
  return data.data.topics
}

export async function getTopicBySlug(slug: string): Promise<BackendTopic> {
  const { data } = await apiClient.get<ApiResponse<{ topic: BackendTopic }>>(`/topics/${slug}`)
  return data.data.topic
}
