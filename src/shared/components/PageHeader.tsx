import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between lg:pb-8">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold lg:text-3xl">{title}</h1>
        {description && <div className="text-base text-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  )
}
