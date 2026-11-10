import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ErrorState, Skeleton } from './States'

export type SortOrder = 'asc' | 'desc'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortField?: string
  className?: string
  skeleton?: string
}

interface DataTableProps<T> {
  caption: string
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string
  renderCard: (row: T) => ReactNode
  status: 'pending' | 'error' | 'success'
  error?: unknown
  onRetry?: () => void
  retrying?: boolean
  empty: ReactNode
  fetching?: boolean
  sort?: { by: string; order: SortOrder }
  onSort?: (field: string) => void
  tableFrom?: 'md' | 'lg'
  skeletonRows?: number
}

const LAYOUT = {
  md: { table: 'hidden md:table', cards: 'md:hidden' },
  lg: { table: 'hidden lg:table', cards: 'lg:hidden' },
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  renderCard,
  status,
  error,
  onRetry,
  retrying,
  empty,
  fetching,
  sort,
  onSort,
  tableFrom = 'md',
  skeletonRows = 6,
}: DataTableProps<T>) {
  const layout = LAYOUT[tableFrom]

  if (status === 'error') {
    return (
      <Panel>
        <ErrorState error={error} title="Couldn't load the list" onRetry={onRetry} retrying={retrying} />
      </Panel>
    )
  }

  if (status === 'success' && rows && rows.length === 0) {
    return <Panel>{empty}</Panel>
  }

  const loading = status === 'pending'

  return (
    <Panel busy={loading || fetching}>
      {loading && <span className="sr-only" role="status">Loading</span>}
      <table className={cn('w-full border-collapse text-left', layout.table)}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <HeaderCell key={col.key} column={col} sort={sort} onSort={onSort} />
            ))}
          </tr>
        </thead>
        <tbody className={cn('transition-opacity duration-150', fetching && !loading && 'opacity-60')}>
          {loading
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="h-16 px-3 first:pl-6 last:pr-6">
                      <Skeleton className={cn('h-4', col.skeleton ?? 'w-24')} />
                    </td>
                  ))}
                </tr>
              ))
            : rows?.map((row) => (
                <tr key={rowKey(row)} className="border-b border-line last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('h-16 px-3 py-2 align-middle first:pl-6 last:pr-6', col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>

      <ul className={cn('divide-y divide-line', layout.cards, fetching && !loading && 'opacity-60')} aria-label={caption}>
        {loading
          ? Array.from({ length: Math.min(skeletonRows, 4) }, (_, i) => (
              <li key={i} className="flex flex-col gap-3 p-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </li>
            ))
          : rows?.map((row) => <li key={rowKey(row)}>{renderCard(row)}</li>)}
      </ul>
    </Panel>
  )
}

function Panel({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className="glass overflow-hidden rounded-card" aria-busy={busy || undefined}>
      {children}
    </div>
  )
}

function HeaderCell<T>({
  column,
  sort,
  onSort,
}: {
  column: Column<T>
  sort?: { by: string; order: SortOrder }
  onSort?: (field: string) => void
}) {
  const base = 'h-12 px-3 text-label font-medium text-muted first:pl-6 last:pr-6 whitespace-nowrap'
  if (!column.sortField || !onSort) {
    return (
      <th scope="col" className={cn(base, column.className)}>
        {column.header}
      </th>
    )
  }
  const active = sort?.by === column.sortField
  const ariaSort = active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'
  const Icon = !active ? ArrowUpDown : sort.order === 'asc' ? ArrowUp : ArrowDown
  return (
    <th scope="col" aria-sort={ariaSort} className={cn(base, column.className)}>
      <button
        type="button"
        onClick={() => onSort(column.sortField!)}
        className={cn(
          '-mx-2 inline-flex h-8 items-center gap-1.5 rounded-control px-2 transition-colors duration-150 hover:bg-neutral-soft hover:text-ink',
          active && 'text-ink',
        )}
      >
        {column.header}
        <Icon size={14} aria-hidden="true" className={active ? '' : 'opacity-60'} />
      </button>
    </th>
  )
}
