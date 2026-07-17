import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { api, ApiError } from '../api/client'
import {
  SETUP_OPTIONS,
  RISK_REWARD_OPTIONS,
  DID_FOLLOW_PLAN_OPTIONS,
  EMOTION_OPTIONS,
  labelize
} from '../constants/enums'

const EMPTY_FORM = {
  setup: SETUP_OPTIONS[0],
  date: new Date().toISOString().slice(0, 10),
  derivative: '',
  entryPoint: '',
  stopLoss: '',
  target: '',
  takeProfit: '',
  riskReward: RISK_REWARD_OPTIONS[0],
  profitLoss: '',
  whyIEntered: '',
  didIFollowMyPlan: DID_FOLLOW_PLAN_OPTIONS[0],
  emotionBeforeTrade: EMOTION_OPTIONS[0],
  emotionDuringTrade: EMOTION_OPTIONS[0],
  mistakesMade: '',
  lessonsLearned: ''
}

const NUMERIC_FIELDS = ['entryPoint', 'stopLoss', 'target', 'takeProfit', 'profitLoss']

function toFormState(journal) {
  const state = { ...EMPTY_FORM }
  for (const key of Object.keys(state)) {
    if (journal[key] !== undefined && journal[key] !== null) {
      state[key] = journal[key]
    }
  }
  return state
}

function toPayload(form) {
  const payload = { ...form }
  for (const key of NUMERIC_FIELDS) {
    payload[key] = payload[key] === '' ? null : Number(payload[key])
  }
  return payload
}

export default function JournalFormPage() {
  const { journalId } = useParams()
  const isEdit = Boolean(journalId)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    api
      .getJournal(journalId)
      .then((data) => {
        if (!cancelled) setForm(toFormState(data))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load this entry.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [journalId, isEdit])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSaving(true)

    try {
      const payload = toPayload(form)
      if (isEdit) {
        await api.updateJournal(journalId, payload)
        navigate(`/journals/${journalId}`)
      } else {
        const created = await api.createJournal(payload)
        navigate(`/journals/${created.journalId}`)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.fieldErrors) setFieldErrors(err.fieldErrors)
      } else {
        setError('Could not save this entry. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar />
        <main className="container" style={{ padding: '32px 24px' }}>
          <p>Loading…</p>
        </main>
      </div>
    )
  }

  return (
    <div>
      <TopBar />
      <main className="container" style={{ padding: '32px 24px 64px', maxWidth: 760 }}>
        <Link to={isEdit ? `/journals/${journalId}` : '/'} style={{ fontSize: 13.5 }}>
          ← Back
        </Link>

        <h1 style={{ margin: '16px 0 4px' }}>{isEdit ? 'Edit entry' : 'New journal entry'}</h1>
        <p style={{ marginBottom: 24 }}>
          {isEdit ? 'Update the details of this trade.' : 'Log the details of your trade while it\'s fresh.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Trade details</h3>

            <div className="field-row">
              <div className="field">
                <label htmlFor="derivative">Instrument</label>
                <input
                  id="derivative"
                  type="text"
                  placeholder="e.g. NIFTY, RELIANCE, BTCUSD"
                  value={form.derivative}
                  onChange={(e) => updateField('derivative', e.target.value)}
                  required
                />
                {fieldErrors.derivative && <div className="field-error">{fieldErrors.derivative}</div>}
              </div>
              <div className="field">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="setup">Setup</label>
                <select id="setup" value={form.setup} onChange={(e) => updateField('setup', e.target.value)}>
                  {SETUP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelize(opt)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="riskReward">Risk : Reward</label>
                <select
                  id="riskReward"
                  value={form.riskReward}
                  onChange={(e) => updateField('riskReward', e.target.value)}
                >
                  {RISK_REWARD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelize(opt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="entryPoint">Entry point</label>
                <input
                  id="entryPoint"
                  type="number"
                  step="any"
                  value={form.entryPoint}
                  onChange={(e) => updateField('entryPoint', e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="stopLoss">Stop loss</label>
                <input
                  id="stopLoss"
                  type="number"
                  step="any"
                  value={form.stopLoss}
                  onChange={(e) => updateField('stopLoss', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="target">Target</label>
                <input
                  id="target"
                  type="number"
                  step="any"
                  value={form.target}
                  onChange={(e) => updateField('target', e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="takeProfit">Take profit</label>
                <input
                  id="takeProfit"
                  type="number"
                  step="any"
                  value={form.takeProfit}
                  onChange={(e) => updateField('takeProfit', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="profitLoss">Profit / loss</label>
              <input
                id="profitLoss"
                type="number"
                step="any"
                value={form.profitLoss}
                onChange={(e) => updateField('profitLoss', e.target.value)}
              />
              <div className="field-hint">Leave blank if the trade is still open.</div>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Mindset</h3>

            <div className="field">
              <label htmlFor="didIFollowMyPlan">Did I follow my plan?</label>
              <select
                id="didIFollowMyPlan"
                value={form.didIFollowMyPlan}
                onChange={(e) => updateField('didIFollowMyPlan', e.target.value)}
              >
                {DID_FOLLOW_PLAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {labelize(opt)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="emotionBeforeTrade">Emotion before trade</label>
                <select
                  id="emotionBeforeTrade"
                  value={form.emotionBeforeTrade}
                  onChange={(e) => updateField('emotionBeforeTrade', e.target.value)}
                >
                  {EMOTION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelize(opt)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="emotionDuringTrade">Emotion during trade</label>
                <select
                  id="emotionDuringTrade"
                  value={form.emotionDuringTrade}
                  onChange={(e) => updateField('emotionDuringTrade', e.target.value)}
                >
                  {EMOTION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelize(opt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="whyIEntered">Why I entered</label>
              <textarea
                id="whyIEntered"
                value={form.whyIEntered}
                onChange={(e) => updateField('whyIEntered', e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="mistakesMade">Mistakes made</label>
              <textarea
                id="mistakesMade"
                value={form.mistakesMade}
                onChange={(e) => updateField('mistakesMade', e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="lessonsLearned">Lessons learned</label>
              <textarea
                id="lessonsLearned"
                value={form.lessonsLearned}
                onChange={(e) => updateField('lessonsLearned', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create entry'}
            </button>
            <Link to={isEdit ? `/journals/${journalId}` : '/'} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
