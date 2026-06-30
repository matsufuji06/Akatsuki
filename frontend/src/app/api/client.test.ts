import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStoredAuthToken, login } from './client'

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
})
