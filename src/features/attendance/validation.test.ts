import { describe, expect, it } from 'vitest'
import { validatePhoto, validateRange } from './validation'

const MB = 1024 * 1024
const file = (size: number, type: string, name = 'photo') => new File([new Uint8Array(size)], name, { type })

describe('validatePhoto', () => {
  it('accepts a JPEG or PNG up to 3 MB', () => {
    expect(validatePhoto(file(500_000, 'image/jpeg'))).toBeNull()
    expect(validatePhoto(file(3 * MB, 'image/png'))).toBeNull()
  })

  it('rejects an empty file', () => {
    expect(validatePhoto(file(0, 'image/jpeg'))).toBe('This file is empty. Choose another photo.')
  })

  it('rejects other types', () => {
    expect(validatePhoto(file(1000, 'image/gif'))).toBe('Choose a JPEG or PNG photo.')
    expect(validatePhoto(file(1000, 'application/pdf'))).toBe('Choose a JPEG or PNG photo.')
  })

  it('rejects a photo over 3 MB and says how big it is', () => {
    expect(validatePhoto(file(3 * MB + 1, 'image/jpeg'))).toBe('This photo is 3.0 MB. Choose one up to 3 MB.')
    expect(validatePhoto(file(Math.round(4.2 * MB), 'image/png'))).toBe('This photo is 4.2 MB. Choose one up to 3 MB.')
  })
})

describe('validateRange', () => {
  it('accepts up to 31 days', () => {
    expect(validateRange('2026-11-01', '2026-12-01')).toEqual({})
  })

  it('rejects more than 31 days', () => {
    expect(validateRange('2026-11-01', '2026-12-02')).toEqual({ to: 'Pick a range of 31 days or less.' })
  })

  it('rejects an end before the start', () => {
    expect(validateRange('2026-11-10', '2026-11-09')).toEqual({ to: 'Pick an end date on or after the start date.' })
  })

  it('requires both dates', () => {
    expect(validateRange('', '')).toEqual({ from: 'Pick a start date.', to: 'Pick an end date.' })
  })
})
