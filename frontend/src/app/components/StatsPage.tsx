import { useEffect, useState } from 'react'
import { fetchStats } from '../api/client'
import { useAuth } from '../auth/useAuth'
import type { StatsData } from '../types'

export function StatsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<StatsData | null>(null)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    if (user === null) {
      return
    }

    void fetchStats(user).then((result) => {
      setData(result.data)
      setInsights(result.insights)
    })
  }, [user])

  if (data === null) {
    return <div className="card">統計を読み込み中です...</div>
  }

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <section>
        <h1 className="page-title">統計</h1>
        <p className="page-subtitle">あなたの朝活傾向を可視化しています。</p>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>総チェックイン</h2>
          <p className="metric">{data.summary.totalCheckIns}</p>
        </article>
        <article className="card">
          <h2>総時間</h2>
          <p className="metric">{data.summary.totalMinutes}分</p>
        </article>
      </section>

      <section className="card">
        <h2>週間実施状況</h2>
        <div className="grid" style={{ marginTop: '0.8rem' }}>
          {data.weeklyData.map((item) => (
            <div key={item.day}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.day}</span>
                <span>{item.count}</span>
              </div>
              <div className="bar">
                <span style={{ width: `${item.count * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>インサイト</h2>
        <ul>
          {insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
