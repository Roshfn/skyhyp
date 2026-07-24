import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import KpiSummary from '../components/KpiSummary'
import MonthCalendar from '../components/MonthCalendar'
import { api, ApiError } from '../api/client'
import { getMonthRange, filterJournalsInRange } from '../utils/kpi'

export default function HomePage() {
  const [journals, setJournals] = useState(null)
  const [error, setError] = useState(null)
  const [visibleMonth, setVisibleMonth] = useState(() => new Date())

  useEffect(() => {
    let cancelled = false
    api
      .getJournals()
      .then((data) => {
        if (!cancelled) setJournals(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load your journal entries.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { start: monthStart, end: monthEnd } = getMonthRange(visibleMonth)
  const monthJournals = journals ? filterJournalsInRange(journals, monthStart, monthEnd) : []

  return (
    <div>
      <TopBar />
      <main className="container" style={{ padding: '32px 24px 64px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        {!journals && !error && <p>Loading…</p>}

        {journals && (
          <>
            <KpiSummary journals={journals} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: 20,
                alignItems: 'start'
              }}
            >
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 15 }}>Quick actions</h3>
                <Link to="/journals/new" className="btn btn-primary btn-block" style={{ marginBottom: 10 }}>
                  + New entry
                </Link>
                <Link to="/review" className="btn btn-secondary btn-block">
                  + Daily review
                </Link>
              </div>

              <MonthCalendar journals={monthJournals} month={visibleMonth} onMonthChange={setVisibleMonth} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
