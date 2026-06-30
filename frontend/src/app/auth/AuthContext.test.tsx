import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

function Harness() {
  const { isAuthenticated, login, user } = useAuth()

  return (
    <div>
      <p>{isAuthenticated ? 'authenticated' : 'guest'}</p>
      <p>{user?.name ?? 'none'}</p>
      <button type="button" onClick={() => void login('user@example.com', 'password')}>
        login
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('restores token and user from storage', async () => {
    localStorage.setItem('akatsukiAuthToken', 'saved-token')
    localStorage.setItem(
      'akatsukiAuthUser',
      JSON.stringify({
        id: '1',
        name: 'Saved User',
        avatar: null,
        streak: 2,
        bestStreak: 5,
        totalCheckIns: 10,
        level: 1,
        joinedAt: null,
      }),
    )

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('authenticated')).toBeInTheDocument()
      expect(screen.getByText('Saved User')).toBeInTheDocument()
    })
  })

  it('logs in and stores credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            token: 'new-token',
            user: {
              id: '2',
              name: 'Login User',
              avatar: null,
              streak: 1,
              bestStreak: 1,
              totalCheckIns: 1,
              level: 1,
              joinedAt: null,
            },
          },
        }),
      }),
    )

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => {
      expect(screen.getByText('authenticated')).toBeInTheDocument()
      expect(localStorage.getItem('akatsukiAuthToken')).toBe('new-token')
    })
  })
})
