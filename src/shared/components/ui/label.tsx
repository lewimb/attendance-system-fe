import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label data-slot="label" className={cn('text-sm font-medium text-ink select-none', className)} {...props} />
}

export { Label }
