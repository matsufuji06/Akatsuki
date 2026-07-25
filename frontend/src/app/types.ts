export type ApiEnvelope<T> = {
  data: T
  meta?: unknown
  insights?: string[]
}

export type ApiUser = {
  id: string
  name: string
  avatar: string | null
  streak: number
  bestStreak: number
  totalCheckIns: number
  level: number
  joinedAt: string | null
}

export type DashboardData = {
  user: ApiUser
  checkedInToday: boolean
  canCheckInNow: boolean
  todayCheckIn: CheckInData | null
  summary: {
    todayActivity: string
    todayDuration: number
    weeklyTarget: number
    weeklyProgress: number
  }
}

export type CheckInData = {
  id: string
  activity: string
  durationMinutes: number
  note: string | null
  checkedInOn: string
  checkedInAt: string
}

export type CreateCheckInPayload = {
  activity: string
  durationMinutes: number
  note?: string
}

export type LeaderboardMember = {
  id: string
  name: string
  streak: number
  totalCheckIns: number
}

export type StatsData = {
  summary: {
    totalCheckIns: number
    currentStreak: number
    bestStreak: number
    totalMinutes: number
  }
  weeklyData: Array<{ day: string; count: number }>
  monthlyData: Array<{ month: string; count: number }>
}

export type AchievementData = {
  id: string
  title: string
  description: string
  unlocked: boolean
}

export type ProfileData = {
  user: ApiUser
  consistencyRate: number
  appDays: number
}
