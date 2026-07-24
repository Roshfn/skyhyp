import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { api, ApiError } from '../api/client'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function ReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dateKey = searchParams.get('date') || todayKey()

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setSaved(false)
    api
      .getReview(dateKey)
      .then((data) => {
        if (!cancelled) setContent(data.content)
      })
      .catch((err) => {
        // 404 just means no review exists yet for this date - that's fine, start blank.
        if (!cancelled && !(err instanceof ApiError && err.status === 404)) {
          setError(err.message)
        }
        if (!cancelled) setContent('')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dateKey])

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.upsertReview(dateKey, content)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your review.')
    } finally {
      setSaving(false)
    }
  }

  function handleDateChange(newDate) {
    setSearchParams({ date: newDate })
  }

  return (
    <div>
      <TopBar />
      <main className="container" style={{ padding: '32px 24px 64px', maxWidth: 700 }}>
        <h1>Daily review</h1>
        <p style={{ marginBottom: 24 }}>Reflect on the day while it's fresh.</p>

        <div className="card" style={{ padding: 24 }}>
          <div className="field">
            <label htmlFor="review-date">Date</label>
            <input
              id="review-date"
              type="date"
              value={dateKey}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {saved && !error && <div className="alert alert-success">Review saved.</div>}

          {loading ? (
            <p>Loading…</p>
          ) : (
            <form onSubmit={handleSave}>
              <div className="field">
                <label htmlFor="review-content">What happened today?</label>
                <textarea
                  id="review-content"
                  rows={10}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                    setSaved(false)
                  }}
                  placeholder="Market conditions, how you felt, what you'd do differently…"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving || !content.trim()}>
                {saving ? 'Saving…' : 'Save review'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
