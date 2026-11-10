import { useSearchParams } from 'react-router'
import { MAX_RANGE_DAYS } from '@/shared/lib/constants'
import { currentMonthRange, daysInRange, type YMD } from '@/shared/lib/dates'

type ParamValue = string | number | boolean | null | undefined

export function useQueryParams() {
  const [params, setParams] = useSearchParams()

  function get(key: string): string | undefined {
    return params.get(key) || undefined
  }

  function update(patch: Record<string, ParamValue>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined || value === null || value === '') next.delete(key)
          else next.set(key, String(value))
        }
        return next
      },
      { preventScrollReset: true },
    )
  }

  return { get, update }
}

export function parsePage(value: string | undefined): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function parseId(value: string | undefined): number | undefined {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : undefined
}

export function parseRange(from: string | undefined, to: string | undefined): { from: YMD; to: YMD } {
  if (from && to) {
    const days = daysInRange(from, to)
    if (days !== null && days >= 1 && days <= MAX_RANGE_DAYS) return { from, to }
  }
  return currentMonthRange()
}
