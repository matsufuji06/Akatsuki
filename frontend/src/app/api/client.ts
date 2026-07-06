import type {
  AchievementData,
  ApiEnvelope,
  ApiUser,
  DashboardData,
  LeaderboardMember,
  ProfileData,
  StatsData,
} from '../types'

const API_BASE_URL =
  getRuntimeApiBaseUrl() ??
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  (import.meta.env.PROD ? '/api/v1' : 'http://127.0.0.1:8000/api/v1')

const AUTH_TOKEN_STORAGE_KEY = 'akatsukiAuthToken'
const AUTH_USER_STORAGE_KEY = 'akatsukiAuthUser'

type ApiErrorResponse = {
  message?: string
  errors?: Record<string, string[]>
}

type RequestOptions = {
  token?: string | null
}

type RuntimeAppConfig = {
  apiBaseUrl?: string
}

function getRuntimeApiBaseUrl(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const config = (window as Window & { __APP_CONFIG__?: RuntimeAppConfig }).__APP_CONFIG__

  if (typeof config?.apiBaseUrl !== 'string') {
    return undefined
  }

  const value = config.apiBaseUrl.trim()
  return value.length > 0 ? value.replace(/\/$/, '') : undefined
}

class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit, options?: RequestOptions): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options?.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = 'リクエストに失敗しました。'

    try {
      const body = (await response.json()) as ApiErrorResponse
      if (typeof body.message === 'string' && body.message.length > 0) {
        message = body.message
      } else if (body.errors) {
        const firstError = Object.values(body.errors)[0]?.[0]
        if (typeof firstError === 'string' && firstError.length > 0) {
          message = firstError
        }
      }
    } catch {
      message = `HTTP ${response.status}`
    }

    throw new ApiError(message, response.status)
  }

  return (await response.json()) as ApiEnvelope<T>
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function setStoredAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearStoredAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function getStoredUser(): ApiUser | null {
  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (raw === null) {
    return null
  }

  try {
    return JSON.parse(raw) as ApiUser
  } catch {
    return null
  }
}

export function setStoredUser(user: ApiUser): void {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export async function login(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
  const response = await request<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return response.data
}

export async function register(payload: {
  name: string
  email: string
  password: string
  password_confirmation: string
}): Promise<{ token: string; user: ApiUser }> {
  const response = await request<{ token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export function logout(): void {
  clearStoredAuthToken()
  clearStoredUser()
}

export async function fetchDashboard(user: ApiUser): Promise<DashboardData> {
  return {
    user,
    checkedInToday: user.streak > 0,
    canCheckInNow: true,
    summary: {
      todayActivity: '読書',
      todayDuration: 30,
      weeklyTarget: 7,
      weeklyProgress: Math.min(user.streak, 7),
    },
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardMember[]> {
  return [
    { id: '1', name: 'Sora', streak: 32, totalCheckIns: 188 },
    { id: '2', name: 'Aoi', streak: 28, totalCheckIns: 162 },
    { id: '3', name: 'Kou', streak: 17, totalCheckIns: 99 },
  ]
}

export async function fetchStats(user: ApiUser): Promise<{ data: StatsData; insights: string[] }> {
  const data: StatsData = {
    summary: {
      totalCheckIns: user.totalCheckIns,
      currentStreak: user.streak,
      bestStreak: user.bestStreak,
      totalMinutes: user.totalCheckIns * 35,
    },
    weeklyData: [
      { day: 'Mon', count: 1 },
      { day: 'Tue', count: 1 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 1 },
      { day: 'Fri', count: 1 },
      { day: 'Sat', count: 1 },
      { day: 'Sun', count: 1 },
    ],
    monthlyData: [
      { month: 'Jan', count: 18 },
      { month: 'Feb', count: 20 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 25 },
    ],
  }

  return {
    data,
    insights: ['朝5:30-6:30の時間帯が最も継続しやすい傾向です。', '木曜の実施率が低めです。前夜に準備すると安定します。'],
  }
}

export async function fetchAchievements(user: ApiUser): Promise<AchievementData[]> {
  return [
    {
      id: 'first-checkin',
      title: 'First Light',
      description: '初回の朝活チェックインを達成',
      unlocked: user.totalCheckIns >= 1,
    },
    {
      id: 'seven-streak',
      title: '7-Day Flame',
      description: '7日連続チェックイン',
      unlocked: user.bestStreak >= 7,
    },
    {
      id: 'fifty-checkins',
      title: 'Morning Builder',
      description: '累計50回チェックイン',
      unlocked: user.totalCheckIns >= 50,
    },
  ]
}

export async function fetchProfile(user: ApiUser): Promise<ProfileData> {
  return {
    user,
    consistencyRate: Math.min(100, Math.round((user.streak / Math.max(user.bestStreak, 1)) * 100)),
    appDays: 42,
  }
}

export { ApiError }
