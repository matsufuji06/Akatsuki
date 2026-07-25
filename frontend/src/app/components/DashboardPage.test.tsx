import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { DashboardPage } from './DashboardPage'

const baseUser = {
  id: '1',
  name: '朝子',
  avatar: null,
  streak: 0,
  bestStreak: 0,
  totalCheckIns: 0,
  level: 1,
  joinedAt: '2026-07-01T00:00:00+09:00',
}

const emptyDashboard = {
  user: baseUser,
  checkedInToday: false,
  canCheckInNow: true,
  todayCheckIn: null,
  summary: {
    todayActivity: '未チェックイン',
    todayDuration: 0,
    weeklyTarget: 7,
    weeklyProgress: 0,
  },
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('akatsukiAuthToken', 'test-token')
    localStorage.setItem('akatsukiAuthUser', JSON.stringify(baseUser))
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('submits a check-in and updates the dashboard', async () => {
    const checkedInDashboard = {
      ...emptyDashboard,
      user: {
        ...baseUser,
        streak: 1,
        bestStreak: 1,
        totalCheckIns: 1,
      },
      checkedInToday: true,
      canCheckInNow: false,
      todayCheckIn: {
        id: '1',
        activity: '運動',
        durationMinutes: 20,
        note: '気持ちよく走れた',
        checkedInOn: '2026-07-25',
        checkedInAt: '2026-07-25T06:30:00+09:00',
      },
      summary: {
        ...emptyDashboard.summary,
        todayActivity: '運動',
        todayDuration: 20,
        weeklyProgress: 1,
      },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: emptyDashboard }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            checkIn: checkedInDashboard.todayCheckIn,
            dashboard: checkedInDashboard,
          },
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await userEvent.click(await screen.findByRole('button', { name: 'チェックインする' }))
    const activityInput = screen.getByLabelText('活動内容')
    await userEvent.clear(activityInput)
    await userEvent.type(activityInput, '運動')
    const durationInput = screen.getByLabelText('活動時間（分）')
    await userEvent.clear(durationInput)
    await userEvent.type(durationInput, '20')
    await userEvent.type(screen.getByLabelText('ひとこと（任意）'), '気持ちよく走れた')
    await userEvent.click(screen.getByRole('button', { name: '記録する' }))

    expect(await screen.findByText('今日のチェックインを記録しました。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'チェックイン済み' })).toBeDisabled()
    expect(screen.getByText('運動')).toBeInTheDocument()
    expect(screen.getByText('20分')).toBeInTheDocument()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string)).toEqual({
      activity: '運動',
      duration_minutes: 20,
      note: '気持ちよく走れた',
    })
  })
})
