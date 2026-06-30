import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { fetchLeaderboard } from '../api/client'
import type { LeaderboardMember } from '../types'

export function CommunityPage() {
  const [members, setMembers] = useState<LeaderboardMember[]>([])

  useEffect(() => {
    void fetchLeaderboard().then(setMembers)
  }, [])

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <section>
        <h1 className="page-title">コミュニティ</h1>
        <p className="page-subtitle">継続しているメンバーの進捗を確認できます。</p>
      </section>

      <section className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Trophy size={18} color="#c59b3a" /> Leaderboard
        </h2>
        <div className="grid" style={{ marginTop: '0.8rem' }}>
          {members.map((member, index) => (
            <article key={member.id} className="card" style={{ boxShadow: 'none', padding: '0.9rem' }}>
              <strong>
                {index + 1}. {member.name}
              </strong>
              <p>連続 {member.streak} 日 / 累計 {member.totalCheckIns} 回</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
