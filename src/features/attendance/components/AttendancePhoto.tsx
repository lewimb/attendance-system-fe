import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Modal } from '@/shared/components/Modal'
import { cn } from '@/shared/lib/utils'
import { attendancePhotoUrl } from '../api'

interface PhotoProps {
  attendanceId: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  fit?: 'cover' | 'contain'
}

export function AttendancePhoto({ attendanceId, alt, className, loading = 'lazy', fit = 'cover' }: PhotoProps) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span
        role="img"
        aria-label="Photo unavailable"
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-sunken text-muted',
          fit === 'cover' ? 'size-full' : 'h-64 w-full',
          className,
        )}
      >
        <ImageOff size={20} aria-hidden="true" />
        {fit === 'contain' && <span className="text-sm">Photo unavailable</span>}
      </span>
    )
  }
  return (
    <img
      src={attendancePhotoUrl(attendanceId)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        fit === 'cover' ? 'size-full object-cover' : 'h-auto max-h-[min(68dvh,--spacing(160))] w-auto max-w-full object-contain',
        className,
      )}
    />
  )
}

interface ThumbProps {
  attendanceId: string
  label: string
  meta?: string
  size?: 'sm' | 'md' | 'lg'
}

const THUMB_SIZES = { sm: 'size-11', md: 'size-14', lg: 'size-20' }

export function PhotoThumb({ attendanceId, label, meta, size = 'sm' }: ThumbProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View photo: ${label}`}
        className={cn(
          'zoom relative block shrink-0 overflow-hidden rounded-control border border-line bg-sunken',
          THUMB_SIZES[size],
        )}
      >
        <AttendancePhoto attendanceId={attendanceId} alt="" />
      </button>
      <PhotoViewerModal open={open} onClose={() => setOpen(false)} attendanceId={attendanceId} title={label} meta={meta} />
    </>
  )
}

export function PhotoViewerModal({
  open,
  onClose,
  attendanceId,
  title,
  meta,
}: {
  open: boolean
  onClose: () => void
  attendanceId: string
  title: string
  meta?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={meta} size="lg">
      <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-panel bg-sunken">
        <AttendancePhoto attendanceId={attendanceId} alt={`Check-in photo: ${title}`} loading="eager" fit="contain" />
      </div>
    </Modal>
  )
}
