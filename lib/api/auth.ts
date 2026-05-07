import { apiClient } from './client'
import type { ApiResponse, BackendUser, LoginPayload, RegisterPayload } from '@/types/api'

interface AuthData {
  user: BackendUser
}

export async function login(payload: LoginPayload): Promise<BackendUser> {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/login', payload)
  return data.data.user
}

export async function register(payload: RegisterPayload): Promise<BackendUser> {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/register', payload)
  return data.data.user
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<BackendUser> {
  const { data } = await apiClient.get<ApiResponse<AuthData>>('/auth/me')
  return data.data.user
}

export async function refreshToken(): Promise<void> {
  await apiClient.post('/auth/refresh')
}
