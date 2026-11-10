import { cn } from '@/shared/lib/utils'

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('animate-spin-1s shrink-0', className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function PageSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[50vh] items-center justify-center gap-3 text-muted">
      <Spinner size={20} />
      <span className="text-sm">{label}</span>
    </div>
  )
}
