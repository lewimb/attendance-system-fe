import { useState, type ReactNode } from 'react'
import { CircleCheck, Clock, LogOut as CheckOutIcon } from 'lucide-react'
import { friendlyMessage, PHOTO_ERROR_MESSAGE, toApiError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { ErrorState, Skeleton } from '@/shared/components/States'
import { useToast } from '@/shared/components/toast-context'
import { BUSINESS_TZ_LABEL, WORK_START_LABEL } from '@/shared/lib/constants'
import { formatDuration, formatTime, formatTimeWithZone, formatWorkDate } from '@/shared/lib/dates'
import { cn } from '@/shared/lib/utils'
import { useCheckIn, useCheckOut, useRefreshToday, useTodayAttendance } from '../queries'
import type { Attendance } from '../types'
import { PhotoThumb } from './AttendancePhoto'
import { PhotoUploader } from './PhotoUploader'
import { StatusBadge } from './StatusBadge'

const QUIET_CONFLICTS = new Set(['ALREADY_CHECKED_IN', 'ALREADY_CHECKED_OUT', 'NOT_CHECKED_IN'])

export function AttendanceActionCard() {
  const today = useTodayAttendance()

  if (today.isPending) return <TodaySkeleton />
  if (today.isError) {
    return (
      <Card>
        <ErrorState
          error={today.error}
          title="Couldn't load today's attendance"
          onRetry={() => void today.refetch()}
          retrying={today.isFetching}
          className="py-10"
        />
      </Card>
    )
  }

  const record = today.data
  if (!record) return <CheckInPanel />
  if (!record.checkOutAt) return <CheckedInPanel record={record} />
  return <CheckedOutPanel record={record} checkOutAt={record.checkOutAt} />
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('glass rounded-card p-5 sm:p-6', className)}>
      {children}
    </section>
  )
}

function CardHeading({ title, body }: { title: string; body?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold">{title}</h2>
      {body && <p className="text-base text-muted">{body}</p>}
    </div>
  )
}

function CheckInPanel() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const checkIn = useCheckIn()
  const refreshToday = useRefreshToday()
  const toast = useToast()

  function submit() {
    if (!photo) return
    setFormError(null)
    setPhotoError(null)
    checkIn.mutate(photo, {
      onSuccess: (record) => toast.success(`Checked in at ${formatTimeWithZone(record.checkInAt)}.`),
      onError: (error) => {
        const e = toApiError(error)
        if (e.code && QUIET_CONFLICTS.has(e.code)) {
          void refreshToday()
          return
        }
        if (e.code === 'PHOTO_TOO_LARGE' || e.code === 'UNSUPPORTED_PHOTO_TYPE' || e.status === 413 || e.status === 415) {
          setPhotoError(PHOTO_ERROR_MESSAGE)
          return
        }
        setFormError(friendlyMessage(error))
      },
    })
  }

  return (
    <Card>
      <div className="flex flex-col gap-5">
        <CardHeading title="Check in for today" body="Add a photo of where you're working from." />
        <PhotoUploader
          value={photo}
          onChange={(file) => {
            setPhoto(file)
            setPhotoError(null)
            setFormError(null)
          }}
          error={photoError}
          uploading={checkIn.isPending}
          progress={checkIn.progress}
          label="Add a photo"
        />
        <p className="flex items-start gap-2 text-sm text-muted">
          <Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>
            Work starts at {WORK_START_LABEL} {BUSINESS_TZ_LABEL}. Check-ins after that are marked Late.
          </span>
        </p>
        {formError && (
          <p role="alert" className="rounded-control bg-danger-soft px-4 py-3 text-base text-danger">
            {formError}
          </p>
        )}
        <Button
          variant="primary"
          block
          onClick={submit}
          disabled={!photo}
          loading={checkIn.isPending}
          loadingLabel="Checking in"
        >
          Check in
        </Button>
      </div>
    </Card>
  )
}

function CheckedInPanel({ record }: { record: Attendance }) {
  const [confirming, setConfirming] = useState(false)
  const checkOut = useCheckOut()
  const refreshToday = useRefreshToday()
  const toast = useToast()

  function confirmCheckOut() {
    checkOut.mutate(undefined, {
      onSuccess: (updated) => {
        setConfirming(false)
        if (updated?.checkOutAt) toast.success(`Checked out at ${formatTimeWithZone(updated.checkOutAt)}.`)
      },
      onError: (error) => {
        setConfirming(false)
        const e = toApiError(error)
        if (e.code && QUIET_CONFLICTS.has(e.code)) {
          void refreshToday()
          return
        }
        toast.error(friendlyMessage(error))
      },
    })
  }

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-medium text-muted">Checked in at</h2>
            <p className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight tabular">{formatTime(record.checkInAt)}</span>
              <span className="text-lg font-medium text-muted">{BUSINESS_TZ_LABEL}</span>
            </p>
          </div>
          <StatusBadge status={record.status} />
        </div>

        <div className="flex items-center gap-4 rounded-panel border border-line bg-surface/50 p-3">
          <PhotoThumb
            attendanceId={record.id}
            label={`Your check-in photo, ${formatWorkDate(record.workDate)}`}
            meta={`Checked in at ${formatTimeWithZone(record.checkInAt)}`}
            size="md"
          />
          <p className="text-sm text-muted">
            Photo submitted. Check out when you finish work; the time is recorded when you tap.
          </p>
        </div>

        <Button
          variant="primary"
          block
          onClick={() => setConfirming(true)}
          icon={<CheckOutIcon size={18} aria-hidden="true" />}
        >
          Check out
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Check out for today?"
        description={`Your check-out time is recorded now. After that, today's attendance can't be changed.`}
        confirmLabel="Check out"
        busyLabel="Checking out"
        busy={checkOut.isPending}
        onConfirm={confirmCheckOut}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  )
}

function CheckedOutPanel({ record, checkOutAt }: { record: Attendance; checkOutAt: string }) {
  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok" aria-hidden="true">
            <CircleCheck size={24} />
          </span>
          <CardHeading title="Done for today" body="Your check-in and check-out are recorded." />
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <Fact label="Checked in" value={formatTimeWithZone(record.checkInAt)} />
          <Fact label="Checked out" value={formatTimeWithZone(checkOutAt)} />
          <Fact label="Time worked" value={formatDuration(record.checkInAt, checkOutAt)} />
          <Fact label="Status" value={<StatusBadge status={record.status} />} />
        </dl>

        <div className="flex items-center gap-4">
          <PhotoThumb
            attendanceId={record.id}
            label={`Your check-in photo, ${formatWorkDate(record.workDate)}`}
            meta={`Checked in at ${formatTimeWithZone(record.checkInAt)}`}
            size="md"
          />
          <p className="text-sm text-muted">Your check-in photo. Tap it to view it larger.</p>
        </div>
      </div>
    </Card>
  )
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-panel border border-line bg-surface/50 p-4">
      <dt className="text-label font-medium text-muted">{label}</dt>
      <dd className="text-lg font-semibold tabular">{value}</dd>
    </div>
  )
}

function TodaySkeleton() {
  return (
    <section className="glass rounded-card p-5 sm:p-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading today's attendance
      </span>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="aspect-4/3 max-h-85 w-full rounded-panel" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-11 w-full" />
      </div>
    </section>
  )
}
