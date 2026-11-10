import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <Outlet />
    </main>
  )
}
