import type { ReactNode } from 'react'
import { CloudOff, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { friendlyMessage } from '@/shared/api/errors'
import { Button } from './Button'

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  body?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-neutral-soft text-muted" aria-hidden="true">
        {icon}
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        {body && <p className="text-base text-muted">{body}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({
  error,
  title = "Couldn't load this",
  onRetry,
  retrying,
  className,
}: {
  error: unknown
  title?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger" aria-hidden="true">
        <CloudOff size={22} />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-base text-muted">{friendlyMessage(error)}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button onClick={onRetry} loading={retrying} loadingLabel="Retrying" icon={<RefreshCw size={16} aria-hidden="true" />}>
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block animate-skeleton rounded-control bg-neutral-soft', className)} />
}
