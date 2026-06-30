import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows validation error when password confirmation mismatches', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    await userEvent.type(screen.getByLabelText('表示名'), 'Foo User')
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'foo@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.type(screen.getByLabelText('パスワード（確認）'), 'password321')
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません。')).toBeInTheDocument()
    })
  })

  it('shows API error message when register fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ message: 'このメールアドレスは既に使用されています。' }),
      }),
    )

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    await userEvent.type(screen.getByLabelText('表示名'), 'Foo User')
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'foo@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.type(screen.getByLabelText('パスワード（確認）'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))

    await waitFor(() => {
      expect(screen.getByText('このメールアドレスは既に使用されています。')).toBeInTheDocument()
    })
  })
})
