import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStoredAuthToken, createCheckIn, fetchDashboard, login } from './client'

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('logs in with POST request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          token: 'token-value',
          user: {
            id: '1',
            name: 'User',
            avatar: null,
            streak: 3,
            bestStreak: 9,
            totalCheckIns: 12,
            level: 2,
            joinedAt: null,
          },
        },
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await login('foo@example.com', 'password')

    expect(result.token).toBe('token-value')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://127.0.0.1:8000/api/v1/auth/login')
  })

  it('throws API message on failed login', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'メールアドレスまたはパスワードが正しくありません。' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(login('foo@example.com', 'bad-password')).rejects.toThrow(
      'メールアドレスまたはパスワードが正しくありません。',
    )

    clearStoredAuthToken()
  })

  it('fetches the authenticated dashboard', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: {},
          checkedInToday: false,
          canCheckInNow: true,
          todayCheckIn: null,
          summary: {
            todayActivity: '未チェックイン',
            todayDuration: 0,
            weeklyTarget: 7,
            weeklyProgress: 0,
          },
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchDashboard('test-token')

    const request = fetchMock.mock.calls[0]
    expect(request?.[0]).toBe('http://127.0.0.1:8000/api/v1/dashboard')
    expect((request?.[1]?.headers as Headers).get('Authorization')).toBe('Bearer test-token')
  })

  it('posts a check-in using the API field names', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          checkIn: {},
          dashboard: {},
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await createCheckIn('test-token', {
      activity: '読書',
      durationMinutes: 30,
      note: '1章読んだ',
    })

    const request = fetchMock.mock.calls[0]
    expect(request?.[0]).toBe('http://127.0.0.1:8000/api/v1/check-ins')
    expect(request?.[1]?.method).toBe('POST')
    expect(JSON.parse(request?.[1]?.body as string)).toEqual({
      activity: '読書',
      duration_minutes: 30,
      note: '1章読んだ',
    })
    expect((request?.[1]?.headers as Headers).get('Authorization')).toBe('Bearer test-token')
  })
})
