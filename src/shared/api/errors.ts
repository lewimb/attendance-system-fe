import { isAxiosError } from 'axios'
import type { ErrorBody } from './types'

export type ApiErrorCode =
  | 'PHOTO_REQUIRED'
  | 'PHOTO_TOO_LARGE'
  | 'UNSUPPORTED_PHOTO_TYPE'
  | 'ALREADY_CHECKED_IN'
  | 'NOT_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT'
  | 'UNAUTHENTICATED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'FORBIDDEN'
  | 'CSRF_HEADER_MISSING'
  | 'TOO_MANY_REQUESTS'
  | 'VALIDATION_FAILED'
  | 'NETWORK_ERROR'
  | (string & {})

export class ApiError extends Error {
  readonly status: number
  readonly code?: ApiErrorCode
  readonly serverMessages: string[]
  readonly details?: ErrorBody['details']

  constructor(init: { status: number; code?: string; serverMessages?: string[]; details?: ErrorBody['details'] }) {
    super(init.serverMessages?.[0] ?? `Request failed with status ${init.status}`)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.serverMessages = init.serverMessages ?? []
    this.details = init.details
  }

  get isNetwork(): boolean {
    return this.status === 0
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isAxiosError<ErrorBody>(error)) {
    if (!error.response) {
      return new ApiError({ status: 0, code: 'NETWORK_ERROR', serverMessages: [error.message] })
    }
    const body = error.response.data
    const raw = body && typeof body === 'object' ? body.message : undefined
    const serverMessages = Array.isArray(raw) ? raw : raw ? [raw] : []
    const status = error.response.status
    const code = (body && typeof body === 'object' && body.code) || (status === 429 ? 'TOO_MANY_REQUESTS' : undefined)
    return new ApiError({
      status,
      code,
      serverMessages,
      details: body && typeof body === 'object' ? body.details : undefined,
    })
  }
  return new ApiError({ status: -1, serverMessages: [error instanceof Error ? error.message : String(error)] })
}

export const PHOTO_ERROR_MESSAGE = 'Photo must be a JPEG or PNG up to 3 MB.'

export function friendlyMessage(error: unknown): string {
  const e = toApiError(error)
  switch (e.code) {
    case 'PHOTO_TOO_LARGE':
    case 'UNSUPPORTED_PHOTO_TYPE':
      return PHOTO_ERROR_MESSAGE
    case 'PHOTO_REQUIRED':
      return 'Add a photo to check in.'
    case 'TOO_MANY_REQUESTS':
      return 'Too many attempts. Try again in a minute.'
    case 'FORBIDDEN':
      return "You don't have access to this."
    case 'NETWORK_ERROR':
      return "Can't reach the server. Check your connection and try again."
  }
  if (e.status === 429) return 'Too many attempts. Try again in a minute.'
  if (e.status === 401) return 'Your session has ended. Log in again.'
  if (e.status === 404) return 'This item no longer exists.'
  return 'Something went wrong. Please try again.'
}
