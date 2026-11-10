import { friendlyMessage } from '@/shared/api/errors'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useToast } from '@/shared/components/toast-context'
import { firstName } from '@/shared/lib/format'
import type { EmployeeWithRole } from '@/shared/types'
import { useDeactivateEmployee } from '../queries'

export function DeactivateDialog({ employee, onClose }: { employee: EmployeeWithRole | null; onClose: () => void }) {
  const deactivate = useDeactivateEmployee()
  const toast = useToast()

  function confirm() {
    if (!employee) return
    deactivate.mutate(employee.id, {
      onSuccess: () => {
        toast.success(`${employee.fullName} is deactivated.`)
        onClose()
      },
      onError: (error) => {
        toast.error(friendlyMessage(error))
        onClose()
      },
    })
  }

  return (
    <ConfirmDialog
      open={!!employee}
      tone="danger"
      title={employee ? `Deactivate ${employee.fullName}?` : ''}
      description={
        employee
          ? `${firstName(employee.fullName)} will no longer be able to log in. This can't be undone from this screen.`
          : ''
      }
      confirmLabel="Deactivate employee"
      busyLabel="Deactivating"
      busy={deactivate.isPending}
      onConfirm={confirm}
      onCancel={onClose}
    />
  )
}
