import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'
import { controlVariants, type ControlVariantProps } from './variants'

type InputProps = Omit<ComponentProps<'input'>, 'size'> & ControlVariantProps

function Input({ className, variant, size, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant ?? 'default'}
      className={cn(
        controlVariants({ variant, size }),
        variant !== 'line' && 'read-only:bg-sunken read-only:text-muted',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
