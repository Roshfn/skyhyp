import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import AuthLayout from '../components/AuthLayout'
import { api, ApiError } from '../api/client'

const STEPS = {
  EMAIL: 1,
  OTP: 2,
  DETAILS: 3
}

export default function SignupPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(STEPS.EMAIL)
  const [gmail, setGmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleApiError(err) {
    if (err instanceof ApiError) {
      setError(err.message)
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  async function handleSendCode(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.registerInitiate(gmail)
      setStep(STEPS.OTP)
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.registerVerifyEmail(gmail, otp)
      setStep(STEPS.DETAILS)
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteSignup(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.registerComplete({ gmail, name, password, confirmPassword })
      navigate('/login', { state: { justRegistered: true } })
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 8 }}>
        <Logo size={26} />
      </div>
      <h1>Create your account</h1>
      <p style={{ marginBottom: 8 }}>
        Step {step} of 3 —{' '}
        {step === STEPS.EMAIL ? 'verify your email' : step === STEPS.OTP ? 'enter the code' : 'set up your login'}
      </p>

      {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

      {step === STEPS.EMAIL && (
        <form onSubmit={handleSendCode} style={{ marginTop: 20 }}>
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
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending code…' : 'Send verification code'}
          </button>
        </form>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={handleVerifyOtp} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="otp">6-digit code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />
            <div className="field-hint">Sent to {gmail}. Expires in 10 minutes.</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: 10 }}
            onClick={() => setStep(STEPS.EMAIL)}
          >
            Use a different email
          </button>
        </form>
      )}

      {step === STEPS.DETAILS && (
        <form onSubmit={handleCompleteSignup} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="name">Username</label>
            <input
              id="name"
              type="text"
              minLength={3}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="field-hint">At least 8 characters.</div>
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      <p style={{ marginTop: 20, fontSize: 13.5, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
