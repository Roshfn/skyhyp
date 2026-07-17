import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import PnlText from '../components/PnlText'
import { api, ApiError } from '../api/client'
import { labelize } from '../constants/enums'

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14.5 }}>{children || <span style={{ color: 'var(--color-ink-faint)' }}>—</span>}</div>
    </div>
  )
}

export default function JournalDetailPage() {
  const { journalId } = useParams()
  const navigate = useNavigate()

  const [journal, setJournal] = useState(null)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getJournal(journalId)
      .then((data) => {
        if (!cancelled) setJournal(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load this entry.')
      })
    return () => {
      cancelled = true
    }
  }, [journalId])

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.deleteJournal(journalId)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete this entry.')
      setDeleting(false)
    }
  }

  return (
    <div>
      <TopBar />
      <main className="container" style={{ padding: '32px 24px 64px', maxWidth: 760 }}>
        <Link to="/" style={{ fontSize: 13.5 }}>
          ← Back to journal
        </Link>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

        {journal && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                margin: '16px 0 24px'
              }}
            >
              <div>
                <h1>{journal.derivative}</h1>
                <p className="mono">{journal.date}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/journals/${journal.journalId}/edit`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
                {!confirmingDelete ? (
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmingDelete(true)}>
                    Delete
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirmingDelete(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting…' : 'Confirm delete'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div className="field-row" style={{ marginBottom: 4 }}>
                <Field label="Setup">
                  <span className="badge badge-sky">{labelize(journal.setup)}</span>
                </Field>
                <Field label="Risk : Reward">{labelize(journal.riskReward)}</Field>
              </div>

              <div className="field-row">
                <Field label="Entry point">
                  <span className="mono">{journal.entryPoint}</span>
                </Field>
                <Field label="Stop loss">
                  <span className="mono">{journal.stopLoss}</span>
                </Field>
              </div>

              <div className="field-row">
                <Field label="Target">
                  <span className="mono">{journal.target}</span>
                </Field>
                <Field label="Take profit">
                  <span className="mono">{journal.takeProfit ?? '—'}</span>
                </Field>
              </div>

              <Field label="Profit / loss">
                <PnlText value={journal.profitLoss} />
              </Field>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div className="field-row">
                <Field label="Did I follow my plan?">{labelize(journal.didIFollowMyPlan)}</Field>
                <Field label="" />
              </div>
              <div className="field-row">
                <Field label="Emotion before trade">{labelize(journal.emotionBeforeTrade)}</Field>
                <Field label="Emotion during trade">{labelize(journal.emotionDuringTrade)}</Field>
              </div>
              <Field label="Why I entered">{journal.whyIEntered}</Field>
              <Field label="Mistakes made">{journal.mistakesMade}</Field>
              <Field label="Lessons learned">{journal.lessonsLearned}</Field>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
