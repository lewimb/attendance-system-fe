import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES, MAX_RANGE_DAYS } from '@/shared/lib/constants'
import { daysInRange, isValidYmd } from '@/shared/lib/dates'
import { formatBytes } from '@/shared/lib/format'

export function sizeLabel(bytes: number): string {
  return formatBytes(bytes).replace('.0 ', ' ')
}

export function validatePhoto(
  file: File,
  { maxBytes = MAX_PHOTO_BYTES, accept = ACCEPTED_PHOTO_TYPES }: { maxBytes?: number; accept?: readonly string[] } = {},
): string | null {
  if (file.size === 0) return 'This file is empty. Choose another photo.'
  if (!accept.includes(file.type)) return 'Choose a JPEG or PNG photo.'
  if (file.size > maxBytes) return `This photo is ${formatBytes(file.size)}. Choose one up to ${sizeLabel(maxBytes)}.`
  return null
}

export function validateRange(from: string, to: string): { from?: string; to?: string } {
  const errors: { from?: string; to?: string } = {}
  if (!from) errors.from = 'Pick a start date.'
  else if (!isValidYmd(from)) errors.from = 'Enter a valid start date.'
  if (!to) errors.to = 'Pick an end date.'
  else if (!isValidYmd(to)) errors.to = 'Enter a valid end date.'
  if (errors.from || errors.to) return errors

  const days = daysInRange(from, to)!
  if (days < 1) errors.to = 'Pick an end date on or after the start date.'
  else if (days > MAX_RANGE_DAYS) errors.to = `Pick a range of ${MAX_RANGE_DAYS} days or less.`
  return errors
}
