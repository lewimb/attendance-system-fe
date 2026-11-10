import { AxiosError, AxiosHeaders, CanceledError, isCancel, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, http, setAuthFailureHandler } from './client'
import { ApiError } from './errors'

function fakeNetwork(handler: (config: InternalAxiosRequestConfig) => { status: number; data?: unknown }) {
  const calls: InternalAxiosRequestConfig[] = []
  const adapter: AxiosAdapter = async (config) => {
    calls.push(config)
    const { status, data } = handler(config)
    const response = { status, data, statusText: String(status), headers: {}, config }
    if (status >= 400) throw new AxiosError(`status ${status}`, String(status), config, null, response)
    return response
  }
  return { adapter, calls, count: (url: string) => calls.filter((c) => c.url === url).length }
}

describe('api client', () => {
  const original = api.defaults.adapter
  afterEach(() => {
    api.defaults.adapter = original
    setAuthFailureHandler(null)
  })

  describe('a 401 triggers one shared refresh', () => {
    let tokenValid: boolean
    let net: ReturnType<typeof fakeNetwork>

    beforeEach(() => {
      tokenValid = false
      net = fakeNetwork((config) => {
        if (config.url === '/auth/refresh') {
          tokenValid = true
          return { status: 200, data: { data: {} } }
        }
        return tokenValid ? { status: 200, data: { data: { url: config.url } } } : { status: 401, data: { code: 'TOKEN_EXPIRED' } }
      })
      api.defaults.adapter = net.adapter
    })

    it('refreshes once for parallel requests and retries each one', async () => {
      const results = await Promise.all([http.get('/a'), http.get('/b'), http.get('/c')])
      expect(results).toEqual([{ url: '/a' }, { url: '/b' }, { url: '/c' }])
      expect(net.count('/auth/refresh')).toBe(1)
      expect(net.count('/a')).toBe(2)
    })
  })

  it('logs out locally when the refresh fails, without retrying again', async () => {
    const onFailure = vi.fn()
    setAuthFailureHandler(onFailure)
    const net = fakeNetwork(() => ({ status: 401, data: { code: 'TOKEN_INVALID' } }))
    api.defaults.adapter = net.adapter

    await expect(http.get('/attendance/me')).rejects.toMatchObject({ status: 401 })
    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(net.count('/auth/refresh')).toBe(1)
    expect(net.count('/attendance/me')).toBe(1)
  })

  it('never refreshes on a failed login', async () => {
    const net = fakeNetwork(() => ({ status: 401, data: { message: 'Invalid credentials' } }))
    api.defaults.adapter = net.adapter

    await expect(http.post('/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(ApiError)
    expect(net.count('/auth/refresh')).toBe(0)
  })

  it('sends X-Requested-With on writes only', async () => {
    const net = fakeNetwork(() => ({ status: 200, data: { data: null } }))
    api.defaults.adapter = net.adapter

    await http.get('/x')
    await http.post('/y')
    const header = (i: number) => AxiosHeaders.from(net.calls[i].headers).get('X-Requested-With')
    expect(header(0)).toBeUndefined()
    expect(header(1)).toBe('XMLHttpRequest')
  })

  it('lets a cancelled request through as a cancellation, not an ApiError', async () => {
    const net = fakeNetwork(() => ({ status: 200, data: { data: null } }))
    api.defaults.adapter = async (config) => {
      if (config.signal?.aborted) throw new CanceledError(undefined, undefined, config)
      return net.adapter(config)
    }
    const controller = new AbortController()
    controller.abort()

    const error = await http.get('/employees', { signal: controller.signal }).catch((e: unknown) => e)
    expect(isCancel(error)).toBe(true)
    expect(error).not.toBeInstanceOf(ApiError)
  })

  it('turns a 429 into TOO_MANY_REQUESTS', async () => {
    const net = fakeNetwork(() => ({ status: 429, data: { message: 'ThrottlerException' } }))
    api.defaults.adapter = net.adapter

    await expect(http.get('/employees')).rejects.toMatchObject({ status: 429, code: 'TOO_MANY_REQUESTS' })
  })
})
