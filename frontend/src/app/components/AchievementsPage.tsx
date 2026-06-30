import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { fetchAchievements } from '../api/client'
import { useAuth } from '../auth/useAuth'
import type { AchievementData } from '../types'

export function AchievementsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<AchievementData[]>([])

  useEffect(() => {
    if (user === null) {
      return
    }

    void fetchAchievements(user).then(setItems)
  }, [user])

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <section>
        <h1 className="page-title">実績</h1>
        <p className="page-subtitle">朝活継続でアンロックされるバッジです。</p>
      </section>

      <section className="grid grid-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {item.unlocked ? <CheckCircle2 color="#2b7a4b" size={18} /> : <Circle size={18} />}
              {item.title}
            </h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
