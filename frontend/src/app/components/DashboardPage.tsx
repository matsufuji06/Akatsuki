import { useEffect, useState } from 'react'
import { Calendar, Flame, Clock } from 'lucide-react'
import { fetchDashboard } from '../api/client'
import { useAuth } from '../auth/useAuth'
import type { DashboardData } from '../types'

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (user === null) {
      return
    }

    void fetchDashboard(user).then(setData)
  }, [user])

  if (data === null) {
    return <div className="card">ダッシュボードを読み込み中です...</div>
  }

  return (
    <div className="grid" style={{ gap: '1.1rem' }}>
      <section>
        <h1 className="page-title">おはようございます、{data.user.name}さん</h1>
        <p className="page-subtitle">今日も短くてもいいので、朝の時間を作りましょう。</p>
      </section>

      <section className="hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <p>現在のストリーク</p>
            <p className="metric">{data.user.streak} 日</p>
          </div>
          <button type="button" className="button ghost" disabled={!data.canCheckInNow}>
            {data.checkedInToday ? 'チェックイン済み' : 'チェックインする'}
          </button>
        </div>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <Flame size={18} color="#d45b2b" />
          <h2 style={{ marginBottom: '0.2rem' }}>最長継続</h2>
          <p className="metric">{data.user.bestStreak}日</p>
        </article>
        <article className="card">
          <Calendar size={18} color="#0f8a72" />
          <h2 style={{ marginBottom: '0.2rem' }}>累計チェックイン</h2>
          <p className="metric">{data.user.totalCheckIns}</p>
        </article>
        <article className="card">
          <Clock size={18} color="#576b95" />
          <h2 style={{ marginBottom: '0.2rem' }}>今日の活動</h2>
          <p className="metric" style={{ fontSize: '1.3rem' }}>
            {data.summary.todayActivity}
          </p>
          <p>{data.summary.todayDuration}分</p>
        </article>
      </section>

      <section className="card">
        <p>週の目標達成率</p>
        {(() => {
          const percent =
            data.summary.weeklyTarget > 0
              ? Math.min(100, (data.summary.weeklyProgress / data.summary.weeklyTarget) * 100)
              : 0

          return (
            <div
              className="bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percent)}
            >
              <span style={{ width: `${percent}%` }} />
            </div>
          )
        })()}
        <p style={{ marginTop: '0.4rem' }}>
          {data.summary.weeklyProgress} / {data.summary.weeklyTarget} 日
        </p>
      </section>
    </div>
  )
}
