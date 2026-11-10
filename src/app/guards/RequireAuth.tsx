import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth'
import { PageSpinner } from '@/shared/components/Spinner'
import { ServerUnreachablePage } from '@/pages/ErrorPages'

export function RequireAuth() {
  const { status, error, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageSpinner label="Checking your session" />
  if (status === 'error') return <ServerUnreachablePage error={error} onRetry={retry} />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function RedirectIfAuthenticated() {
  const { status } = useAuth()
  if (status === 'loading') return <PageSpinner label="Checking your session" />
  if (status === 'authenticated') return <Navigate to="/today" replace />
  return <Outlet />
}
