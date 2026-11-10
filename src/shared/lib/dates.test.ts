import { describe, expect, it } from 'vitest'
import {
  addDays,
  localDateToYmd,
  ymdToLocalDate,
  businessToday,
  currentMonthRange,
  daysInRange,
  formatDuration,
  formatLongDate,
  formatTime,
  formatWorkDate,
  isValidYmd,
} from './dates'

describe('business timezone (Asia/Jakarta, UTC+7)', () => {
  it('uses the Jakarta date, not the UTC date, near midnight', () => {
    expect(businessToday(new Date('2026-11-10T18:30:00Z'))).toBe('2026-11-11')
    expect(businessToday(new Date('2026-11-10T16:59:00Z'))).toBe('2026-11-10')
  })

  it('formats UTC timestamps as 24-hour WIB times', () => {
    expect(formatTime('2026-11-10T01:52:00.000Z')).toBe('08:52')
    expect(formatTime('2026-11-10T10:31:00.000Z')).toBe('17:31')
  })

  it('gives the current business month as the default range', () => {
    expect(currentMonthRange(new Date('2026-02-10T03:00:00Z'))).toEqual({ from: '2026-02-01', to: '2026-02-28' })
    expect(currentMonthRange(new Date('2026-11-30T18:00:00Z'))).toEqual({ from: '2026-12-01', to: '2026-12-31' })
  })
})

describe('plain work dates', () => {
  it('never shifts the calendar day', () => {
    expect(formatWorkDate('2026-11-10')).toBe('Tue, 10 Nov 2026')
    expect(formatLongDate('2026-11-10')).toBe('Tuesday, 10 Nov 2026')
    expect(formatWorkDate('2026-01-01')).toBe('Thu, 1 Jan 2026')
  })

  it('rejects impossible dates', () => {
    expect(isValidYmd('2026-02-31')).toBe(false)
    expect(isValidYmd('2026-13-01')).toBe(false)
    expect(isValidYmd('10/11/2026')).toBe(false)
    expect(isValidYmd('2026-02-28')).toBe(true)
  })

  it('counts days inclusively', () => {
    expect(daysInRange('2026-11-01', '2026-11-01')).toBe(1)
    expect(daysInRange('2026-11-01', '2026-11-30')).toBe(30)
    expect(daysInRange('2026-11-01', '2026-12-01')).toBe(31)
    expect(daysInRange('2026-11-10', '2026-11-09')).toBe(0)
  })
})

describe('calendar conversions', () => {
  it('round-trips a plain date through a local Date', () => {
    const d = ymdToLocalDate('2026-11-01')!
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(10)
    expect(d.getDate()).toBe(1)
    expect(localDateToYmd(d)).toBe('2026-11-01')
  })

  it('rejects impossible dates', () => {
    expect(ymdToLocalDate('2026-02-30')).toBeUndefined()
  })

  it('adds days across month ends', () => {
    expect(addDays('2026-11-01', 30)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('formatDuration', () => {
  it('shows hours and minutes worked', () => {
    expect(formatDuration('2026-11-10T01:52:00Z', '2026-11-10T10:31:00Z')).toBe('8 h 39 min')
    expect(formatDuration('2026-11-10T01:00:00Z', '2026-11-10T01:45:00Z')).toBe('45 min')
    expect(formatDuration('2026-11-10T01:00:00Z', '2026-11-10T03:05:00Z')).toBe('2 h 05 min')
  })
})
