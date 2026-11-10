import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'md' | 'sm'

interface StyleProps {
  variant?: Variant
  size?: Size
  block?: boolean
  tone?: 'danger' | 'danger-quiet'
}

function buttonClass({ variant = 'secondary', size = 'md', block, tone }: StyleProps, extra?: string) {
  return cn(
    'btn',
    `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    tone === 'danger' && 'btn--danger-text',
    tone === 'danger-quiet' && 'btn--danger-quiet',
    extra,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  loading?: boolean
  loadingLabel?: string
  icon?: ReactNode
}

export function Button({
  variant,
  size,
  block,
  tone,
  loading = false,
  loadingLabel,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, tone }, className)}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  )
}

interface ButtonLinkProps extends LinkProps, StyleProps {
  icon?: ReactNode
}

export function ButtonLink({ variant, size, block, tone, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, block, tone }, className)} {...rest}>
      {icon}
      <span>{children}</span>
    </Link>
  )
}
