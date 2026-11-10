import type { ComponentType } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { CalendarCheck, CalendarDays, ClipboardList, LogOut, Moon, Sun, Users } from 'lucide-react'
import { useAuth, useCurrentUser } from '@/features/auth'
import { Badge } from '@/shared/components/Badge'
import { useTheme } from '@/shared/hooks/useTheme'
import { PRODUCT_NAME } from '@/shared/lib/constants'
import { firstName } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { ROLE_LABELS, type Role } from '@/shared/types'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' }>
  end?: boolean
}

const EMPLOYEE_NAV: NavItem[] = [
  { to: '/today', label: 'Today', icon: CalendarCheck, end: true },
  { to: '/attendance/me', label: 'My attendance', icon: CalendarDays },
]

const HR_NAV: NavItem[] = [
  { to: '/hr/employees', label: 'Employees', icon: Users },
  { to: '/hr/attendance', label: 'All attendance', icon: ClipboardList },
]

export function AppLayout() {
  const user = useCurrentUser()
  const isHr = user.role.roleName === 'HR_ADMIN'

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-4 py-3 font-medium shadow-(--shadow-pop) focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <TopBar fullName={user.fullName} role={user.role.roleName} />

      <div className="flex flex-1">
        <aside className="glass-bar hidden w-62 shrink-0 border-r border-line lg:block">
          <nav aria-label="Main" className="sticky top-16 flex flex-col gap-6 px-4 py-6">
            <ul className="flex flex-col gap-1">
              {EMPLOYEE_NAV.map((item) => (
                <SideItem key={item.to} item={item} />
              ))}
            </ul>
            {isHr && (
              <div className="flex flex-col gap-2">
                <p className="px-3 text-label font-medium text-muted" id="nav-hr">
                  HR admin
                </p>
                <ul className="flex flex-col gap-1" aria-labelledby="nav-hr">
                  {HR_NAV.map((item) => (
                    <SideItem key={item.to} item={item} />
                  ))}
                </ul>
              </div>
            )}
          </nav>
        </aside>

        <main
          id="main"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 pt-6 pb-[calc(--spacing(24)+env(safe-area-inset-bottom))] outline-none sm:px-6 lg:px-10 lg:pt-10 lg:pb-16"
        >
          <div className="mx-auto w-full max-w-280">
            <Outlet />
          </div>
        </main>
      </div>

      <nav
        aria-label="Main"
        className="glass-bar fixed inset-x-0 bottom-0 z-30 border-t border-line pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="flex">
          {[...EMPLOYEE_NAV, ...(isHr ? HR_NAV : [])].map((item) => (
            <TabItem key={item.to} item={item} />
          ))}
        </ul>
      </nav>
    </div>
  )
}

function TopBar({ fullName, role }: { fullName: string; role: Role }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  async function onLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="glass-bar sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line px-4 sm:px-6 lg:h-16">
      <Link
        to="/today"
        className="-ml-1 shrink-0 rounded-control px-1 py-1 text-base font-semibold tracking-tight whitespace-nowrap sm:text-lg"
      >
        {PRODUCT_NAME}
      </Link>

      <div className="flex min-w-0 items-center gap-1 sm:gap-3">
        <p className="flex min-w-0 items-center gap-2 pr-1 sm:pr-2">
          <span className="truncate text-sm font-medium">
            <span className="sm:hidden">{firstName(fullName)}</span>
            <span className="hidden sm:inline">{fullName}</span>
          </span>
          <Badge tone={role === 'HR_ADMIN' ? 'action' : 'neutral'}>{ROLE_LABELS[role]}</Badge>
        </p>
        <button
          type="button"
          onClick={toggle}
          className="btn btn--ghost w-11 shrink-0 px-0 text-muted lg:size-10"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="btn btn--ghost w-11 shrink-0 px-0 sm:hidden"
          aria-label="Log out"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="btn btn--secondary btn--sm hidden shrink-0 sm:inline-flex lg:h-10"
        >
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </header>
  )
}

function SideItem({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'flex h-11 items-center gap-3 rounded-control px-3 text-base font-medium transition-colors duration-150',
            isActive ? 'bg-action-soft text-action-text' : 'text-muted hover:bg-neutral-soft hover:text-ink',
          )
        }
      >
        <Icon size={18} aria-hidden="true" />
        {item.label}
      </NavLink>
    </li>
  )
}

function TabItem({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <li className="flex-1">
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'relative flex h-16 flex-col items-center justify-center gap-1 px-1 text-label font-medium transition-colors duration-150',
            isActive
              ? 'text-action-text before:absolute before:inset-x-5 before:top-0 before:h-0.5 before:rounded-full before:bg-action'
              : 'text-muted',
          )
        }
      >
        <Icon size={20} aria-hidden="true" />
        <span className="text-center leading-tight">{item.label}</span>
      </NavLink>
    </li>
  )
}
