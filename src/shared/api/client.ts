import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/shared/lib/constants'
import { toApiError } from './errors'
import type { Envelope } from './types'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
})

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout']

api.interceptors.request.use((config) => {
  if (config.method && WRITE_METHODS.has(config.method.toLowerCase())) {
    config.headers.set('X-Requested-With', 'XMLHttpRequest')
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

let refreshInFlight: Promise<void> | null = null
let onAuthFailure: (() => void) | null = null

export function setAuthFailureHandler(handler: (() => void) | null): void {
  onAuthFailure = handler
}

export function refreshSession(): Promise<void> {
  refreshInFlight ??= api
    .post('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (axios.isCancel(error)) throw error
  if (!axios.isAxiosError(error) || !error.config) throw toApiError(error)

  const config = error.config as RetriableConfig
  const url = config.url ?? ''
  const shouldRefresh =
    error.response?.status === 401 && !config._retried && !NO_REFRESH.some((path) => url.startsWith(path))

  if (!shouldRefresh) throw toApiError(error)

  config._retried = true
  try {
    await refreshSession()
  } catch {
    onAuthFailure?.()
    throw toApiError(error)
  }
  return api.request(config)
})

export const http = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.get<Envelope<T>>(url, config)
    return res.data.data
  },
  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.post<Envelope<T>>(url, body, config)
    return res.data?.data
  },
  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.patch<Envelope<T>>(url, body, config)
    return res.data?.data
  },
}
