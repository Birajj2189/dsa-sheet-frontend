import { apiClient } from './client'
import type { ApiResponse, DashboardStatsResponse } from '@/types/api'

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const { data } = await apiClient.get<ApiResponse<{ stats: DashboardStatsResponse }>>(
    '/dashboard/stats',
  )
  return data.data.stats
}
