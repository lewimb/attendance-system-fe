import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CircleCheck, CircleExclamationPoint, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToastContext, type ToastApi, type ToastTone } from './toast-context'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

const DURATION: Record<ToastTone, number> = { success: 5000, error: 8000 }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++
    setItems((list) => [...list.filter((t) => t.message !== message), { id, tone, message }].slice(-3))
  }, [])

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-[calc(--spacing(20)+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
        aria-live="polite"
      >
        {items.map((item) => (
          <Toast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(() => onDismiss(item.id), DURATION[item.tone])
    return () => window.clearTimeout(timer)
  }, [item.id, item.tone, onDismiss, paused])

  const Icon = item.tone === 'success' ? CircleCheck : CircleExclamationPoint
  return (
    <div
      role={item.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-105 glass-strong animate-toast-in items-start gap-3 rounded-panel py-3 pr-2 pl-4"
    >
      <Icon
        size={20}
        aria-hidden="true"
        className={cn('mt-0.5 shrink-0', item.tone === 'success' ? 'text-ok' : 'text-danger')}
      />
      <p className="flex-1 py-0.5 text-base">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="btn btn--ghost btn--sm -my-1 w-9 shrink-0 px-0"
        aria-label="Dismiss"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
