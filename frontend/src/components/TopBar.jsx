import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

export default function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: '#ffffff'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.gmail && (
            <span style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{user.gmail}</span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
