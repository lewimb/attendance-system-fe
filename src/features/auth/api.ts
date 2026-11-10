import { http } from '@/shared/api/client'
import type { AuthUser } from '@/shared/types'

export interface LoginInput {
  email: string
  password: string
}

export async function login(input: LoginInput): Promise<void> {
  await http.post<unknown>('/auth/login', input)
}

export async function logout(): Promise<void> {
  await http.post<unknown>('/auth/logout')
}

export function getMe(signal?: AbortSignal): Promise<AuthUser> {
  return http.get<AuthUser>('/auth/me', { signal })
}
