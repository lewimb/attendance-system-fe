import { CircleCheck, CircleMinus, Clock } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import type { AttendanceStatus } from '../types'

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  return status === 'LATE' ? (
    <Badge tone="warn" icon={<Clock size={14} aria-hidden="true" />}>
      Late
    </Badge>
  ) : (
    <Badge tone="ok" icon={<CircleCheck size={14} aria-hidden="true" />}>
      Present
    </Badge>
  )
}

export function NotCheckedOutBadge() {
  return (
    <Badge tone="neutral" icon={<CircleMinus size={14} aria-hidden="true" />}>
      Not checked out
    </Badge>
  )
}
