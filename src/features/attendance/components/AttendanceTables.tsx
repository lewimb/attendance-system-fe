import { CalendarX } from 'lucide-react'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/States'
import { BUSINESS_TZ_LABEL } from '@/shared/lib/constants'
import { formatTime, formatTimeWithZone, formatWorkDate } from '@/shared/lib/dates'
import type { Attendance, HrAttendance } from '../types'
import { PhotoThumb } from './AttendancePhoto'
import { NotCheckedOutBadge, StatusBadge } from './StatusBadge'

interface ListProps<T> {
  rows: T[] | undefined
  status: 'pending' | 'error' | 'success'
  error?: unknown
  onRetry: () => void
  retrying?: boolean
  fetching?: boolean
}

function Time({ iso }: { iso: string }) {
  return (
    <span className="tabular">
      {formatTime(iso)} <span className="text-sm text-muted">{BUSINESS_TZ_LABEL}</span>
    </span>
  )
}

function CheckOutCell({ iso }: { iso: string | null }) {
  return iso ? <Time iso={iso} /> : <NotCheckedOutBadge />
}

const emptyRange = (
  <EmptyState
    icon={<CalendarX size={22} />}
    title="No attendance in this range."
    body="Pick other dates to see more."
  />
)

export function MyAttendanceTable({ rows, status, error, onRetry, retrying, fetching }: ListProps<Attendance>) {
  const columns: Column<Attendance>[] = [
    { key: 'date', header: 'Date', cell: (r) => <span className="font-medium">{formatWorkDate(r.workDate)}</span>, skeleton: 'w-28' },
    { key: 'in', header: 'Check-in', cell: (r) => <Time iso={r.checkInAt} />, skeleton: 'w-20' },
    { key: 'out', header: 'Check-out', cell: (r) => <CheckOutCell iso={r.checkOutAt} />, skeleton: 'w-20' },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} />, skeleton: 'w-16' },
    {
      key: 'photo',
      header: 'Photo',
      cell: (r) => <PhotoThumb attendanceId={r.id} label={`Check-in photo, ${formatWorkDate(r.workDate)}`} meta={`Checked in at ${formatTimeWithZone(r.checkInAt)}`} />,
      className: 'w-24',
      skeleton: 'w-11 h-11',
    },
  ]

  return (
    <DataTable
      caption="My attendance"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      status={status}
      error={error}
      onRetry={onRetry}
      retrying={retrying}
      fetching={fetching}
      empty={emptyRange}
      renderCard={(r) => (
        <div className="flex items-center gap-4 p-4">
          <PhotoThumb
            attendanceId={r.id}
            label={`Check-in photo, ${formatWorkDate(r.workDate)}`}
            meta={`Checked in at ${formatTimeWithZone(r.checkInAt)}`}
            size="md"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{formatWorkDate(r.workDate)}</p>
              <StatusBadge status={r.status} />
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>
                In <span className="text-ink tabular">{formatTime(r.checkInAt)}</span>
              </span>
              {r.checkOutAt ? (
                <span>
                  Out <span className="text-ink tabular">{formatTime(r.checkOutAt)}</span> {BUSINESS_TZ_LABEL}
                </span>
              ) : (
                <NotCheckedOutBadge />
              )}
            </p>
          </div>
        </div>
      )}
    />
  )
}

function employeeName(r: HrAttendance): string {
  return r.employee?.fullName ?? 'Unknown employee'
}

function photoLabel(r: HrAttendance): string {
  return `${employeeName(r)}, ${formatWorkDate(r.workDate)}`
}

export function AllAttendanceTable({ rows, status, error, onRetry, retrying, fetching }: ListProps<HrAttendance>) {
  const columns: Column<HrAttendance>[] = [
    { key: 'date', header: 'Date', cell: (r) => <span className="font-medium whitespace-nowrap">{formatWorkDate(r.workDate)}</span>, skeleton: 'w-28' },
    {
      key: 'employee',
      header: 'Employee',
      cell: (r) =>
        r.employee ? (
          <span className="flex flex-col">
            <span className="font-medium">{r.employee.fullName}</span>
            <span className="font-mono text-label text-muted">{r.employee.employeeCode}</span>
          </span>
        ) : (
          <span className="text-muted">Unknown employee</span>
        ),
      skeleton: 'w-36',
    },
    { key: 'dept', header: 'Department', cell: (r) => r.employee?.departmentName ?? <span className="text-muted">None</span>, skeleton: 'w-24' },
    { key: 'in', header: 'Check-in', cell: (r) => <Time iso={r.checkInAt} />, skeleton: 'w-20' },
    { key: 'out', header: 'Check-out', cell: (r) => <CheckOutCell iso={r.checkOutAt} />, skeleton: 'w-20' },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} />, skeleton: 'w-16' },
    {
      key: 'photo',
      header: 'Photo',
      cell: (r) => <PhotoThumb attendanceId={r.id} label={photoLabel(r)} meta={`Checked in at ${formatTimeWithZone(r.checkInAt)}`} />,
      className: 'w-20',
      skeleton: 'w-11 h-11',
    },
  ]

  return (
    <DataTable
      caption="Attendance of all employees"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      status={status}
      error={error}
      onRetry={onRetry}
      retrying={retrying}
      fetching={fetching}
      tableFrom="lg"
      empty={emptyRange}
      renderCard={(r) => (
        <div className="flex items-start gap-4 p-4">
          <PhotoThumb attendanceId={r.id} label={photoLabel(r)} meta={`Checked in at ${formatTimeWithZone(r.checkInAt)}`} size="md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <p className="flex min-w-0 flex-col">
                <span className={r.employee ? 'truncate font-medium' : 'font-medium text-muted'}>{employeeName(r)}</span>
                <span className="text-sm text-muted">
                  {r.employee ? (
                    <>
                      <span className="font-mono">{r.employee.employeeCode}</span>
                      {r.employee.departmentName && ` · ${r.employee.departmentName}`}
                    </>
                  ) : null}
                </span>
              </p>
              <StatusBadge status={r.status} />
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="text-ink">{formatWorkDate(r.workDate)}</span>
              <span>
                In <span className="text-ink tabular">{formatTime(r.checkInAt)}</span>
              </span>
              {r.checkOutAt ? (
                <span>
                  Out <span className="text-ink tabular">{formatTime(r.checkOutAt)}</span> {BUSINESS_TZ_LABEL}
                </span>
              ) : (
                <NotCheckedOutBadge />
              )}
            </p>
          </div>
        </div>
      )}
    />
  )
}
