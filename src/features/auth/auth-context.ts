import { createContext, useContext } from 'react'
import type { AuthUser, Role } from '@/shared/types'
import type { LoginInput } from './api'

export const ME_KEY = ['auth', 'me'] as const

export type AuthStatus ='loading' | 'authenticated' | 'anonymous' | 'error'

export interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: unknown
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => Promise<void>
  retry: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function useCurrentUser(): AuthUser {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser needs a logged-in user')
  return user
}
