import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/performance', label: 'Analytics' },
  { to: '/review', label: 'Review' },
  { to: '/trades', label: 'Trades' }
]

export default function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', background: '#ffffff' }}>
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>

          <nav style={{ display: 'flex', gap: 20 }}>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: active ? 'var(--color-sky-strong)' : 'var(--color-ink-soft)',
                    textDecoration: 'none'
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.gmail && <span style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{user.gmail}</span>}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
