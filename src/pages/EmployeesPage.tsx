import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCurrentUser } from '@/features/auth'
import { DeactivateDialog, EmployeeTable, useDepartments, useEmployees, type EmployeeSortField } from '@/features/employees'
import { ButtonLink } from '@/shared/components/Button'
import { SelectField } from '@/shared/components/Field'
import { SearchField } from '@/shared/components/SearchField'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { parseId, parsePage, useQueryParams } from '@/shared/hooks/useQueryParams'
import { PAGE_SIZE } from '@/shared/lib/constants'
import type { EmployeeWithRole } from '@/shared/types'

const SORT_FIELDS: EmployeeSortField[] = ['employeeCode', 'fullName', 'email', 'createdAt', 'id']

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function EmployeesPage() {
  const user = useCurrentUser()
  const { get, update } = useQueryParams()
  const [toDeactivate, setToDeactivate] = useState<EmployeeWithRole | null>(null)

  const page = parsePage(get('page'))
  const departmentId = parseId(get('department'))
  const statusParam = get('status')
  const status = statusParam === 'active' || statusParam === 'inactive' ? statusParam : undefined
  const sortParam = get('sort') as EmployeeSortField | undefined
  const sortBy: EmployeeSortField = sortParam && SORT_FIELDS.includes(sortParam) ? sortParam : 'fullName'
  const order = get('order') === 'desc' ? 'desc' : 'asc'
  const search = get('q')?.trim().slice(0, 100) ?? ''

  const departments = useDepartments()
  const query = useEmployees({
    page,
    limit: PAGE_SIZE,
    sortBy,
    order,
    departmentId,
    isActive: status === undefined ? undefined : status === 'active',
    search: search || undefined,
  })

  function onSort(field: EmployeeSortField) {
    const nextOrder = field === sortBy && order === 'asc' ? 'desc' : 'asc'
    update({ sort: field === 'fullName' ? undefined : field, order: nextOrder === 'asc' ? undefined : 'desc', page: undefined })
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description="Accounts for everyone who checks in. Only HR can add or change them."
        actions={
          <ButtonLink to="/hr/employees/new" variant="primary" icon={<Plus size={18} aria-hidden="true" />} className="max-sm:w-full">
            Add employee
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-3 pb-6 sm:gap-4 lg:flex lg:flex-wrap" role="group" aria-label="Filters">
        <SearchField
          label="Name"
          placeholder="Search by name"
          value={search}
          onSearch={(next) => update({ q: next, page: undefined })}
          className="col-span-2 lg:w-80"
        />
        <SelectField
          label="Department"
          value={departmentId === undefined ? '' : String(departmentId)}
          onValueChange={(next) => update({ department: next, page: undefined })}
          emptyLabel="All departments"
          options={departments.data?.map((d) => ({ value: String(d.id), label: d.name })) ?? []}
          className="lg:w-60"
        />
        <SelectField
          label="Status"
          value={status ?? ''}
          onValueChange={(next) => update({ status: next, page: undefined })}
          emptyLabel="All"
          options={STATUS_OPTIONS}
          className="lg:w-50"
        />
      </div>

      <EmployeeTable
        rows={query.data?.items}
        status={query.status}
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
        fetching={query.isPlaceholderData}
        departments={departments.data}
        currentUserId={user.id}
        sort={{ by: sortBy, order }}
        onSort={onSort}
        onDeactivate={setToDeactivate}
        filtered={departmentId !== undefined || status !== undefined || search !== ''}
      />
      {query.data && (
        <Pagination
          page={page}
          limit={query.data.limit}
          total={query.data.total}
          onPageChange={(next) => update({ page: next > 1 ? next : undefined })}
          disabled={query.isPlaceholderData}
        />
      )}

      <DeactivateDialog employee={toDeactivate} onClose={() => setToDeactivate(null)} />
    </>
  )
}
