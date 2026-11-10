import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { setAuthFailureHandler } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import type { AuthUser, Role } from '@/shared/types'
import * as authApi from './api'
import { AuthContext, ME_KEY, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const me = useQuery<AuthUser | null>({
    queryKey: ME_KEY,
    queryFn: async ({ signal }) => {
      try {
        return await authApi.getMe(signal)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const resetSession = useCallback(() => {
    queryClient.cancelQueries()
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== ME_KEY[0] })
    queryClient.setQueryData(ME_KEY, null)
  }, [queryClient])

  useEffect(() => {
    setAuthFailureHandler(resetSession)
    return () => setAuthFailureHandler(null)
  }, [resetSession])

  const login = useCallback(
    async (input: authApi.LoginInput) => {
      await authApi.login(input)
      const user = await authApi.getMe()
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== ME_KEY[0] })
      queryClient.setQueryData(ME_KEY, user)
      return user
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined)
    resetSession()
  }, [resetSession])

  const user = me.data ?? null
  const status: AuthState['status'] = me.isPending
    ? 'loading'
    : me.isError
      ? 'error'
      : user
        ? 'authenticated'
        : 'anonymous'

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      error: me.error,
      login,
      logout,
      retry: () => void me.refetch(),
      hasRole: (...roles: Role[]) => !!user && roles.includes(user.role.roleName),
    }),
    [status, user, me, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
