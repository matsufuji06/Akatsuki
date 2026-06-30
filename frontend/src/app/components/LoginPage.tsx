import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, Sunrise } from 'lucide-react'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
      } else {
        setError('ログインに失敗しました。')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <section className="auth-card" aria-label="ログインフォーム">
        <div style={{ textAlign: 'center', marginBottom: '1.3rem' }}>
          <Sunrise size={32} color="#d45b2b" />
          <h1 className="page-title" style={{ fontSize: '2rem' }}>
            Akatsuki
          </h1>
          <p className="page-subtitle">朝活習慣を積み上げるためにログイン</p>
        </div>

        <form onSubmit={(event) => void onSubmit(event)}>
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
              autoComplete="current-password"
              required
            />
          </label>

          {error !== null && <p className="error">{error}</p>}

          <button type="submit" className="button primary" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={16} style={{ verticalAlign: 'text-bottom', marginRight: '0.4rem' }} />
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="auth-switch">
          はじめて利用しますか？ <Link to="/register">新規登録</Link>
        </p>
      </section>
    </div>
  )
}
