import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function writeStored(theme: Theme): boolean {
  try {
    localStorage.setItem(KEY, theme)
    return true
  } catch {
    return false
  }
}

function current(): Theme {
  const attr = document.documentElement.dataset.theme
  if (attr === 'light' || attr === 'dark') return attr
  return media().matches ? 'dark' : 'light'
}

const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  const mq = media()
  mq.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    mq.removeEventListener('change', listener)
  }
}

export function applyStoredTheme(): void {
  const stored = readStored()
  if (stored) document.documentElement.dataset.theme = stored
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as Theme)
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next
    writeStored(next)
    listeners.forEach((l) => l())
  }, [])
  return { theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}
