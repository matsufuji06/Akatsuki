import type { ReactNode } from 'react'
import { LogOut, Sunrise } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

type LayoutProps = {
  children: ReactNode
}

const navItems = [
  { path: '/', label: 'ホーム', end: true },
  { path: '/community', label: 'コミュニティ' },
  { path: '/stats', label: '統計' },
  { path: '/achievements', label: '実績' },
  { path: '/profile', label: 'プロフィール' },
]

export function Layout({ children }: LayoutProps) {
  const { logout } = useAuth()

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <Sunrise size={26} style={{ verticalAlign: 'text-bottom' }} /> Akatsuki
          </div>
          <nav className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            <button type="button" className="nav-link" onClick={logout} aria-label="ログアウト">
              <LogOut size={20} style={{ verticalAlign: 'text-bottom' }} />
            </button>
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
