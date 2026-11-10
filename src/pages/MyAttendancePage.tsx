import { AttendanceFilters, MyAttendanceTable, useMyAttendance } from '@/features/attendance'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { parsePage, parseRange, useQueryParams } from '@/shared/hooks/useQueryParams'
import { PAGE_SIZE } from '@/shared/lib/constants'

export function MyAttendancePage() {
  const { get, update } = useQueryParams()
  const { from, to } = parseRange(get('from'), get('to'))
  const page = parsePage(get('page'))

  const query = useMyAttendance({ from, to, page, limit: PAGE_SIZE })

  return (
    <>
      <PageHeader title="My attendance" description="Your check-ins and check-outs. Times are in WIB." />
      <AttendanceFilters
        key={`${from}|${to}`}
        value={{ from, to }}
        onApply={(next) => update({ from: next.from, to: next.to, page: undefined })}
      />
      <MyAttendanceTable
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
