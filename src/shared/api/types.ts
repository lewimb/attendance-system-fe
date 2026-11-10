export interface Envelope<T> {
  data: T
  statusCode: number
  message?: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface ErrorBody {
  statusCode?: number
  code?: string
  message?: string | string[]
  error?: string
  details?: Array<{ field?: string; message?: string }>
}

export function totalPages(p: Pick<Paginated<unknown>, 'total' | 'limit'>): number {
  return Math.max(1, Math.ceil(p.total / Math.max(1, p.limit)))
}
