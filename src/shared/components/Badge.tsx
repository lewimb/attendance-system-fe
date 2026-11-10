import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export type BadgeTone = 'ok' | 'warn' | 'neutral' | 'danger' | 'action'

const TONES: Record<BadgeTone, string> = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  neutral: 'bg-neutral-soft text-muted',
  danger: 'bg-danger-soft text-danger',
  action: 'bg-action-soft text-action-text',
}

export function Badge({
  tone,
  icon,
  children,
  className,
}: {
  tone: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-label font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
