import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import JournalCard from '../components/JournalCard'
import PnlHeatmap from '../components/PnlHeatmap'
import { api, ApiError } from '../api/client'

export default function DashboardPage() {
  const [journals, setJournals] = useState(null)
  const [error, setError] = useState(null)
  const [heatmapData, setHeatmapData] = useState(null)

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

  useEffect(() => {
    let cancelled = false
    api
      .getHeatmap()
      .then((data) => {
        if (!cancelled) setHeatmapData(data)
      })
      .catch(() => {
        // Non-critical for the page - fail quietly and just show an empty grid.
        if (!cancelled) setHeatmapData([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totalPnl =
    journals?.reduce((sum, j) => sum + (Number(j.profitLoss) || 0), 0) ?? null

  return (
    <div>
      <TopBar />
      <main className="container" style={{ padding: '32px 24px 64px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 24
          }}
        >
          <div>
            <h1>Your journal</h1>
            <p>
              {journals ? `${journals.length} ${journals.length === 1 ? 'entry' : 'entries'}` : 'Loading…'}
              {totalPnl !== null && journals?.length > 0 && (
                <>
                  {' · Total P&L '}
                  <span
                    className="mono"
                    style={{ color: totalPnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}
                  >
                    {totalPnl >= 0 ? '+' : ''}
                    {totalPnl.toFixed(2)}
                  </span>
                </>
              )}
            </p>
          </div>
          <Link to="/journals/new" className="btn btn-primary">
            + New entry
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <PnlHeatmap data={heatmapData} />

        {journals && journals.length === 0 && !error && (
          <div
            className="card"
            style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-ink-soft)' }}
          >
            <h3 style={{ fontStyle: 'italic' }}>No entries yet</h3>
            <p>Log your first trade to start tracking your setups, emotions, and outcomes.</p>
            <Link to="/journals/new" className="btn btn-primary" style={{ marginTop: 8 }}>
              Add your first entry
            </Link>
          </div>
        )}

        {journals &&
          journals.length > 0 &&
          journals.map((journal) => <JournalCard key={journal.journalId} journal={journal} />)}
      </main>
    </div>
  )
}
