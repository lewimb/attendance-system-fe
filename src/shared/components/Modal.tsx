import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  role?: 'dialog' | 'alertdialog'
  busy?: boolean
}

const SIZES = {
  sm: 'w-[calc(100vw-2rem)] max-w-110',
  md: 'w-[calc(100vw-2rem)] max-w-140',
  lg: 'w-[calc(100vw-2rem)] max-w-220',
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', role = 'dialog', busy }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      {open && (
        <div className={cn('modal__panel glass-strong rounded-card', SIZES[size])}>
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 id={titleId} className="text-xl font-semibold">
                {title}
              </h2>
              {description && (
                <div id={descId} className="text-base text-muted">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn btn--ghost -mt-2 -mr-3 w-11 shrink-0 px-0"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {children && <div className="px-6 pt-4">{children}</div>}
          {footer ? (
            <div className="flex flex-col-reverse gap-3 px-6 pt-6 pb-6 sm:flex-row sm:justify-end">{footer}</div>
          ) : (
            <div className="pb-6" />
          )}
        </div>
      )}
    </dialog>
  )
}
