import { Pencil, UserX, Users } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import { Button, ButtonLink } from '@/shared/components/Button'
import { DataTable, type Column, type SortOrder } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/States'
import { ROLE_LABELS, type Department, type EmployeeWithRole } from '@/shared/types'
import type { EmployeeSortField } from '../types'

interface EmployeeTableProps {
  rows: EmployeeWithRole[] | undefined
  status: 'pending' | 'error' | 'success'
  error?: unknown
  onRetry: () => void
  retrying?: boolean
  fetching?: boolean
  departments: Department[] | undefined
  currentUserId: string
  sort: { by: EmployeeSortField; order: SortOrder }
  onSort: (field: EmployeeSortField) => void
  onDeactivate: (employee: EmployeeWithRole) => void
  filtered: boolean
}

export function EmployeeStatusBadge({ active }: { active: boolean }) {
  return active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Inactive</Badge>
}

function YouTag() {
  return <Badge tone="action">You</Badge>
}

export function EmployeeTable({
  rows,
  status,
  error,
  onRetry,
  retrying,
  fetching,
  departments,
  currentUserId,
  sort,
  onSort,
  onDeactivate,
  filtered,
}: EmployeeTableProps) {
  const departmentName = (id: number) => departments?.find((d) => d.id === id)?.name ?? '—'
  const actions = (employee: EmployeeWithRole, compact?: boolean) => (
    <EmployeeActions employee={employee} isSelf={employee.id === currentUserId} onDeactivate={onDeactivate} compact={compact} />
  )

  const columns: Column<EmployeeWithRole>[] = [
    {
      key: 'code',
      header: 'Code',
      sortField: 'employeeCode',
      cell: (e) => <span className="font-mono text-sm whitespace-nowrap">{e.employeeCode}</span>,
      skeleton: 'w-16',
    },
    {
      key: 'name',
      header: 'Name',
      sortField: 'fullName',
      cell: (e) => (
        <span className="flex items-center gap-2 font-medium whitespace-nowrap">
          {e.fullName}
          {e.id === currentUserId && <YouTag />}
        </span>
      ),
      skeleton: 'w-32',
    },
    {
      key: 'email',
      header: 'Email',
      sortField: 'email',
      cell: (e) => (
        <span className="block max-w-55 truncate text-muted" title={e.email}>
          {e.email}
        </span>
      ),
      skeleton: 'w-40',
    },
    { key: 'dept', header: 'Department', cell: (e) => departmentName(e.departmentId), className: 'whitespace-nowrap', skeleton: 'w-24' },
    { key: 'role', header: 'Role', cell: (e) => ROLE_LABELS[e.role.roleName], className: 'whitespace-nowrap', skeleton: 'w-16' },
    { key: 'status', header: 'Status', cell: (e) => <EmployeeStatusBadge active={e.isActive} />, skeleton: 'w-16' },
    { key: 'actions', header: 'Actions', cell: (e) => actions(e), className: 'w-px', skeleton: 'w-40' },
  ]

  return (
    <DataTable
      caption="Employees"
      columns={columns}
      rows={rows}
      rowKey={(e) => e.id}
      status={status}
      error={error}
      onRetry={onRetry}
      retrying={retrying}
      fetching={fetching}
      sort={sort}
      onSort={(field) => onSort(field as EmployeeSortField)}
      tableFrom="lg"
      empty={
        <EmptyState
          icon={<Users size={22} />}
          title={filtered ? 'No employees match these filters.' : 'No employees yet.'}
          body={filtered ? 'Try another name, department or status.' : 'Add the first employee to give them a login.'}
        />
      }
      renderCard={(e) => (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{e.fullName}</span>
                {e.id === currentUserId && <YouTag />}
              </p>
              <p className="text-sm text-muted">
                <span className="font-mono">{e.employeeCode}</span> · {departmentName(e.departmentId)} ·{' '}
                {ROLE_LABELS[e.role.roleName]}
              </p>
              <p className="truncate text-sm text-muted">{e.email}</p>
            </div>
            <EmployeeStatusBadge active={e.isActive} />
          </div>
          {actions(e, true)}
        </div>
      )}
    />
  )
}

function EmployeeActions({
  employee,
  isSelf,
  onDeactivate,
  compact,
}: {
  employee: EmployeeWithRole
  isSelf: boolean
  onDeactivate: (employee: EmployeeWithRole) => void
  compact?: boolean
}) {
  const size = compact ? 'md' : 'sm'
  return (
    <div className="flex gap-2">
      <ButtonLink
        to={`/hr/employees/${employee.id}/edit`}
        size={size}
        aria-label={`Edit ${employee.fullName}`}
        icon={<Pencil size={14} aria-hidden="true" />}
        className={compact ? 'flex-1' : undefined}
      >
        Edit
      </ButtonLink>
      {employee.isActive && (
        <Button
          size={size}
          variant="ghost"
          tone="danger-quiet"
          onClick={() => onDeactivate(employee)}
          disabled={isSelf}
          title={isSelf ? "You can't deactivate your own account." : undefined}
          aria-label={`Deactivate ${employee.fullName}`}
          icon={<UserX size={14} aria-hidden="true" />}
          className={compact ? 'flex-1' : undefined}
        >
          Deactivate
        </Button>
      )}
    </div>
  )
}
