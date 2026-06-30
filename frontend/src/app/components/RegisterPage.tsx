import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Sunrise, UserPlus } from 'lucide-react'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

type LocationState = {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fromLocation = (location.state as LocationState | null)?.from
  const from = fromLocation
    ? `${fromLocation.pathname ?? '/'}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`
    : '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません。')
      return
    }

    setLoading(true)

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate(from, { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
      } else {
        setError('新規登録に失敗しました。')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <section className="auth-card" aria-label="新規登録フォーム">
        <div style={{ textAlign: 'center', marginBottom: '1.3rem' }}>
          <Sunrise size={32} color="#d45b2b" />
          <h1 className="page-title" style={{ fontSize: '2rem' }}>
            Akatsuki
          </h1>
          <p className="page-subtitle">朝活を始めるためのアカウントを作成</p>
        </div>

        <form onSubmit={(event) => void onSubmit(event)}>
          <label className="field">
            表示名
            <input
              aria-label="表示名"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              minLength={2}
              maxLength={30}
              required
            />
          </label>

          <label className="field">
            メールアドレス
            <input
              aria-label="メールアドレス"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            パスワード
            <input
              aria-label="パスワード"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label className="field">
            パスワード（確認）
            <input
              aria-label="パスワード（確認）"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error !== null && <p className="error">{error}</p>}

          <button type="submit" className="button primary" style={{ width: '100%' }} disabled={loading}>
            <UserPlus size={16} style={{ verticalAlign: 'text-bottom', marginRight: '0.4rem' }} />
            {loading ? '登録中...' : '新規登録'}
          </button>
        </form>

        <p className="auth-switch">
          すでにアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
        </p>
      </section>
    </div>
  )
}
