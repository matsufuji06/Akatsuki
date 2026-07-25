import { type FormEvent, useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Clock, Flame } from 'lucide-react'
import { createCheckIn, fetchDashboard } from '../api/client'
import { useAuth } from '../auth/useAuth'
import type { DashboardData } from '../types'

export function DashboardPage() {
  const { token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [activity, setActivity] = useState('読書')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [note, setNote] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (token === null) {
      return
    }

    void fetchDashboard(token)
      .then((dashboard) => {
        setData(dashboard)
        updateUser(dashboard.user)
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'ダッシュボードの読み込みに失敗しました。')
      })
  }, [token, updateUser])

  async function handleCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (token === null) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      const result = await createCheckIn(token, {
        activity: activity.trim(),
        durationMinutes: Number(durationMinutes),
        note: note.trim(),
      })

      setData(result.dashboard)
      updateUser(result.dashboard.user)
      setShowForm(false)
      setSuccessMessage('今日のチェックインを記録しました。')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'チェックインに失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (data === null) {
    return (
      <div className="card" role={loadError ? 'alert' : undefined}>
        {loadError || 'ダッシュボードを読み込み中です...'}
      </div>
    )
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
          <button
            type="button"
            className="button ghost"
            disabled={!data.canCheckInNow}
            onClick={() => {
              setShowForm((current) => !current)
              setSubmitError('')
              setSuccessMessage('')
            }}
          >
            {data.checkedInToday ? 'チェックイン済み' : 'チェックインする'}
          </button>
        </div>
      </section>

      {successMessage && (
        <p className="success-message" role="status">
          <CheckCircle2 size={18} />
          {successMessage}
        </p>
      )}

      {showForm && data.canCheckInNow && (
        <section className="card checkin-card" aria-labelledby="checkin-form-title">
          <h2 id="checkin-form-title">今日の朝活を記録</h2>
          <p className="page-subtitle">取り組んだ内容と時間を入力してください。</p>
          <form onSubmit={(event) => void handleCheckIn(event)}>
            <label className="field">
              <span>活動内容</span>
              <input
                name="activity"
                value={activity}
                onChange={(event) => setActivity(event.target.value)}
                list="activity-suggestions"
                maxLength={100}
                required
                autoFocus
              />
              <datalist id="activity-suggestions">
                <option value="読書" />
                <option value="運動" />
                <option value="勉強" />
                <option value="瞑想" />
                <option value="創作" />
              </datalist>
            </label>
            <label className="field">
              <span>活動時間（分）</span>
              <input
                name="durationMinutes"
                type="number"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                min={1}
                max={1440}
                required
              />
            </label>
            <label className="field">
              <span>ひとこと（任意）</span>
              <textarea
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="今日の気づきや達成したこと"
              />
            </label>
            {submitError && (
              <p className="error" role="alert">
                {submitError}
              </p>
            )}
            <div className="checkin-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button type="submit" className="button primary" disabled={isSubmitting}>
                {isSubmitting ? '記録中...' : '記録する'}
              </button>
            </div>
          </form>
        </section>
      )}

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
          {data.todayCheckIn?.note && <p className="checkin-note">{data.todayCheckIn.note}</p>}
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
