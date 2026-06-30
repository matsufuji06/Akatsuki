import { useEffect, useState } from 'react'
import { fetchProfile } from '../api/client'
import { useAuth } from '../auth/useAuth'
import type { ProfileData } from '../types'

export function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    if (user === null) {
      return
    }

    void fetchProfile(user).then(setProfile)
  }, [user])

  if (profile === null) {
    return <div className="card">プロフィールを読み込み中です...</div>
  }

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <section>
        <h1 className="page-title">プロフィール</h1>
        <p className="page-subtitle">現在の継続状況を確認できます。</p>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h2>ユーザー名</h2>
          <p className="metric" style={{ fontSize: '1.4rem' }}>
            {profile.user.name}
          </p>
        </article>
        <article className="card">
          <h2>継続率</h2>
          <p className="metric">{profile.consistencyRate}%</p>
        </article>
        <article className="card">
          <h2>利用日数</h2>
          <p className="metric">{profile.appDays}日</p>
        </article>
      </section>
    </div>
  )
}
