import { apiClient } from './client'
import type { ApiResponse, BackendUser } from '@/types/api'

export interface UpdateProfilePayload {
  name?: string
  avatar?: string
}

export async function getUserProfile(): Promise<BackendUser> {
  const { data } = await apiClient.get<ApiResponse<{ user: BackendUser }>>('/users/profile')
  return data.data.user
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<BackendUser> {
  const { data } = await apiClient.patch<ApiResponse<{ user: BackendUser }>>('/users/profile', payload)
  return data.data.user
}
