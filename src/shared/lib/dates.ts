import { BUSINESS_TZ, BUSINESS_TZ_LABEL } from './constants'

export type YMD = string

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const ymdInZone = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeInZone = new Intl.DateTimeFormat('en-GB', {
  timeZone: BUSINESS_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const hourInZone = new Intl.DateTimeFormat('en-GB', {
  timeZone: BUSINESS_TZ,
  hour: '2-digit',
  hourCycle: 'h23',
})

const shortDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const calendarDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const longDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function parseYmd(ymd: YMD): { y: number; m: number; d: number } | null {
  const match = YMD_RE.exec(ymd)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
}

function ymdToUtcMs(ymd: YMD): number | null {
  const p = parseYmd(ymd)
  if (!p) return null
  const ms = Date.UTC(p.y, p.m - 1, p.d)
  const back = new Date(ms)
  if (back.getUTCFullYear() !== p.y || back.getUTCMonth() !== p.m - 1 || back.getUTCDate() !== p.d) return null
  return ms
}

export function isValidYmd(value: string): boolean {
  return ymdToUtcMs(value) !== null
}

export function ymdToLocalDate(ymd: YMD): Date | undefined {
  const p = parseYmd(ymd)
  if (!p || ymdToUtcMs(ymd) === null) return undefined
  return new Date(p.y, p.m - 1, p.d)
}

export function localDateToYmd(date: Date): YMD {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

export function addDays(ymd: YMD, days: number): YMD | undefined {
  const ms = ymdToUtcMs(ymd)
  if (ms === null) return undefined
  return new Date(ms + days * 86_400_000).toISOString().slice(0, 10)
}

export function businessToday(now: Date = new Date()): YMD {
  return ymdInZone.format(now)
}

export function currentMonthRange(now: Date = new Date()): { from: YMD; to: YMD } {
  const today = businessToday(now)
  const p = parseYmd(today)!
  const lastDay = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate()
  const mm = String(p.m).padStart(2, '0')
  return { from: `${p.y}-${mm}-01`, to: `${p.y}-${mm}-${String(lastDay).padStart(2, '0')}` }
}

export function daysInRange(from: YMD, to: YMD): number | null {
  const a = ymdToUtcMs(from)
  const b = ymdToUtcMs(to)
  if (a === null || b === null) return null
  return Math.round((b - a) / 86_400_000) + 1
}

export function formatTime(iso: string): string {
  return timeInZone.format(new Date(iso))
}

export function formatTimeWithZone(iso: string): string {
  return `${formatTime(iso)} ${BUSINESS_TZ_LABEL}`
}

export function formatWorkDate(ymd: YMD): string {
  const ms = ymdToUtcMs(ymd)
  return ms === null ? ymd : shortDate.format(ms)
}

export function formatCalendarDate(ymd: YMD): string {
  const ms = ymdToUtcMs(ymd)
  return ms === null ? ymd : calendarDate.format(ms)
}

export function formatLongDate(ymd: YMD): string {
  const ms = ymdToUtcMs(ymd)
  return ms === null ? ymd : longDate.format(ms)
}

export function formatDuration(fromIso: string, toIso: string): string {
  const minutes = Math.max(0, Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / 60_000))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return `${h} h ${String(m).padStart(2, '0')} min`
}

export function greeting(now: Date = new Date()): string {
  const hour = Number(hourInZone.format(now))
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
