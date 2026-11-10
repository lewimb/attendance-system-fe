import { Outlet } from 'react-router'
import { useAuth } from '@/features/auth'
import { ForbiddenPage } from '@/pages/ErrorPages'
import type { Role } from '@/shared/types'

export function RequireRole({ roles }: { roles: Role[] }) {
  const { hasRole } = useAuth()
  return hasRole(...roles) ? <Outlet /> : <ForbiddenPage />
}
