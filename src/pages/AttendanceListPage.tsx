import { Eye } from 'lucide-react'
import { AllAttendanceTable, AttendanceFilters, useAllAttendance, type AttendanceStatus } from '@/features/attendance'
import { EMPLOYEE_SEARCH_KEY, searchEmployeeOptions, useDepartments, useEmployee } from '@/features/employees'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { parseId, parsePage, parseRange, useQueryParams } from '@/shared/hooks/useQueryParams'
import { PAGE_SIZE } from '@/shared/lib/constants'

const EMPLOYEE_SEARCH = { queryKey: EMPLOYEE_SEARCH_KEY, loadOptions: searchEmployeeOptions }

export function AttendanceListPage() {
  const { get, update } = useQueryParams()
  const { from, to } = parseRange(get('from'), get('to'))
  const page = parsePage(get('page'))
  const departmentId = parseId(get('department'))
  const employeeId = get('employee')
  const statusParam = get('status')
  const status: AttendanceStatus | undefined = statusParam === 'PRESENT' || statusParam === 'LATE' ? statusParam : undefined

  const departments = useDepartments()
  const selectedEmployee = useEmployee(employeeId)
  const employeeLabel = employeeId ? (selectedEmployee.data?.fullName ?? (selectedEmployee.isError ? 'Unknown employee' : '')) : undefined
  const query = useAllAttendance({ from, to, page, limit: PAGE_SIZE, departmentId, employeeId, status })

  return (
    <>
      <PageHeader
        title="All attendance"
        description={
          <span className="flex items-center gap-2">
            <Eye size={16} aria-hidden="true" className="shrink-0" />
            View only. Attendance can't be edited or deleted. Times are in WIB.
          </span>
        }
      />
      <AttendanceFilters
        key={[from, to, departmentId, employeeId, employeeLabel, status].join('|')}
        value={{ from, to, departmentId, employeeId, employeeLabel, status }}
        employeeSearch={EMPLOYEE_SEARCH}
        departments={departments.data?.map((d) => ({ value: d.id, label: d.name })) ?? []}
        showStatus
        onApply={(next) =>
          update({
            from: next.from,
            to: next.to,
            department: next.departmentId,
            employee: next.employeeId,
            status: next.status,
            page: undefined,
          })
        }
      />
      <AllAttendanceTable
        rows={query.data?.items}
        status={query.status}
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
        fetching={query.isPlaceholderData}
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
    </>
  )
}
