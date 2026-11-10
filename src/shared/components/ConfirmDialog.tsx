import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: ReactNode
  description: ReactNode
  confirmLabel: string
  busyLabel?: string
  tone?: 'primary' | 'danger'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busyLabel,
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      role="alertdialog"
      busy={busy}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
            className="max-sm:w-full"
            autoFocus={tone === 'danger'}
          >
            Cancel
          </Button>
          <Button
            variant={tone}
            onClick={onConfirm}
            loading={busy}
            loadingLabel={busyLabel}
            className="max-sm:w-full"
            autoFocus={tone !== 'danger'}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
