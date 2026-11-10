import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ page, limit, total, onPageChange, disabled }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, limit)))
  if (total === 0) return null
  const first = (page - 1) * limit + 1
  const last = Math.min(page * limit, total)

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted tabular">
        Showing {first}–{last} of {total}
      </p>
      {pages > 1 && <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-11 lg:h-9"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
          icon={<ChevronLeft size={16} aria-hidden="true" />}
        >
          Previous
        </Button>
        <span className="px-2 text-sm text-muted tabular">
          Page {page} of {pages}
        </span>
        <Button
          size="sm"
          className="h-11 flex-row-reverse lg:h-9"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= pages}
          aria-label="Next page"
          icon={<ChevronRight size={16} aria-hidden="true" />}
        >
          Next
        </Button>
      </div>}
    </nav>
  )
}
