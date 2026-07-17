import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'
import AuthLayout from '../components/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered

  const [gmail, setGmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(gmail, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 8 }}>
        <Logo size={26} />
      </div>
      <h1>Welcome to skyhyp</h1>
      <p style={{ marginBottom: 28 }}>Log in to your trading journal.</p>

      {justRegistered && !error && (
        <div className="alert alert-success">Account created. Log in to continue.</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="gmail">Email</label>
          <input
            id="gmail"
            type="email"
            autoComplete="email"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13.5, textAlign: 'center' }}>
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthLayout>
  )
}
